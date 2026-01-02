/**
 * Extension points for future simulation systems
 * 
 * These types and interfaces define the structure for systems that will be
 * implemented in future phases. They document the intended design without
 * adding functionality.
 * 
 * DO NOT implement these yet - they are placeholders for Phase 2+
 */

/**
 * Future: Pheromone types that ants can detect and follow
 * Phase 2+ will implement pheromone trails, decay, and diffusion
 */
export enum PheromoneType {
  // FOOD_TRAIL = 'FOOD_TRAIL',
  // HOME_TRAIL = 'HOME_TRAIL',
  // DANGER_WARNING = 'DANGER_WARNING',
  // EXPLORATION = 'EXPLORATION',
}

/**
 * Future: Ant roles that determine behavior priorities
 * Phase 2+ will implement role-based behavior selection
 */
export enum AntRole {
  // WORKER = 'WORKER',
  // SCOUT = 'SCOUT',
  // SOLDIER = 'SOLDIER',
  // NURSE = 'NURSE',
}

/**
 * Future: Trait system for individual ant variation
 * Phase 2+ will implement genetic traits affecting speed, strength, perception
 */
export interface AntTraits {
  // speed: number;
  // strength: number;
  // perceptionRange: number;
}

/**
 * Future: Task/goal system for coordinated behavior
 * Phase 2+ will implement task assignment and completion
 */
export interface AntTask {
  // type: 'FORAGE' | 'BUILD' | 'DEFEND' | 'EXPLORE';
  // targetX: number;
  // targetY: number;
  // priority: number;
}

/**
 * Future: Pheromone detection data for ant perception
 * Phase 2+ will implement pheromone sensing and following
 */
export interface PheromoneReading {
  // type: PheromoneType;
  // strength: number;
  // directionX: number;
  // directionY: number;
}
