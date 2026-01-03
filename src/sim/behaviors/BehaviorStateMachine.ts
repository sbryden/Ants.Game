import { Ant } from '../Ant';
import { AntState } from '../AntState';
import { BEHAVIOR_CONFIG, ENERGY_CONFIG } from '../../config';

/**
 * Behavior State Machine for ants
 * Defines state transition rules and probabilities
 * 
 * Phase 1 states:
 * - IDLE: Resting at home, occasionally starts wandering
 * - WANDERING: Random exploration, may transition to foraging or returning
 * - FORAGING: Searching behavior (full food system in Phase 4)
 * - RETURNING: Moving back to colony
 */

/**
 * Configuration for state transition probabilities
 * These are per-second probabilities, evaluated each frame
 */
export interface StateTransitionConfig {
  // IDLE transitions
  idleToWanderingChance: number; // Chance per second to start wandering

  // WANDERING transitions
  wanderingMinDuration: number; // Minimum time before can transition (seconds)
  wanderingToForagingChance: number; // Chance per second after min duration
  wanderingToReturningChance: number; // Chance per second after min duration

  // FORAGING transitions
  foragingMinDuration: number;
  foragingToReturningChance: number; // Chance per second to give up and return

  // RETURNING transitions happen deterministically (when near home)
}

/**
 * Default transition probabilities
 * Tuned for natural-looking behavior
 */
export const DEFAULT_TRANSITION_CONFIG: StateTransitionConfig = {
  idleToWanderingChance: BEHAVIOR_CONFIG.IDLE_TO_WANDERING_CHANCE,
  wanderingMinDuration: BEHAVIOR_CONFIG.WANDERING_MIN_DURATION,
  wanderingToForagingChance: BEHAVIOR_CONFIG.WANDERING_TO_FORAGING_CHANCE,
  wanderingToReturningChance: BEHAVIOR_CONFIG.WANDERING_TO_RETURNING_CHANCE,
  foragingMinDuration: BEHAVIOR_CONFIG.FORAGING_MIN_DURATION,
  foragingToReturningChance: BEHAVIOR_CONFIG.FORAGING_TO_RETURNING_CHANCE,
};

/**
 * Evaluate potential state transition for an ant
 * Returns new state if transition should occur, or current state if staying
 * Uses probabilistic transitions for organic feel
 */
export function evaluateStateTransition(
  ant: Ant,
  deltaTime: number,
  config: StateTransitionConfig = DEFAULT_TRANSITION_CONFIG
): AntState {
  const currentState = ant.state;
  const timeInState = ant.timeInCurrentState;

  switch (currentState) {
    case AntState.IDLE:
      // Occasionally start wandering
      if (Math.random() < config.idleToWanderingChance * deltaTime) {
        return AntState.WANDERING;
      }
      break;

    case AntState.WANDERING:
      // Hungry wanderers bias toward returning home
      if (ant.energy < ENERGY_CONFIG.THRESHOLDS.HUNGER) {
        const hungerChance = ENERGY_CONFIG.HUNGER_RETURN_CHANCE * deltaTime;
        if (Math.random() < hungerChance) {
          return AntState.RETURNING;
        }
      }

      // Only consider transitions after minimum duration
      if (timeInState >= config.wanderingMinDuration) {
        // Check foraging transition (evaluate first, return early if triggered)
        if (Math.random() < config.wanderingToForagingChance * deltaTime) {
          return AntState.FORAGING;
        }
        // Check returning transition (only if foraging didn't trigger)
        if (Math.random() < config.wanderingToReturningChance * deltaTime) {
          return AntState.RETURNING;
        }
      }
      break;

    case AntState.FORAGING:
      // Starving foragers give up earlier
      if (ant.energy < ENERGY_CONFIG.THRESHOLDS.HUNGER) {
        const hungerChance = ENERGY_CONFIG.HUNGER_RETURN_CHANCE * 2 * deltaTime;
        if (Math.random() < hungerChance) {
          return AntState.RETURNING;
        }
      }

      // Only consider transitions after minimum duration
      if (timeInState >= config.foragingMinDuration) {
        // Give up and return home
        if (Math.random() < config.foragingToReturningChance * deltaTime) {
          return AntState.RETURNING;
        }
      }
      break;

    case AntState.RETURNING:
      // RETURNING transitions handled deterministically in behavior update
      // (when ant reaches home, it becomes IDLE)
      break;
  }

  return currentState; // No transition
}

/**
 * Change ant's state and reset state-specific timers
 */
export function changeState(ant: Ant, newState: AntState): void {
  if (ant.state !== newState) {
    ant.state = newState;
    ant.timeInCurrentState = 0;
  }
}
