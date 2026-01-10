import { Ant } from '../Ant';
import { Entrance } from '../Entrance';
import { AntState } from '../AntState';
import { Colony } from '../Colony';

/**
 * Layer transition logic for ants moving between surface and underground.
 * 
 * Ants transition through the entrance when:
 * - Foraging ants exit to surface (searching for food)
 * - Returning ants enter underground (depositing food)
 * - Idle/wandering ants move randomly between layers
 */

const ENTRANCE_PROXIMITY_THRESHOLD = 20; // Distance to trigger transition
const TRANSITION_COOLDOWN = 3.0; // Seconds to wait before allowing another transition

/**
 * Check if an ant is near the entrance and should transition.
 * Returns true if ant is close enough to entrance to trigger transition.
 */
export function isNearEntrance(ant: Ant, entrance: Entrance): boolean {
  const dx = ant.x - entrance.surfaceX;
  const dy = ant.y - entrance.surfaceY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < ENTRANCE_PROXIMITY_THRESHOLD;
}

/**
 * Determine if an ant should enter underground based on its state.
 * 
 * Rules:
 * - RETURNING ants (carrying food) should enter to deposit food
 * - IDLE ants rarely enter (5% chance - most rest on surface)
 * - WANDERING ants rarely enter (8% chance - most explore surface)
 * - FORAGING ants stay on surface (looking for food)
 * 
 * Design: Keep most ants on surface for foraging efficiency.
 * Underground should be primarily for food storage and nursery.
 */
export function shouldEnterUnderground(ant: Ant): boolean {
  switch (ant.state) {
    case 'RETURNING':
      return true; // Always enter when returning with food
    case 'IDLE':
      return Math.random() < 0.05; // 5% chance (was 20%)
    case 'WANDERING':
      return Math.random() < 0.08; // 8% chance (was 30%)
    case 'FORAGING':
      return false; // Stay on surface to forage
    default:
      return false;
  }
}

/**
 * Determine if an ant should exit to surface based on its state.
 * 
 * Rules:
 * - FORAGING ants should exit (looking for food on surface)
 * - IDLE ants frequently exit (60% chance - prefer surface)
 * - WANDERING ants frequently exit (70% chance - prefer exploration)
 * - RETURNING ants stay underground until food deposited
 * 
 * Design: Push ants toward surface to maintain foraging workforce.
 */
export function shouldExitToSurface(ant: Ant): boolean {
  switch (ant.state) {
    case 'FORAGING':
      return true; // Always exit to forage
    case 'IDLE':
      return Math.random() < 0.6; // 60% chance (was 20%)
    case 'WANDERING':
      return Math.random() < 0.7; // 70% chance (was 30%)
    case 'RETURNING':
      return false; // Stay underground to deposit food
    default:
      return false;
  }
}

/**
 * Transition an ant from surface to underground.
 * Updates layer property and positions ant at underground entrance.
 * If ant is RETURNING with food, deposit it and transition to IDLE.
 */
export function transitionToUnderground(ant: Ant, entrance: Entrance, colony: Colony): void {
  ant.currentLayer = 'underground';
  ant.x = entrance.undergroundX;
  ant.y = entrance.undergroundY;
  
  // If ant is returning with food, they've reached home - deposit and rest
  if (ant.state === AntState.RETURNING && ant.carriedFood > 0) {
    colony.addFood(ant.carriedFood);
    ant.carriedFood = 0;
    ant.state = AntState.IDLE;
    ant.timeInCurrentState = 0;
  }
  
  // Reset velocity (ant needs to reorient in new layer)
  ant.vx = 0;
  ant.vy = 0;
  ant.targetVx = 0;
  ant.targetVy = 0;
  // Reset transition cooldown
  ant.timeSinceLayerTransition = 0;
}

/**
 * Transition an ant from underground to surface.
 * Updates layer property and positions ant at surface entrance.
 */
export function transitionToSurface(ant: Ant, entrance: Entrance): void {
  ant.currentLayer = 'surface';
  ant.x = entrance.surfaceX;
  ant.y = entrance.surfaceY;
  // Reset velocity (ant needs to reorient in new layer)
  ant.vx = 0;
  ant.vy = 0;
  ant.targetVx = 0;
  ant.targetVy = 0;
  // Reset transition cooldown
  ant.timeSinceLayerTransition = 0;
}

/**
 * Process potential layer transition for an ant.
 * Call this each frame to check if ant should transition.
 * 
 * @returns true if transition occurred, false otherwise
 */
export function processLayerTransition(ant: Ant, entrance: Entrance, colony: Colony): boolean {
  // Check cooldown - prevent rapid toggling
  if (ant.timeSinceLayerTransition < TRANSITION_COOLDOWN) {
    return false;
  }

  // Only process if near entrance
  if (!isNearEntrance(ant, entrance)) {
    return false;
  }

  // Check current layer and transition logic
  if (ant.currentLayer === 'surface' && shouldEnterUnderground(ant)) {
    transitionToUnderground(ant, entrance, colony);
    return true;
  } else if (ant.currentLayer === 'underground' && shouldExitToSurface(ant)) {
    transitionToSurface(ant, entrance);
    return true;
  }

  return false;
}
