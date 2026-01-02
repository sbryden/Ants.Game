import { Ant } from '../Ant';
import { AntState } from '../AntState';
import { World } from '../World';
import { Obstacle } from '../Obstacle';
import { PerceptionData } from './PerceptionData';
import { PheromoneType } from '../PheromoneType';
import { samplePheromoneGradient } from './pheromoneBehaviors';

/**
 * Pure behavior functions for ants
 * All functions take ant + world state as input and return new state
 * No side effects - ant state is mutated by the caller (simulation system)
 */

/**
 * Movement behavior configuration
 * Extension point: In the future, these could come from traits or colony upgrades
 */
export interface MovementConfig {
  speed: number; // pixels per second
  changeDirectionInterval: number; // seconds between direction changes
  turnSpeed: number; // How quickly ant can change direction (0-1, lower = slower turns)
}

/**
 * Apply random wandering movement to an ant
 * Updates target velocity to a random direction at configured speed
 * Actual velocity will interpolate toward target (smooth turning)
 * 
 * Extension point: Future behaviors (pheromone following, pathfinding) can replace this
 */
export function applyRandomWander(ant: Ant, config: MovementConfig): void {
  const angle = Math.random() * Math.PI * 2;
  ant.targetVx = Math.cos(angle) * config.speed;
  ant.targetVy = Math.sin(angle) * config.speed;
}

/**
 * Move ant towards a target point at configured speed
 * Sets target velocity (actual velocity will interpolate)
 * Used for returning home or goal-directed movement
 */
export function moveTowardsPoint(
  ant: Ant,
  targetX: number,
  targetY: number,
  config: MovementConfig
): void {
  const dx = targetX - ant.x;
  const dy = targetY - ant.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0) {
    // Normalize direction and apply speed
    ant.targetVx = (dx / distance) * config.speed;
    ant.targetVy = (dy / distance) * config.speed;
  }
}

/**
 * Check if ant is near a target point
 * Returns true if within threshold distance
 */
export function isNearPoint(
  ant: Ant,
  targetX: number,
  targetY: number,
  threshold: number = 10
): boolean {
  const dx = targetX - ant.x;
  const dy = targetY - ant.y;
  const distanceSquared = dx * dx + dy * dy;
  return distanceSquared < threshold * threshold;
}

/**
 * Apply inertia/smooth turning to ant movement
 * Interpolates current velocity toward target velocity
 * Creates realistic turning behavior instead of instant direction changes
 * 
 * @param ant - Ant to apply inertia to
 * @param config - Movement configuration with turnSpeed
 * @param deltaTime - Time step for interpolation
 */
export function applyInertia(
  ant: Ant,
  config: MovementConfig,
  deltaTime: number
): void {
  // Lerp factor based on turn speed and delta time
  // Lower turnSpeed = slower, more gradual turns
  const lerpFactor = Math.min(1, config.turnSpeed * deltaTime * 10);

  // Interpolate toward target velocity
  ant.vx += (ant.targetVx - ant.vx) * lerpFactor;
  ant.vy += (ant.targetVy - ant.vy) * lerpFactor;
}

/**
 * Update ant position based on current velocity
 * Simple Euler integration for MVP
 * 
 * Extension point: Future collision detection or terrain effects could modify this
 */
export function updatePosition(ant: Ant, deltaTime: number): void {
  ant.x += ant.vx * deltaTime;
  ant.y += ant.vy * deltaTime;
}

/**
 * Keep ant within world boundaries
 * Simple bounce behavior - reverses velocity when hitting walls
 * 
 * Extension point: Future terrain system could provide different boundary behaviors
 */
export function constrainToWorld(ant: Ant, world: World): void {
  if (ant.x < 0 || ant.x > world.width) {
    ant.vx *= -1;
    ant.x = Math.max(0, Math.min(world.width, ant.x));
  }

  if (ant.y < 0 || ant.y > world.height) {
    ant.vy *= -1;
    ant.y = Math.max(0, Math.min(world.height, ant.y));
  }
}

/**
 * Determine if ant should change direction based on time since last change
 * Returns true if direction should change
 * 
 * Extension point: Future decision-making could incorporate pheromones, threats, goals
 */
export function shouldChangeDirection(
  timeSinceLastChange: number,
  config: MovementConfig
): boolean {
  return timeSinceLastChange >= config.changeDirectionInterval;
}

/**
 * Initialize ant movement if currently idle
 * 
 * Extension point: Future task assignment system could replace this
 */
export function initializeMovementIfIdle(ant: Ant, config: MovementConfig): void {
  if (ant.state === AntState.IDLE) {
    applyRandomWander(ant, config);
  }
}

/**
 * Detect nearby obstacles within perception range
 * Returns the closest obstacle that the ant is heading towards, or null if none found
 * 
 * @param ant - Ant to check for obstacles
 * @param world - World containing obstacles
 * @param perceptionRange - How far the ant can "see" obstacles
 */
export function detectObstacles(
  ant: Ant,
  world: World,
  perceptionRange: number
): Obstacle | null {
  const nearbyObstacles = world.getObstaclesNear(ant.x, ant.y, perceptionRange);

  if (nearbyObstacles.length === 0) {
    return null;
  }

  // Find the closest obstacle the ant is heading towards
  let closestObstacle: Obstacle | null = null;
  let closestDistance = Infinity;

  // Current velocity direction (normalized)
  const speed = Math.sqrt(ant.vx * ant.vx + ant.vy * ant.vy);
  if (speed === 0) {
    return null; // Ant not moving, no collision imminent
  }
  const dirX = ant.vx / speed;
  const dirY = ant.vy / speed;

  for (const obstacle of nearbyObstacles) {
    const dx = obstacle.x - ant.x;
    const dy = obstacle.y - ant.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if ant is heading towards this obstacle (dot product > 0)
    const dotProduct = (dx * dirX + dy * dirY) / distance;
    if (dotProduct > 0.5) {
      // Heading toward obstacle
      if (distance < closestDistance) {
        closestDistance = distance;
        closestObstacle = obstacle;
      }
    }
  }

  return closestObstacle;
}

