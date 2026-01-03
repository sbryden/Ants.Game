/**
 * Ant trait system - numeric profiles that influence behavior
 * All ants are workers, but they specialize over time through experience
 * 
 * Core Principle: Ants become better at what they do most
 */

/**
 * Task-specific affinity multipliers
 * Higher values mean better performance and preference for that task
 * Range: 0.5 to 2.0 (1.0 is baseline)
 */
export interface TaskAffinity {
  gathering: number; // Food foraging and collection
  nursing: number;   // Staying near colony, tending to colony needs
  digging: number;   // Future: Terrain modification
  building: number;  // Future: Construction behavior
}

/**
 * Complete trait profile for an ant
 * All traits are multipliers (1.0 is baseline, >1.0 is better, <1.0 is worse)
 */
export interface AntTraits {
  /**
   * Task affinity multipliers
   * Influences task selection probability and performance
   */
  taskAffinity: TaskAffinity;

  /**
   * Movement speed multiplier (0.7-1.3)
   * Applied to base movement speed
   */
  movementSpeed: number;

  /**
   * Carry capacity multiplier (0.8-1.5)
   * Applied to base carry capacity
   */
  carryCapacity: number;

  /**
   * Energy efficiency multiplier (0.8-1.2)
   * Lower is better - applied to energy consumption rates
   */
  energyEfficiency: number;

  /**
   * Pheromone sensitivity multiplier (0.5-1.5)
   * Affects strength of pheromone gradient following
   */
  pheromoneSensitivity: number;

  /**
   * Wandering radius preference (0.5-2.0)
   * Influences exploration distance from colony
   */
  wanderingRadius: number;
}

/**
 * Initialize traits for a new ant
 * Starts near baseline with small random variance
 * 
 * @param variance - Random variance to apply to baseline (default: 0.1)
 * @returns New trait profile with slight random variation
 */
export function initializeTraits(variance: number = 0.1): AntTraits {
  const randomVariance = () => 1.0 + (Math.random() - 0.5) * 2 * variance;

  return {
    taskAffinity: {
      gathering: randomVariance(),
      nursing: randomVariance(),
      digging: randomVariance(),
      building: randomVariance(),
    },
    movementSpeed: randomVariance(),
    carryCapacity: randomVariance(),
    energyEfficiency: randomVariance(),
    pheromoneSensitivity: randomVariance(),
    wanderingRadius: randomVariance(),
  };
}

/**
 * Clamp a trait value to valid range
 * Prevents traits from going outside bounds
 * 
 * @param value - Trait value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Clamped value
 */
export function clampTrait(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
