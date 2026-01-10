import { AntTraits, TaskAffinity, clampTrait } from './AntTraits';
import { TRAIT_CONFIG } from '../../config';

/**
 * Trait evolution functions
 * Pure functions for modifying ant traits based on behavior
 */

/**
 * Increase a specific task affinity trait
 * Called when an ant successfully completes a task
 * 
 * @param traits - Ant's trait profile to modify
 * @param task - Which task affinity to increase ('gathering', 'nursing', etc.)
 * @param amount - Amount to increase (default: TRAIT_INCREASE_RATE)
 */
export function increaseTaskAffinity(
  traits: AntTraits,
  task: keyof TaskAffinity,
  amount: number = TRAIT_CONFIG.TRAIT_INCREASE_RATE
): void {
  traits.taskAffinity[task] = clampTrait(
    traits.taskAffinity[task] + amount,
    TRAIT_CONFIG.MIN_TRAIT_VALUE,
    TRAIT_CONFIG.MAX_TRAIT_VALUE
  );
}

/**
 * Decay a trait toward baseline (1.0)
 * Called periodically for traits not being actively used
 * 
 * @param currentValue - Current trait value
 * @param decayRate - How quickly to decay toward baseline
 * @returns New trait value moved toward 1.0
 */
export function decayTowardBaseline(
  currentValue: number,
  decayRate: number = TRAIT_CONFIG.TRAIT_DECAY_RATE
): number {
  if (currentValue > 1.0) {
    // Above baseline, decay downward
    const newValue = currentValue - decayRate;
    return Math.max(1.0, newValue);
  } else if (currentValue < 1.0) {
    // Below baseline, decay upward
    const newValue = currentValue + decayRate;
    return Math.min(1.0, newValue);
  }
  return 1.0;
}

/**
 * Decay all task affinities toward baseline except the specified one
 * Encourages specialization by letting unused traits drift back to normal
 * 
 * @param traits - Ant's trait profile to modify
 * @param activeTask - Task currently being performed (won't be decayed)
 * @param decayRate - How quickly to decay toward baseline
 */
export function decayUnusedTaskAffinities(
  traits: AntTraits,
  activeTask: keyof TaskAffinity | null,
  decayRate: number = TRAIT_CONFIG.TRAIT_DECAY_RATE
): void {
  const tasks: Array<keyof TaskAffinity> = ['gathering', 'nursing', 'digging', 'building'];
  
  for (const task of tasks) {
    if (task !== activeTask) {
      traits.taskAffinity[task] = decayTowardBaseline(traits.taskAffinity[task], decayRate);
    }
  }
}

/**
 * Increase movement speed trait
 * Called when ant moves long distances successfully
 * 
 * @param traits - Ant's trait profile to modify
 * @param amount - Amount to increase
 */
export function increaseMovementSpeed(
  traits: AntTraits,
  amount: number = TRAIT_CONFIG.TRAIT_INCREASE_RATE
): void {
  traits.movementSpeed = clampTrait(
    traits.movementSpeed + amount,
    TRAIT_CONFIG.MIN_TRAIT_VALUE,
    TRAIT_CONFIG.MAX_TRAIT_VALUE
  );
}

/**
 * Increase carry capacity trait
 * Called when ant successfully carries food
 * 
 * @param traits - Ant's trait profile to modify
 * @param amount - Amount to increase
 */
export function increaseCarryCapacity(
  traits: AntTraits,
  amount: number = TRAIT_CONFIG.TRAIT_INCREASE_RATE
): void {
  traits.carryCapacity = clampTrait(
    traits.carryCapacity + amount,
    TRAIT_CONFIG.MIN_TRAIT_VALUE,
    TRAIT_CONFIG.MAX_TRAIT_VALUE
  );
}

/**
 * Increase energy efficiency trait (lower consumption)
 * Called when ant conserves energy effectively
 * 
 * @param traits - Ant's trait profile to modify
 * @param amount - Amount to increase efficiency (decrease consumption)
 */
export function increaseEnergyEfficiency(
  traits: AntTraits,
  amount: number = TRAIT_CONFIG.TRAIT_INCREASE_RATE
): void {
  // Lower is better for efficiency, so decrease the value
  traits.energyEfficiency = clampTrait(
    traits.energyEfficiency - amount,
    TRAIT_CONFIG.MIN_TRAIT_VALUE,
    TRAIT_CONFIG.MAX_TRAIT_VALUE
  );
}

/**
 * Increase pheromone sensitivity trait
 * Called when ant successfully follows pheromone trails
 * 
 * @param traits - Ant's trait profile to modify
 * @param amount - Amount to increase
 */
export function increasePheromoneDetection(
  traits: AntTraits,
  amount: number = TRAIT_CONFIG.TRAIT_INCREASE_RATE
): void {
  traits.pheromoneSensitivity = clampTrait(
    traits.pheromoneSensitivity + amount,
    TRAIT_CONFIG.MIN_TRAIT_VALUE,
    TRAIT_CONFIG.MAX_TRAIT_VALUE
  );
}
