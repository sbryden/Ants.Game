import { Ant } from '../Ant';
import { PheromoneGrid } from '../PheromoneGrid';
import { PheromoneType } from '../PheromoneType';

/**
 * Pheromone behavior configuration
 * Controls how ants sense and follow pheromone gradients
 */
export interface PheromoneBehaviorConfig {
  /**
   * Distance in pixels to sample pheromones in each direction
   * Larger = ants sense further but less precisely
   */
  sampleDistance: number;

  /**
   * Strength of pheromone influence on movement (0-1)
   * 0 = ignore pheromones completely
   * 1 = follow pheromone gradient perfectly (greedy)
   */
  followStrength: number;

  /**
   * Randomness factor for pheromone following (0-1)
   * 0 = purely greedy (always choose best direction)
   * 1 = random (never follow pheromones)
   * Values between add randomness (e.g., 0.2 = 20% chance to explore randomly)
   */
  explorationRandomness: number;
}

/**
 * Represents pheromone readings in 8 compass directions
 */
export interface GradientSamples {
  /**
   * Samples indexed by direction:
   * 0 = North, 1 = NE, 2 = East, 3 = SE, 4 = South, 5 = SW, 6 = West, 7 = NW
   * Each sample is the pheromone strength at that distance in that direction
   */
  samples: number[];

  /**
   * Highest concentration found (0-1 normalized)
   */
  maxConcentration: number;
}

/**
 * Direction angles in radians for 8-compass sampling
 * Used as offsets from ant's current direction
 */
const SAMPLE_DIRECTIONS = [
  0,                    // North (up)
  Math.PI / 4,          // NE
  Math.PI / 2,          // East
  (3 * Math.PI) / 4,    // SE
  Math.PI,              // South (down)
  (-3 * Math.PI) / 4,   // SW
  (-Math.PI) / 2,       // West
  (-Math.PI) / 4,       // NW
];

/**
 * Sample pheromone gradient in 8 compass directions
 * Returns normalized concentrations (max is capped at 1.0 for comparison)
 * 
 * @param ant - Ant doing the sampling
 * @param grid - Pheromone grid to sample from
 * @param type - Pheromone type to sense
 * @param sampleDistance - How far to sample in each direction (pixels)
 * @returns GradientSamples with readings in all 8 directions
 */
export function samplePheromoneGradient(
  ant: Ant,
  grid: PheromoneGrid,
  type: PheromoneType,
  sampleDistance: number
): GradientSamples {
  const samples: number[] = [];
  let maxConcentration = 0;

  for (const direction of SAMPLE_DIRECTIONS) {
    // Sample position in this direction
    const sampleX = ant.x + Math.cos(direction) * sampleDistance;
    const sampleY = ant.y + Math.sin(direction) * sampleDistance;

    // Get pheromone strength at this location
    const strength = grid.sample(sampleX, sampleY, type);
    samples.push(strength);

    // Track maximum concentration found
    if (strength > maxConcentration) {
      maxConcentration = strength;
    }
  }

  // Normalize max concentration for comparison (cap at 1.0)
  const normalizedMax = Math.min(maxConcentration, 1.0);

  return {
    samples,
    maxConcentration: normalizedMax,
  };
}

/**
 * Calculate the direction of strongest pheromone gradient from samples
 * Returns angle in radians pointing toward highest concentration
 * Returns null if no meaningful gradient (flat/low signal)
 * 
 * @param samples - Gradient samples from 8 directions
 * @param threshold - Minimum concentration to consider (0-1)
 * @returns Angle in radians (0 = East, PI/2 = South) or null if below threshold
 */
export function calculateGradientDirection(
  samples: GradientSamples,
  threshold: number = 0.01
): number | null {
  // Ignore very weak signals
  if (samples.maxConcentration < threshold) {
    return null;
  }

  // Find the direction with highest pheromone concentration
  let maxIndex = 0;
  let maxStrength = samples.samples[0];

  for (let i = 1; i < samples.samples.length; i++) {
    if (samples.samples[i] > maxStrength) {
      maxStrength = samples.samples[i];
      maxIndex = i;
    }
  }

  // Return the angle of the strongest direction
  return SAMPLE_DIRECTIONS[maxIndex];
}

/**
 * Apply pheromone gradient influence to ant's movement
 * Blends pheromone-suggested direction with random wandering
 * Preserves obstacle avoidance (called after avoidance decisions)
 * 
 * @param ant - Ant to apply influence to
 * @param gradientDirection - Direction to strongest pheromone (radians), or null for no gradient
 * @param baseSpeed - Ant's normal movement speed (pixels/second)
 * @param config - Pheromone behavior configuration
 */
export function followPheromone(
  ant: Ant,
  gradientDirection: number | null,
  baseSpeed: number,
  config: PheromoneBehaviorConfig
): void {
  // If no gradient detected or randomness wins, pick random direction
  if (
    gradientDirection === null ||
    Math.random() < config.explorationRandomness
  ) {
    // Random wandering (exploration)
    const randomAngle = Math.random() * Math.PI * 2;
    const randomVx = Math.cos(randomAngle) * baseSpeed;
    const randomVy = Math.sin(randomAngle) * baseSpeed;

    // Blend with current target velocity
    ant.targetVx = randomVx;
    ant.targetVy = randomVy;
    return;
  }

  // Follow pheromone gradient
  const pheromoneVx = Math.cos(gradientDirection) * baseSpeed;
  const pheromoneVy = Math.sin(gradientDirection) * baseSpeed;

  // Blend pheromone direction with some randomness (adds natural variation)
  // This prevents ants from being 100% locked to the trail
  const blendFactor = config.followStrength;

  // Small random component added to movement for natural behavior
  const jitterAngle = (Math.random() - 0.5) * Math.PI * 0.2; // ±18°
  const jitterVx = Math.cos(jitterAngle) * baseSpeed * (1 - blendFactor) * 0.3;
  const jitterVy = Math.sin(jitterAngle) * baseSpeed * (1 - blendFactor) * 0.3;

  ant.targetVx = pheromoneVx * blendFactor + jitterVx;
  ant.targetVy = pheromoneVy * blendFactor + jitterVy;
}

/**
 * Combine pheromone-following with the ant's existing random wandering
 * This is the complete integration point for pheromone behavior in FORAGING state
 * 
 * Strategy:
 * 1. Sample pheromone gradient (where's the signal?)
 * 2. Calculate direction to strongest concentration
 * 3. Apply influence, with randomness for exploration
 * 4. Blend with current movement for smooth behavior
 * 
 * @param ant - Ant to update
 * @param grid - Pheromone grid to sample from
 * @param type - Which pheromone type to follow (usually FOOD when foraging)
 * @param baseSpeed - Base movement speed
 * @param config - Pheromone behavior configuration
 */
export function updateForagingWithPheromones(
  ant: Ant,
  grid: PheromoneGrid,
  type: PheromoneType,
  baseSpeed: number,
  config: PheromoneBehaviorConfig
): void {
  // Sample pheromone in all directions
  const gradient = samplePheromoneGradient(ant, grid, type, config.sampleDistance);

  // Calculate which direction has strongest pheromone
  const gradientDirection = calculateGradientDirection(gradient, 0.01);

  // Apply pheromone influence (with randomness for exploration)
  followPheromone(ant, gradientDirection, baseSpeed, config);
}
