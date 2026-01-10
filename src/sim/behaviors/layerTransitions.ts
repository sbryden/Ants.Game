import { Ant } from '../Ant';
import { Entrance } from '../Entrance';

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
 * - IDLE ants occasionally enter (20% chance when near)
 * - WANDERING ants occasionally enter (30% chance when near)
 * - FORAGING ants stay on surface (looking for food)
 */
export function shouldEnterUnderground(ant: Ant): boolean {
  switch (ant.state) {
    case 'RETURNING':
      return true; // Always enter when returning with food
    case 'IDLE':
      return Math.random() < 0.2; // 20% chance
    case 'WANDERING':
      return Math.random() < 0.3; // 30% chance
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
 * - IDLE ants occasionally exit (20% chance)
 * - WANDERING ants occasionally exit (30% chance)
 * - RETURNING ants stay underground until food deposited
 */
export function shouldExitToSurface(ant: Ant): boolean {
  switch (ant.state) {
    case 'FORAGING':
      return true; // Always exit to forage
    case 'IDLE':
      return Math.random() < 0.2; // 20% chance
    case 'WANDERING':
      return Math.random() < 0.3; // 30% chance
    case 'RETURNING':
      return false; // Stay underground to deposit food
    default:
      return false;
  }
}

/**
 * Transition an ant from surface to underground.
 * Updates layer property and positions ant at underground entrance.
 */
export function transitionToUnderground(ant: Ant, entrance: Entrance): void {
  ant.currentLayer = 'underground';
  ant.x = entrance.undergroundX;
  ant.y = entrance.undergroundY;
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
export function processLayerTransition(ant: Ant, entrance: Entrance): boolean {
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
    transitionToUnderground(ant, entrance);
    return true;
  } else if (ant.currentLayer === 'underground' && shouldExitToSurface(ant)) {
    transitionToSurface(ant, entrance);
    return true;
  }

  return false;
}
