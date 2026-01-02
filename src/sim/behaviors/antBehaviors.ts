import { Ant } from '../Ant';
import { AntState } from '../AntState';
import { World } from '../World';

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
