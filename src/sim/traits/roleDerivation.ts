import { AntTraits } from './AntTraits';
import { TRAIT_CONFIG } from '../../config';

/**
 * Role derivation from traits
 * Roles are fuzzy labels for debugging/visualization only
 * Never stored - always computed from traits
 * 
 * An ant may partially fit multiple roles or no clear role
 */

/**
 * Possible derived roles (for visualization/debugging)
 * These are NOT stored on ants - only computed when needed
 */
export enum DerivedRole {
  GENERALIST = 'Generalist',
  FOOD_GATHERER = 'Food Gatherer',
  NURSERY_WORKER = 'Nursery Worker',
  BUILDER = 'Builder',
}

/**
 * Derive role label from trait profile
 * Returns best-fit role based on trait thresholds
 * 
 * @param traits - Ant's trait profile
 * @returns Derived role label (for debug display only)
 */
export function deriveRole(traits: AntTraits): DerivedRole {
  const { taskAffinity, movementSpeed, pheromoneSensitivity, carryCapacity, wanderingRadius, energyEfficiency } = traits;
  const high = TRAIT_CONFIG.HIGH_AFFINITY_THRESHOLD;
  const low = TRAIT_CONFIG.LOW_AFFINITY_THRESHOLD;

  // Food Gatherer: High gathering, high speed, high pheromone sensitivity, high carry
  const isFoodGatherer =
    taskAffinity.gathering > high &&
    movementSpeed > 1.1 &&
    pheromoneSensitivity > 1.2 &&
    carryCapacity > 1.2;

  if (isFoodGatherer) {
    return DerivedRole.FOOD_GATHERER;
  }

  // Nursery Worker: High nursing, low wandering, high efficiency, low speed
  const isNurseryWorker =
    taskAffinity.nursing > high &&
    wanderingRadius < 0.8 &&
    energyEfficiency < 0.9 &&
    movementSpeed < 0.9;

  if (isNurseryWorker) {
    return DerivedRole.NURSERY_WORKER;
  }

  // Builder: High building/digging, low speed, low pheromone sensitivity
  const isBuilder =
    (taskAffinity.building > high || taskAffinity.digging > high) &&
    movementSpeed < 0.9 &&
    pheromoneSensitivity < 0.8;

  if (isBuilder) {
    return DerivedRole.BUILDER;
  }

  // Default to generalist if no clear specialization
  return DerivedRole.GENERALIST;
}

/**
 * Get strongest task affinity for an ant
 * Used for visualization tinting
 * 
 * @param traits - Ant's trait profile
 * @returns Name of strongest task affinity
 */
export function getStrongestAffinity(traits: AntTraits): keyof typeof traits.taskAffinity {
  const affinities = traits.taskAffinity;
  let strongest: keyof typeof affinities = 'gathering';
  let maxValue = affinities.gathering;

  for (const task in affinities) {
    const key = task as keyof typeof affinities;
    if (affinities[key] > maxValue) {
      maxValue = affinities[key];
      strongest = key;
    }
  }

  return strongest;
}

/**
 * Get color for role visualization
 * Returns hex color code for rendering ants by role
 * 
 * @param role - Derived role to colorize
 * @returns Hex color code
 */
export function getRoleColor(role: DerivedRole): number {
  switch (role) {
    case DerivedRole.FOOD_GATHERER:
      return 0x4a7c4e; // Green
    case DerivedRole.NURSERY_WORKER:
      return 0xd4a574; // Yellow/tan
    case DerivedRole.BUILDER:
      return 0x8b6f47; // Brown
    case DerivedRole.GENERALIST:
    default:
      return 0x808080; // Gray
  }
}
