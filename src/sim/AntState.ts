/**
 * Ant states for behavior management
 * States determine current ant activity
 * 
 * Extension point: Future phases will add task-specific states
 */
export enum AntState {
  IDLE = 'IDLE',
  WANDERING = 'WANDERING',  // Random exploration
  FORAGING = 'FORAGING',    // Searching for food (Phase 4 will use this fully)
  RETURNING = 'RETURNING',  // Returning to colony
  
  // Extension points for future states (Phase 2+):
  // CARRYING = 'CARRYING',      // Carrying food or resources
  // FOLLOWING_TRAIL = 'FOLLOWING_TRAIL',  // Following pheromone trail
  // FIGHTING = 'FIGHTING',      // In combat
  // BUILDING = 'BUILDING',      // Construction behavior
}
