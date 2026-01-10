import { World } from '../sim/World';
import { Ant } from '../sim/Ant';
import { AntState } from '../sim/AntState';
import { increaseTaskAffinity, decayUnusedTaskAffinities, increaseCarryCapacity, increasePheromoneDetection } from '../sim/traits/traitEvolution';
import { TRAIT_CONFIG } from '../config';

/**
 * TraitEvolutionSystem manages trait changes over time
 * Updates ant traits based on their actions and behaviors
 * 
 * Responsibilities:
 * - Increase traits when ants perform related tasks
 * - Decay unused traits toward baseline
 * - Enforce trait bounds
 */
export class TraitEvolutionSystem {
  private world: World;
  private frameCounter: number = 0;

  constructor(world: World) {
    this.world = world;
  }

  /**
   * Update trait evolution
   * Called periodically (not every frame for performance)
   * 
   * @param deltaTime - Time elapsed since last tick in seconds
   */
  public update(deltaTime: number): void {
    // Only update every N frames (performance optimization)
    this.frameCounter++;
    if (this.frameCounter < TRAIT_CONFIG.EVOLUTION_UPDATE_INTERVAL) {
      return;
    }
    this.frameCounter = 0;

    const ants = this.world.getAllAnts();
    for (const ant of ants) {
      this.updateAntTraits(ant, deltaTime);
    }
  }

  /**
   * Update traits for a single ant based on recent behavior
   * 
   * @param ant - Ant to update
   * @param deltaTime - Time elapsed
   */
  private updateAntTraits(ant: Ant, deltaTime: number): void {
    const state = ant.state;
    const traits = ant.traits;

    // Determine which task affinity to increase based on current state
    let activeTask: 'gathering' | 'nursing' | 'digging' | 'building' | null = null;

    switch (state) {
      case AntState.IDLE:
        // Idle ants near colony develop nursing affinity
        activeTask = 'nursing';
        increaseTaskAffinity(traits, 'nursing', TRAIT_CONFIG.TRAIT_INCREASE_RATE * 0.5);
        break;

      case AntState.WANDERING:
        // Wandering doesn't strongly increase any task
        // Let traits decay naturally
        activeTask = null;
        break;

      case AntState.FORAGING:
        // Foraging increases gathering affinity
        activeTask = 'gathering';
        increaseTaskAffinity(traits, 'gathering', TRAIT_CONFIG.TRAIT_INCREASE_RATE);
        
        // If following pheromones, increase sensitivity
        // This is a simplified check - we assume foraging ants are often following trails
        if (Math.random() < 0.3) {
          increasePheromoneDetection(traits, TRAIT_CONFIG.TRAIT_INCREASE_RATE * 0.5);
        }
        break;

      case AntState.RETURNING:
        // Returning with food increases gathering and carry capacity
        if (ant.carriedFood > 0) {
          activeTask = 'gathering';
          increaseTaskAffinity(traits, 'gathering', TRAIT_CONFIG.TRAIT_INCREASE_RATE);
          increaseCarryCapacity(traits, TRAIT_CONFIG.TRAIT_INCREASE_RATE * 0.5);
        }
        break;
    }

    // Decay unused task affinities toward baseline
    decayUnusedTaskAffinities(traits, activeTask, TRAIT_CONFIG.TRAIT_DECAY_RATE);
  }
}