/**
 * Apply steering force to avoid an obstacle
 * Modifies target velocity to steer away from the obstacle
 * Uses a simple tangent-based avoidance strategy
 * 
 * @param ant - Ant that needs to avoid obstacle
 * @param obstacle - Obstacle to avoid
 * @param config - Movement configuration for speed
 */
export function avoidObstacle(
  ant: Ant,
  obstacle: Obstacle,
  config: MovementConfig
): void {
  const dx = obstacle.x - ant.x;
  const dy = obstacle.y - ant.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return; // Ant exactly on obstacle center (shouldn't happen)

  // Calculate perpendicular direction (tangent to obstacle)
  // This steers the ant around the obstacle rather than directly away
  const perpX = -dy;
  const perpY = dx;

  // Choose direction (left or right) that better matches current heading
  const currentDot = (ant.vx * perpX + ant.vy * perpY) / distance;
  const sign = currentDot >= 0 ? 1 : -1;

  // Set target velocity to steer around obstacle
  ant.targetVx = sign * (perpX / distance) * config.speed;
  ant.targetVy = sign * (perpY / distance) * config.speed;
}

/**
 * Resolve collision if ant is inside an obstacle
 * Pushes ant out to the nearest edge of the obstacle
 * 
 * @param ant - Ant to check and resolve collision for
 * @param world - World containing obstacles
 */
export function resolveObstacleCollisions(ant: Ant, world: World): void {
  const nearbyObstacles = world.getObstaclesNear(ant.x, ant.y, 100); // Check nearby

  for (const obstacle of nearbyObstacles) {
    if (obstacle.containsPoint(ant.x, ant.y)) {
      // Ant is inside obstacle - push it out
      const dx = ant.x - obstacle.x;
      const dy = ant.y - obstacle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance === 0) {
        // Ant exactly at obstacle center - push in random direction
        const angle = Math.random() * Math.PI * 2;
        ant.x = obstacle.x + Math.cos(angle) * (obstacle.radius + 1);
        ant.y = obstacle.y + Math.sin(angle) * (obstacle.radius + 1);
      } else {
        // Push ant out along the line from obstacle center to ant
        const normalX = dx / distance;
        const normalY = dy / distance;
        ant.x = obstacle.x + normalX * (obstacle.radius + 1);
        ant.y = obstacle.y + normalY * (obstacle.radius + 1);
      }

      // Stop ant from moving further into obstacle
      // (zero out velocity component toward obstacle)
      const dotProduct = ant.vx * dx + ant.vy * dy;
      if (dotProduct < 0) {
        // Velocity is toward obstacle, remove that component
        ant.vx -= (dotProduct / (distance * distance)) * dx;
        ant.vy -= (dotProduct / (distance * distance)) * dy;
        ant.targetVx = ant.vx;
        ant.targetVy = ant.vy;
      }
    }
  }
}

/**
 * Gather all sensory information available to an ant from its environment.
 * This creates a PerceptionData snapshot that can be used by decision-making systems.
 * 
 * Phase 1: Obstacles and spatial awareness (home direction/distance)
 * Phase 2: Pheromone gradient sensing (8-directional sampling)
 * 
 * Extension point: Future perception will include food, other ants, threats, etc.
 * 
 * @param ant - The ant perceiving the environment
 * @param world - The world being perceived
 * @param pheromoneSampleDistance - Distance to sample pheromones (pixels)
 */
export function perceiveEnvironment(
  ant: Ant,
  world: World,
  pheromoneSampleDistance: number
): PerceptionData {
  // Get obstacles within perception range
  const nearbyObstacles = world.getObstaclesNear(ant.x, ant.y, ant.perceptionRange);

  // Find nearest obstacle
  let nearestObstacleDistance = Infinity;
  for (const obstacle of nearbyObstacles) {
    const distance = obstacle.distanceToEdge(ant.x, ant.y);
    if (distance < nearestObstacleDistance) {
      nearestObstacleDistance = distance;
    }
  }

  // Get colony for home awareness
  const colony = world.getColony(ant.colonyId);
  let distanceToHome = 0;
  let directionToHome = 0;
  
  if (colony) {
    const dx = colony.x - ant.x;
    const dy = colony.y - ant.y;
    distanceToHome = Math.sqrt(dx * dx + dy * dy);
    directionToHome = Math.atan2(dy, dx);
  }

  // Sample pheromone gradients in all 8 directions
  const pheromoneGradients = new Map<PheromoneType, any>();
  pheromoneGradients.set(
    PheromoneType.FOOD,
    samplePheromoneGradient(ant, world.pheromoneGrid, PheromoneType.FOOD, pheromoneSampleDistance)
  );
  pheromoneGradients.set(
    PheromoneType.NEST,
    samplePheromoneGradient(ant, world.pheromoneGrid, PheromoneType.NEST, pheromoneSampleDistance)
  );
  pheromoneGradients.set(
    PheromoneType.DANGER,
    samplePheromoneGradient(ant, world.pheromoneGrid, PheromoneType.DANGER, pheromoneSampleDistance)
  );

  return {
    nearbyObstacles,
    nearestObstacleDistance,
    distanceToHome,
    directionToHome,
    pheromoneGradients,
  };
}
