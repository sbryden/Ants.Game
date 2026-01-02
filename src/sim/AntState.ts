/**
 * Ant states for behavior management
 * States determine current ant activity
 * 
 * Extension point: Future phases will add task-specific states
 */
export enum AntState {
  IDLE = 'IDLE',
  MOVING = 'MOVING',
  
  // Extension points for future states (Phase 2+):
  // FORAGING = 'FORAGING',      // Searching for food
  // CARRYING = 'CARRYING',      // Carrying food or resources
  // RETURNING = 'RETURNING',    // Returning to colony with resources
  // FOLLOWING_TRAIL = 'FOLLOWING_TRAIL',  // Following pheromone trail
  // FIGHTING = 'FIGHTING',      // In combat
  // BUILDING = 'BUILDING',      // Construction behavior
}
