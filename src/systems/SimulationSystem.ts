import { World } from '../sim/World';
import { Colony } from '../sim/Colony';
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
import { WORLD_CONFIG, MOVEMENT_CONFIG, COLONY_CONFIG, PERCEPTION_CONFIG, PHEROMONE_CONFIG, PHEROMONE_BEHAVIOR_CONFIG, FOOD_CONFIG, ENERGY_CONFIG } from '../config';

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
  private energyAdjustedMovementConfig: MovementConfig;
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
    this.energyAdjustedMovementConfig = { ...this.movementConfig };
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
    const colonies = this.world.getColonies();
    for (const colony of colonies) {
      colony.beginFrame();
    }

    const ants = this.world.getAllAnts();
    const deadAnts: Ant[] = [];

    // Update ant behaviors
    for (const ant of ants) {
      const isDead = this.updateAntBehavior(ant, deltaTime);
      if (isDead) {
        deadAnts.push(ant);
      }
    }

    for (const ant of deadAnts) {
      this.world.removeAnt(ant);
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

    // Food respawn: If no food source or current one is depleted, spawn a new one
    if (!this.world.foodSource || this.world.foodSource.isDepleted()) {
      this.world.spawnFoodSource();
    }

    for (const colony of colonies) {
      colony.finalizeFrame(deltaTime);
    }

    // Extension point: Colony resource updates
    // Extension point: Task assignment system
  }

  /**
   * Update a single ant's behavior and state
   * Uses pure functions from behaviors/ to maintain separation of concerns
   * Returns true if the ant dies this frame
   */
  private updateAntBehavior(ant: Ant, deltaTime: number): boolean {
    // Update timing
    ant.timeSinceDirectionChange += deltaTime;
    ant.timeInCurrentState += deltaTime;

    // Get ant's colony for home position
    const colony = this.world.getColony(ant.colonyId);
    if (!colony) return false; // Safety check

    // Energy decay for current activity
    this.applyEnergyConsumption(ant, deltaTime);
    if (ant.energy <= 0) {
      return true;
    }

    // Evaluate state transitions (FSM)
    const newState = evaluateStateTransition(ant, deltaTime, this.transitionConfig);
    if (newState !== ant.state) {
      changeState(ant, newState);
    }

    const movementConfig = this.getMovementConfigForAnt(ant);

    // State-specific movement behaviors
    switch (ant.state) {
      case AntState.IDLE:
        // Stop moving when idle
        ant.targetVx = 0;
        ant.targetVy = 0;
        this.handleEating(ant, colony, deltaTime);
        break;

      case AntState.WANDERING:
        // Sample pheromones to guide wandering
        const perception = perceiveEnvironment(
          ant,
          this.world,
          this.pheromoneBehaviorConfig.sampleDistance
        );

        // Check for food pheromone gradient only (ignore nest pheromones)
        // Wanderers explore for food, nest pheromones would just pull them back home
        const foodGradient = perception.pheromoneGradients.get(PheromoneType.FOOD);
        
        if (foodGradient) {
          // Calculate direction to strongest food pheromone
          const gradientDirection = calculateGradientDirection(
            foodGradient,
            PHEROMONE_BEHAVIOR_CONFIG.GRADIENT_THRESHOLD
          );

          if (gradientDirection !== null) {
            // Follow food pheromone with exploration randomness
            // This naturally transitions to foraging when food is found
            followPheromone(
              ant,
              gradientDirection,
              movementConfig.speed,
              this.pheromoneBehaviorConfig
            );
          } else {
            // No clear gradient direction, continue random wandering
            if (ant.timeSinceDirectionChange >= movementConfig.changeDirectionInterval) {
              applyRandomWander(ant, movementConfig);
              ant.timeSinceDirectionChange = 0;
            }
          }
        } else {
          // No food pheromone detected, random wander and explore
          if (ant.timeSinceDirectionChange >= movementConfig.changeDirectionInterval) {
            applyRandomWander(ant, movementConfig);
            ant.timeSinceDirectionChange = 0;
          }
        }
        break;

      case AntState.FORAGING:
        // Detect nearby food sources
        const foodSources = detectFoodSources(ant, this.world, PERCEPTION_CONFIG.PERCEPTION_RANGE);
        
        if (foodSources.length > 0) {
          const food = foodSources[0];
          
          if (isAtFoodSource(ant, food)) {
            // Harvest food from source (automatic while nearby)
            harvestFood(ant, food, FOOD_CONFIG.HARVEST_RATE * deltaTime);
            
            // Transition to returning if full or source depleted
            if (isCarryingFull(ant) || food.isDepleted()) {
              changeState(ant, AntState.RETURNING);
            }
          } else {
            // Move towards food source
            moveTowardsPoint(ant, food.x, food.y, movementConfig);
          }
        } else {
          // No nearby food, random wander
          if (ant.timeSinceDirectionChange >= movementConfig.changeDirectionInterval) {
            applyRandomWander(ant, movementConfig);
            ant.timeSinceDirectionChange = 0;
          }
        }
        break;

      case AntState.RETURNING:
        // Check if ant has reached home
        if (isNearPoint(ant, colony.x, colony.y, COLONY_CONFIG.HOME_ARRIVAL_DISTANCE)) {
          // Deposit food to colony if carrying any
          if (ant.carriedFood > 0) {
            colony.addFood(ant.carriedFood);
            ant.carriedFood = 0;
          }
          // Transition to idle and allow immediate refuel
          changeState(ant, AntState.IDLE);
          this.handleEating(ant, colony, deltaTime);
        } else {
          // Move towards home
          moveTowardsPoint(ant, colony.x, colony.y, movementConfig);
        }
        break;
    }

    // Apply inertia (smooth turning toward target velocity)
    applyInertia(ant, movementConfig, deltaTime);

    // Check for obstacles and avoid if necessary (after state behaviors but before movement)
    const nearestObstacle = detectObstacles(ant, this.world, PERCEPTION_CONFIG.OBSTACLE_DETECTION_RANGE);
    if (nearestObstacle) {
      avoidObstacle(ant, nearestObstacle, movementConfig);
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
    return ant.energy <= 0;
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
   * Apply energy consumption for current frame
   * Deducts energy from ant based on its activity state
   */
  private applyEnergyConsumption(ant: Ant, deltaTime: number): void {
    const rate = this.getConsumptionRate(ant.state);
    const consumption = rate * deltaTime;
    ant.energy = Math.max(0, ant.energy - consumption);
    ant.lastEnergyConsumption = consumption;
  }

  /**
   * Get energy consumption rate for an activity state
   */
  private getConsumptionRate(state: AntState): number {
    return ENERGY_CONFIG.CONSUMPTION_RATES[state] ?? 0;
  }

  /**
   * Get movement config adjusted for current energy level
   */
  private getMovementConfigForAnt(ant: Ant): MovementConfig {
    const energyPercent = ant.energy / ENERGY_CONFIG.MAX_ENERGY;
    let multiplier = 1.0;

    if (energyPercent >= 0.8) {
      multiplier = ENERGY_CONFIG.SPEED_MULTIPLIERS.WELL_FED;
    } else if (energyPercent >= 0.5) {
      multiplier = ENERGY_CONFIG.SPEED_MULTIPLIERS.NORMAL;
    } else if (energyPercent >= 0.25) {
      multiplier = ENERGY_CONFIG.SPEED_MULTIPLIERS.HUNGRY;
    } else {
      multiplier = ENERGY_CONFIG.SPEED_MULTIPLIERS.STARVING;
    }

    this.energyAdjustedMovementConfig.speed = this.movementConfig.speed * multiplier;
    this.energyAdjustedMovementConfig.changeDirectionInterval = this.movementConfig.changeDirectionInterval;
    this.energyAdjustedMovementConfig.turnSpeed = this.movementConfig.turnSpeed;

    return this.energyAdjustedMovementConfig;
  }

  /**
   * Handle eating when ant is idle at colony
   * Consumes only the food needed to reach max energy (prevents waste)
   */
  private handleEating(ant: Ant, colony: Colony, deltaTime: number): void {
    if (ant.energy >= ENERGY_CONFIG.MAX_ENERGY) {
      return;
    }

    // Calculate energy-to-food ratio from recovery and consumption rates
    const energyPerFoodUnit = ENERGY_CONFIG.EATING_RECOVERY_RATE / ENERGY_CONFIG.FOOD_CONSUMPTION_RATE;
    
    // Determine how much energy is needed
    const energyNeeded = ENERGY_CONFIG.MAX_ENERGY - ant.energy;
    const foodNeeded = energyNeeded / energyPerFoodUnit;
    
    // Consume only what's needed, limited by eating rate
    const maxFoodThisFrame = ENERGY_CONFIG.FOOD_CONSUMPTION_RATE * deltaTime;
    const foodToConsume = Math.min(foodNeeded, maxFoodThisFrame);
    const consumed = colony.consumeFood(foodToConsume);

    if (consumed > 0) {
      const energyGained = consumed * energyPerFoodUnit;
      ant.energy = Math.min(ENERGY_CONFIG.MAX_ENERGY, ant.energy + energyGained);
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
   * 
   * @param antCount - Optional number of ants to spawn (defaults to WORLD_CONFIG.INITIAL_ANT_COUNT)
   */
  public initializeWorld(antCount?: number): void {
    const count = antCount ?? WORLD_CONFIG.INITIAL_ANT_COUNT;
    
    const colony = this.world.createColony(
      this.world.width / 2,
      this.world.height / 2
    );

    // Spawn initial ants
    for (let i = 0; i < count; i++) {
      const ant = this.world.spawnAnt(colony);
      // Start with random velocity
      applyRandomWander(ant, this.movementConfig);
    }
  }
}
