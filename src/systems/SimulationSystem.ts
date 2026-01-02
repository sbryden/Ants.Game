import { World } from '../sim/World';
import { Ant } from '../sim/Ant';
import { AntState } from '../sim/AntState';
import {
  applyRandomWander,
  updatePosition,
  constrainToWorld,
  shouldChangeDirection,
  initializeMovementIfIdle,
  MovementConfig,
} from '../sim/behaviors/antBehaviors';

/**
 * SimulationSystem orchestrates the deterministic simulation update loop
 * Operates on engine-agnostic simulation data using pure behavior functions
 * 
 * Responsibilities:
 * - Tick the simulation forward in time
 * - Coordinate behavior updates across all ants
 * - Provide extension points for future systems (pheromones, tasks, etc.)
 */
export class SimulationSystem {
  private world: World;
  private movementConfig: MovementConfig;

  constructor(world: World) {
    this.world = world;
    this.movementConfig = {
      speed: 50, // pixels per second
      changeDirectionInterval: 2, // seconds
    };
  }

  /**
   * Main simulation tick - advances simulation by deltaTime seconds
   * Deterministic: given same initial state and deltaTime, produces same output
   * 
   * @param deltaTime - time elapsed since last tick in seconds
   * 
   * Extension points:
   * - Pheromone diffusion/decay would happen here
   * - Colony-level updates (resource management) would happen here
   * - Global events (food spawning, threats) would happen here
   */
  public tick(deltaTime: number): void {
    const ants = this.world.getAllAnts();

    // Update ant behaviors
    for (const ant of ants) {
      this.updateAntBehavior(ant, deltaTime);
    }

    // Extension point: Pheromone system update
    // Extension point: Colony resource updates
    // Extension point: Task assignment system
  }

  /**
   * Update a single ant's behavior and state
   * Uses pure functions from behaviors/ to maintain separation of concerns
   * 
   * Future: This could be generalized to support different behavior sets
   * based on ant role, traits, or tasks
   */
  private updateAntBehavior(ant: Ant, deltaTime: number): void {
    // Update behavior timing
    ant.timeSinceDirectionChange += deltaTime;

    // Decide if we should change direction (wandering behavior)
    if (shouldChangeDirection(ant.timeSinceDirectionChange, this.movementConfig)) {
      applyRandomWander(ant, this.movementConfig);
      ant.timeSinceDirectionChange = 0;
    } else {
      // If idle and not changing direction, start moving
      initializeMovementIfIdle(ant, this.movementConfig);
    }

    // Apply movement
    updatePosition(ant, deltaTime);

    // Constrain to world bounds
    constrainToWorld(ant, this.world);

    // Extension point: Pheromone detection and response
    // Extension point: Food/threat detection
    // Extension point: Ant-to-ant interactions (communication, combat)
  }

  /**
   * Convenience method for Phaser integration
   * Converts milliseconds to seconds and calls tick()
   */
  public update(deltaTime: number): void {
    this.tick(deltaTime);
  }

  /**
   * Initialize world with a colony and some ants
   * Called once at startup
   */
  public initializeWorld(): void {
    const colony = this.world.createColony(
      this.world.width / 2,
      this.world.height / 2
    );

    // Spawn initial ants for MVP
    const initialAntCount = 20;
    for (let i = 0; i < initialAntCount; i++) {
      const ant = this.world.spawnAnt(colony);
      // Start with random velocity
      applyRandomWander(ant, this.movementConfig);
    }
  }
}
