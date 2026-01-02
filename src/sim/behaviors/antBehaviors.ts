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
}

/**
 * Apply random wandering movement to an ant
 * Updates velocity to a random direction at configured speed
 * 
 * Extension point: Future behaviors (pheromone following, pathfinding) can replace this
 */
export function applyRandomWander(ant: Ant, config: MovementConfig): void {
  const angle = Math.random() * Math.PI * 2;
  ant.vx = Math.cos(angle) * config.speed;
  ant.vy = Math.sin(angle) * config.speed;
  ant.state = AntState.MOVING;
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
