import { World } from '../sim/World';
import { Ant } from '../sim/Ant';
import { AntState } from '../sim/AntState';
import { PheromoneType } from '../sim/PheromoneType';
import {
  applyRandomWander,
  updatePosition,
  constrainToWorld,
  moveTowardsPoint,
  isNearPoint,
  applyInertia,
  detectObstacles,
  avoidObstacle,
  resolveObstacleCollisions,
  perceiveEnvironment,
  MovementConfig,
} from '../sim/behaviors/antBehaviors';
import {
  evaluateStateTransition,
  changeState,
  StateTransitionConfig,
  DEFAULT_TRANSITION_CONFIG,
} from '../sim/behaviors/BehaviorStateMachine';
import {
  calculateGradientDirection,
  followPheromone,
  PheromoneBehaviorConfig,
} from '../sim/behaviors/pheromoneBehaviors';
import {
  detectFoodSources,
  isAtFoodSource,
  harvestFood,
  isCarryingFull,
} from '../sim/behaviors/foodBehaviors';
import { WORLD_CONFIG, MOVEMENT_CONFIG, COLONY_CONFIG, PERCEPTION_CONFIG, PHEROMONE_CONFIG, PHEROMONE_BEHAVIOR_CONFIG, FOOD_CONFIG } from '../config';

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
  private pheromoneBehaviorConfig: PheromoneBehaviorConfig;
  private frameCounter: number = 0;

  constructor(world: World) {
    this.world = world;
    this.movementConfig = {
      speed: MOVEMENT_CONFIG.SPEED,
      changeDirectionInterval: MOVEMENT_CONFIG.CHANGE_DIRECTION_INTERVAL,
      turnSpeed: MOVEMENT_CONFIG.TURN_SPEED,
    };
    this.transitionConfig = DEFAULT_TRANSITION_CONFIG;
    this.pheromoneBehaviorConfig = {
      sampleDistance: PHEROMONE_BEHAVIOR_CONFIG.SAMPLE_DISTANCE,
      followStrength: PHEROMONE_BEHAVIOR_CONFIG.FOLLOW_STRENGTH,
      explorationRandomness: PHEROMONE_BEHAVIOR_CONFIG.EXPLORATION_RANDOMNESS,
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

    // Pheromone system update: Decay all pheromone types
    this.world.pheromoneGrid.decay(deltaTime, PHEROMONE_CONFIG.FOOD_DECAY_RATE, PheromoneType.FOOD);
    this.world.pheromoneGrid.decay(deltaTime, PHEROMONE_CONFIG.NEST_DECAY_RATE, PheromoneType.NEST);
    this.world.pheromoneGrid.decay(deltaTime, PHEROMONE_CONFIG.DANGER_DECAY_RATE, PheromoneType.DANGER);

    // Pheromone diffusion (runs every N frames for performance)
    this.frameCounter++;
    if (this.frameCounter >= PHEROMONE_CONFIG.DIFFUSION_UPDATE_INTERVAL) {
      this.world.pheromoneGrid.diffuse(PheromoneType.FOOD, PHEROMONE_CONFIG.DIFFUSION_RATE);
      this.world.pheromoneGrid.diffuse(PheromoneType.NEST, PHEROMONE_CONFIG.DIFFUSION_RATE);
      this.world.pheromoneGrid.diffuse(PheromoneType.DANGER, PHEROMONE_CONFIG.DIFFUSION_RATE);
      this.frameCounter = 0;
    }

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
        // Detect nearby food sources
        const foodSources = detectFoodSources(ant, this.world, PERCEPTION_CONFIG.PERCEPTION_RANGE);
        
        if (foodSources.length > 0) {
          const food = foodSources[0];
          
          if (isAtFoodSource(ant, food)) {
            // Harvest food from source (automatic while nearby)
            harvestFood(ant, food, FOOD_CONFIG.HARVEST_RATE * 0.016); // deltaTime approximation for per-frame rate
            
            // Transition to returning if full or source depleted
            if (isCarryingFull(ant) || food.isDepleted()) {
              changeState(ant, AntState.RETURNING);
            }
          } else {
            // Move towards food source
            moveTowardsPoint(ant, food.x, food.y, this.movementConfig);
          }
        } else {
          // No nearby food, random wander
          if (ant.timeSinceDirectionChange >= this.movementConfig.changeDirectionInterval) {
            applyRandomWander(ant, this.movementConfig);
            ant.timeSinceDirectionChange = 0;
          }
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

    // Check for obstacles and avoid if necessary (after state behaviors but before movement)
    const nearestObstacle = detectObstacles(ant, this.world, PERCEPTION_CONFIG.OBSTACLE_DETECTION_RANGE);
    if (nearestObstacle) {
      avoidObstacle(ant, nearestObstacle, this.movementConfig);
    }

    // Apply movement based on current velocity
    updatePosition(ant, deltaTime);

    // Resolve collisions if ant moved into an obstacle
    resolveObstacleCollisions(ant, this.world);

    // Constrain to world bounds
    constrainToWorld(ant, this.world);

    // Pheromone deposition based on ant state
    this.depositPheromones(ant);

    // Extension point: Pheromone detection and response
    // Extension point: Food/threat detection
    // Extension point: Ant-to-ant interactions (communication, combat)
  }

  /**
   * Deposit pheromones based on ant's current state
   * Different states deposit different types and strengths of pheromones
   * 
   * Deposition rules:
   * - IDLE: No deposition (ant is at nest)
   * - WANDERING: Nest pheromone (leaving breadcrumbs)
   * - FORAGING: Weak Food pheromone (searching) + Nest pheromone
   * - RETURNING: Strong Food pheromone (found something!) + Nest pheromone
   */
  private depositPheromones(ant: Ant): void {
    switch (ant.state) {
      case AntState.IDLE:
        // Idle ants don't deposit pheromones
        break;

      case AntState.WANDERING:
        // Leave nest breadcrumb trail
        this.world.pheromoneGrid.deposit(
          ant.x,
          ant.y,
          PheromoneType.NEST,
          PHEROMONE_CONFIG.DEPOSITION_WANDERING
        );
        break;

      case AntState.FORAGING:
        // Deposition strength varies by whether ant is carrying food
        const foragingFoodStrength = ant.carriedFood > 0
          ? PHEROMONE_CONFIG.DEPOSITION_RETURNING // Strong trail if carrying
          : PHEROMONE_CONFIG.DEPOSITION_FORAGING;    // Weak trail if searching
        
        this.world.pheromoneGrid.deposit(
          ant.x,
          ant.y,
          PheromoneType.FOOD,
          foragingFoodStrength
        );
        // Also leave nest breadcrumbs
        this.world.pheromoneGrid.deposit(
          ant.x,
          ant.y,
          PheromoneType.NEST,
          PHEROMONE_CONFIG.DEPOSITION_WANDERING
        );
        break;

      case AntState.RETURNING:
        // If carrying food, leave strong trail marking successful route
        if (ant.carriedFood > 0) {
          this.world.pheromoneGrid.deposit(
            ant.x,
            ant.y,
            PheromoneType.FOOD,
            PHEROMONE_CONFIG.DEPOSITION_RETURNING
          );
        }
        
        // Always leave nest breadcrumbs on return
        this.world.pheromoneGrid.deposit(
          ant.x,
          ant.y,
          PheromoneType.NEST,
          PHEROMONE_CONFIG.DEPOSITION_WANDERING
        );
        break;
    }
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
