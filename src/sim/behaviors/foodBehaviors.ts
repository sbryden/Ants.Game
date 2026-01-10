/**
 * Food gathering behaviors for ants
 * Handles detection, harvesting, and food-related navigation
 * Engine-agnostic - no Phaser dependencies
 */

import { Ant } from '../Ant';
import { FoodSource } from '../FoodSource';
import { World } from '../World';
import { FOOD_CONFIG, ANT_CARRY_CONFIG } from '../../config';

/**
 * Detect food sources within perception range
 * Currently supports single food source (MVP)
 * Returns array for future extensibility to multiple sources
 */
export function detectFoodSources(
  ant: Ant,
  world: World,
  perceptionRange: number
): FoodSource[] {
  return world.getFoodSourcesNear(ant.x, ant.y, perceptionRange);
}

/**
 * Check if ant is at a food source (within harvesting distance)
 */
export function isAtFoodSource(ant: Ant, foodSource: FoodSource): boolean {
  const dx = foodSource.x - ant.x;
  const dy = foodSource.y - ant.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Ant is "at" food if distance <= sum of radii + harvest threshold
  return distance <= foodSource.radius + FOOD_CONFIG.HARVEST_DISTANCE;
}

/**
 * Harvest food from a source
 * Updates ant inventory and decreases food source amount
 * Returns the actual amount harvested (limited by ant capacity)
 */
export function harvestFood(
  ant: Ant,
  foodSource: FoodSource,
  harvestRate: number
): number {
  // Calculate max capacity with trait multiplier
  const maxCapacity = ANT_CARRY_CONFIG.MAX_CAPACITY * ant.traits.carryCapacity;
  
  // Calculate how much the ant can still carry
  const canHarvest = maxCapacity - ant.carriedFood;
  
  if (canHarvest <= 0) {
    return 0; // Ant is full
  }

  // Harvest limited by rate and available space
  const toHarvest = Math.min(canHarvest, harvestRate);
  const harvested = foodSource.harvest(toHarvest);
  
  ant.carriedFood += harvested;
  return harvested;
}

/**
 * Determine if ant should prioritize returning home
 * Returns true if ant is carrying food or was told to return
 */
export function shouldReturnHome(ant: Ant): boolean {
  return ant.carriedFood > 0;
}

/**
 * Check if ant inventory is full
 */
export function isCarryingFull(ant: Ant): boolean {
  const maxCapacity = ANT_CARRY_CONFIG.MAX_CAPACITY * ant.traits.carryCapacity;
  return ant.carriedFood >= maxCapacity;
}

/**
 * Get the closest food source to ant's position
 * Returns null if no food source in range
 */
export function getClosestFoodSource(
  ant: Ant,
  world: World,
  perceptionRange: number
): FoodSource | null {
  const nearby = detectFoodSources(ant, world, perceptionRange);
  if (nearby.length === 0) return null;

  // Currently only one food source, so return it
  return nearby[0];
}
