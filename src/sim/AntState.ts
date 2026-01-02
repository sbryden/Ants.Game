/**
 * Ant states for behavior management
 * States determine current ant activity and future expansion for task assignment
 */
export enum AntState {
  IDLE = 'IDLE',
  MOVING = 'MOVING',
  // TODO: Future states: FORAGING, CARRYING, RETURNING, FIGHTING, BUILDING
}
