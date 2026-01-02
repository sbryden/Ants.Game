import { World } from '../sim/World';
import { Ant } from '../sim/Ant';
import { AntState } from '../sim/AntState';
import {
  applyRandomWander,
  updatePosition,
  constrainToWorld,
  moveTowardsPoint,
  isNearPoint,
  applyInertia,
  MovementConfig,
} from '../sim/behaviors/antBehaviors';
import {
  evaluateStateTransition,
  changeState,
  StateTransitionConfig,
  DEFAULT_TRANSITION_CONFIG,
} from '../sim/behaviors/BehaviorStateMachine';
import { WORLD_CONFIG, MOVEMENT_CONFIG, COLONY_CONFIG } from '../config';

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
  private transitionConfig: StateTransitionConfig;

  constructor(world: World) {
    this.world = world;
    this.movementConfig = {
      speed: MOVEMENT_CONFIG.SPEED,
      changeDirectionInterval: MOVEMENT_CONFIG.CHANGE_DIRECTION_INTERVAL,
      turnSpeed: MOVEMENT_CONFIG.TURN_SPEED,
    };
    this.transitionConfig = DEFAULT_TRANSITION_CONFIG;
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
   * Now includes FSM-based state transitions and inertia-based movement
   */
  private updateAntBehavior(ant: Ant, deltaTime: number): void {
    // Update timing
    ant.timeSinceDirectionChange += deltaTime;
    ant.timeInCurrentState += deltaTime;

    // Get ant's colony for home position
    const colony = this.world.getColony(ant.colonyId);
    if (!colony) return; // Safety check

    // Evaluate state transitions (FSM)
    const newState = evaluateStateTransition(ant, deltaTime, this.transitionConfig);
    if (newState !== ant.state) {
      changeState(ant, newState);
    }

    // State-specific movement behaviors
    switch (ant.state) {
      case AntState.IDLE:
        // Stop moving when idle
        ant.targetVx = 0;
        ant.targetVy = 0;
        break;

      case AntState.WANDERING:
        // Change direction periodically while wandering
        if (ant.timeSinceDirectionChange >= this.movementConfig.changeDirectionInterval) {
          applyRandomWander(ant, this.movementConfig);
          ant.timeSinceDirectionChange = 0;
        }
        break;

      case AntState.FORAGING:
        // Similar to wandering but could have different behavior in future
        // (e.g., more directed search patterns)
        if (ant.timeSinceDirectionChange >= this.movementConfig.changeDirectionInterval) {
          applyRandomWander(ant, this.movementConfig);
          ant.timeSinceDirectionChange = 0;
        }
        break;

      case AntState.RETURNING:
        // Move towards home
        moveTowardsPoint(ant, colony.x, colony.y, this.movementConfig);

        // Check if reached home (deterministic transition)
        if (isNearPoint(ant, colony.x, colony.y, COLONY_CONFIG.HOME_ARRIVAL_DISTANCE)) {
          changeState(ant, AntState.IDLE);
        }
        break;
    }

    // Apply inertia (smooth turning toward target velocity)
    applyInertia(ant, this.movementConfig, deltaTime);

    // Apply movement based on current velocity
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
    for (let i = 0; i < WORLD_CONFIG.INITIAL_ANT_COUNT; i++) {
      const ant = this.world.spawnAnt(colony);
      // Start with random velocity
      applyRandomWander(ant, this.movementConfig);
    }
  }
}
