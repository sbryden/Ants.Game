import { World } from '../sim/World';
import { UndergroundWorld } from '../sim/UndergroundWorld';
import { Colony } from '../sim/Colony';
import { Ant } from '../sim/Ant';
import { AntState } from '../sim/AntState';
import { PheromoneType } from '../sim/PheromoneType';
import { createEntrance } from '../sim/Entrance';
import { processLayerTransition } from '../sim/behaviors/layerTransitions';
import {
  shouldStartDigging,
  findDiggableTile,
  startDigging,
  updateDigging,
} from '../sim/behaviors/diggingBehaviors';
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
import { TraitEvolutionSystem } from './TraitEvolutionSystem';

/**
 * SimulationSystem orchestrates the deterministic simulation update loop
 * Operates on engine-agnostic simulation data using pure behavior functions
 * 
 * Responsibilities:
 * - Tick the simulation forward in time
 * - Coordinate behavior updates across all ants
 * - Manage both surface and underground world simulations
 * - Provide extension points for future systems (pheromones, tasks, etc.)
 */
export class SimulationSystem {
  private world: World;
  private undergroundWorld: UndergroundWorld | null = null;
  private movementConfig: MovementConfig;
  private energyAdjustedMovementConfig: MovementConfig;
  private transitionConfig: StateTransitionConfig;
  private pheromoneBehaviorConfig: PheromoneBehaviorConfig;
  private frameCounter: number = 0;
  private traitEvolutionSystem: TraitEvolutionSystem;

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
    this.traitEvolutionSystem = new TraitEvolutionSystem(world);
  }

  /**
   * Helper method to apply pheromone-guided movement
   * Shared by WANDERING and FORAGING states to avoid code duplication
   * 
   * @param ant - The ant to guide
   * @param movementConfig - Movement configuration
   * @returns true if pheromone guidance was applied, false if should fall back to random wandering
   */
  private applyPheromoneGuidedMovement(
    ant: Ant,
    movementConfig: MovementConfig
  ): boolean {
    // Sample pheromones to guide movement
    const perception = perceiveEnvironment(
      ant,
      this.world,
      this.pheromoneBehaviorConfig.sampleDistance
    );

    // Check for food pheromone gradient only (ignore nest pheromones)
    // Following nest pheromones would pull ants back home prematurely
    const foodGradient = perception.pheromoneGradients.get(PheromoneType.FOOD);
    
    if (foodGradient) {
      // Calculate direction to strongest food pheromone
      const gradientDirection = calculateGradientDirection(
        foodGradient,
        PHEROMONE_BEHAVIOR_CONFIG.GRADIENT_THRESHOLD
      );

      if (gradientDirection !== null) {
        // Follow food pheromone trail
        followPheromone(
          ant,
          gradientDirection,
          movementConfig.speed,
          this.pheromoneBehaviorConfig
        );
        return true;
      }
    }
    
    return false; // No gradient found
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

    // Food respawn: Remove depleted food sources and spawn replacements
    for (let i = this.world.foodSources.length - 1; i >= 0; i--) {
      if (this.world.foodSources[i].isDepleted()) {
        this.world.foodSources.splice(i, 1);
        this.world.spawnFoodSource();
      }
    }

    for (const colony of colonies) {
      colony.finalizeFrame(deltaTime);
    }

    // Process layer transitions for all ants
    if (this.world.entrance && this.undergroundWorld) {
      for (const ant of ants) {
        // Only process surface ants for entrance proximity
        // Underground ants will be checked separately in underground update
        if (ant.currentLayer === 'surface') {
          processLayerTransition(ant, this.world.entrance);
        }
      }
    }

    // Update queen and egg-laying
    if (this.undergroundWorld && this.undergroundWorld.queen) {
      const queen = this.undergroundWorld.queen;
      queen.timeSinceLastEgg += deltaTime;

      // Queen lays eggs every 10 seconds if she has enough food
      if (queen.timeSinceLastEgg >= 10.0 && queen.canLayEgg()) {
        if (queen.layEgg()) {
          this.undergroundWorld.layEgg(queen.colonyId);
        }
      }

      // Update all eggs
      for (const egg of this.undergroundWorld.eggs) {
        egg.update(deltaTime);
      }
    }

    // Trait evolution system update
    this.traitEvolutionSystem.update(deltaTime);

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
    ant.timeSinceLayerTransition += deltaTime;

    // Get ant's colony for home position
    const colony = this.world.getColony(ant.colonyId);
    if (!colony) return false; // Safety check

    // Energy decay for current activity
    this.applyEnergyConsumption(ant, deltaTime);
    if (ant.energy <= 0) {
      return true;
    }

    // Handle digging state (underground only)
    if (ant.state === AntState.DIGGING && this.undergroundWorld) {
      updateDigging(ant, deltaTime, this.undergroundWorld);
      return false; // Continue simulation
    }

    // Check if idle underground ant should start digging
    if (shouldStartDigging(ant) && this.undergroundWorld) {
      const targetTile = findDiggableTile(ant, this.undergroundWorld);
      if (targetTile) {
        startDigging(ant, targetTile, this.undergroundWorld);
        return false; // Ant now digging
      }
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
        // Wanderers explore for food, so they follow food pheromones when detected
        const perception = perceiveEnvironment(
          ant,
          this.world,
          this.pheromoneBehaviorConfig.sampleDistance
        );

        // Check for food pheromone gradient only (ignore nest pheromones)
        // Nest pheromones would just pull them back home prematurely
        const foodGradient = perception.pheromoneGradients.get(PheromoneType.FOOD);
        
        if (foodGradient) {
          // Calculate direction to strongest food pheromone
          const gradientDirection = calculateGradientDirection(
            foodGradient,
            PHEROMONE_BEHAVIOR_CONFIG.GRADIENT_THRESHOLD
          );

          if (gradientDirection !== null) {
            // Follow food pheromone with exploration randomness
            // Apply ant's pheromone sensitivity trait
            const antPheromoneConfig = this.getPheromoneBehaviorConfigForAnt(ant);
            followPheromone(
              ant,
              gradientDirection,
              movementConfig.speed,
              antPheromoneConfig
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
            
            // Move randomly around food source while collecting (slow, erratic movement)
            if (ant.timeSinceDirectionChange >= MOVEMENT_CONFIG.HARVESTING_CHANGE_INTERVAL) {
              const harvestingConfig = {
                ...movementConfig,
                speed: MOVEMENT_CONFIG.HARVESTING_SPEED,
                changeDirectionInterval: MOVEMENT_CONFIG.HARVESTING_CHANGE_INTERVAL,
              };
              applyRandomWander(ant, harvestingConfig);
              ant.timeSinceDirectionChange = 0;
            }
            
            // Transition to returning if full or source depleted
            if (isCarryingFull(ant) || food.isDepleted()) {
              changeState(ant, AntState.RETURNING);
            }
          } else {
            // Move towards food source
            moveTowardsPoint(ant, food.x, food.y, movementConfig);
          }
        } else {
          // No direct food detected - use pheromone guidance to leverage collective intelligence
          // Foraging ants follow trails left by successful ants who found food
          if (!this.applyPheromoneGuidedMovement(ant, movementConfig)) {
            // No pheromone gradient detected - switch back to wandering search pattern
            // This prevents foraging ants from continuing in a fruitless search
            changeState(ant, AntState.WANDERING);
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

    // Layer-specific position constraints
    if (ant.currentLayer === 'underground') {
      // Underground ants must stay in tunnel tiles
      this.constrainToTunnels(ant);
    } else {
      // Surface ants constrained to world bounds
      constrainToWorld(ant, this.world);
    }

    // Pheromone deposition based on ant state
    this.depositPheromones(ant);

    // Extension point: Pheromone detection and response
    // Extension point: Food/threat detection
    // Extension point: Ant-to-ant interactions (communication, combat)
    return ant.energy <= 0;
  }

  /**
   * Constrain underground ant to tunnel tiles only.
   * If ant moves into dirt/non-tunnel tile, snap back to nearest tunnel tile.
   */
  private constrainToTunnels(ant: Ant): void {
    if (!this.undergroundWorld) return;

    const tileSize = this.undergroundWorld.tileSize;
    const gridX = Math.floor(ant.x / tileSize);
    const gridY = Math.floor(ant.y / tileSize);

    // Check if current position is in a valid tunnel/chamber/entrance tile
    const tile = this.undergroundWorld.getTile(gridX, gridY);
    if (tile !== 'TUNNEL' && tile !== 'CHAMBER' && tile !== 'ENTRANCE') {
      // Ant is in dirt - find nearest tunnel tile and snap to it
      const nearestTunnel = this.findNearestTunnelTile(ant.x, ant.y);
      if (nearestTunnel) {
        ant.x = nearestTunnel.x * tileSize + tileSize / 2;
        ant.y = nearestTunnel.y * tileSize + tileSize / 2;
        // Stop movement when snapped back
        ant.vx = 0;
        ant.vy = 0;
        ant.targetVx = 0;
        ant.targetVy = 0;
      }
    }
  }

  /**
   * Find the nearest tunnel/chamber/entrance tile to given coordinates.
   */
  private findNearestTunnelTile(x: number, y: number): { x: number; y: number } | null {
    if (!this.undergroundWorld) return null;

    const tileSize = this.undergroundWorld.tileSize;
    const centerX = Math.floor(x / tileSize);
    const centerY = Math.floor(y / tileSize);
    let minDist = Infinity;
    let nearest: { x: number; y: number } | null = null;

    // Search in expanding radius
    for (let radius = 0; radius <= 5; radius++) {
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const gridX = centerX + dx;
          const gridY = centerY + dy;
          const tile = this.undergroundWorld.getTile(gridX, gridY);
          
          if (tile === 'TUNNEL' || tile === 'CHAMBER' || tile === 'ENTRANCE') {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
              minDist = dist;
              nearest = { x: gridX, y: gridY };
            }
          }
        }
      }
      // If we found a tunnel in this radius, return it
      if (nearest) return nearest;
    }

    return nearest;
  }

  /**
   * Deposit pheromones based on ant's current state
   * Different states deposit different types and strengths of pheromones
   * 
   * Deposition rules:
   * - IDLE: No deposition (ant is at nest)
   * - WANDERING: Nest pheromone (leaving breadcrumbs)
   * - FORAGING: Food pheromone only when carrying food OR sensing food nearby + Nest pheromone
   * - RETURNING: Strong Food pheromone if carrying food + Nest pheromone
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
        // Only deposit food pheromones when ant has actually found food
        // This prevents searching ants from creating misleading trails
        if (ant.carriedFood > 0) {
          // Ant is carrying food - leave strong trail marking successful route
          this.world.pheromoneGrid.deposit(
            ant.x,
            ant.y,
            PheromoneType.FOOD,
            PHEROMONE_CONFIG.DEPOSITION_RETURNING
          );
        } else {
          // Check if ant can sense food nearby (within perception range)
          const nearbyFood = this.world.getFoodSourcesNear(
            ant.x,
            ant.y,
            PERCEPTION_CONFIG.PERCEPTION_RANGE
          );
          
          if (nearbyFood.length > 0) {
            // Ant can sense food - leave weak trail marking potential food location
            this.world.pheromoneGrid.deposit(
              ant.x,
              ant.y,
              PheromoneType.FOOD,
              PHEROMONE_CONFIG.DEPOSITION_FORAGING
            );
          }
          // If no food sensed and not carrying, deposit no food pheromone
        }
        
        // Always leave nest breadcrumbs so ant can find way home
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
   * Deducts energy from ant based on its activity state and efficiency trait
   */
  private applyEnergyConsumption(ant: Ant, deltaTime: number): void {
    const baseRate = this.getConsumptionRate(ant.state);
    // Apply energy efficiency trait (lower is better)
    const consumption = baseRate * ant.traits.energyEfficiency * deltaTime;
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
   * Get movement config adjusted for current energy level and traits
   */
  private getMovementConfigForAnt(ant: Ant): MovementConfig {
    const energyPercent = ant.energy / ENERGY_CONFIG.MAX_ENERGY;
    let energyMultiplier = 1.0;

    if (energyPercent >= 0.8) {
      energyMultiplier = ENERGY_CONFIG.SPEED_MULTIPLIERS.WELL_FED;
    } else if (energyPercent >= 0.5) {
      energyMultiplier = ENERGY_CONFIG.SPEED_MULTIPLIERS.NORMAL;
    } else if (energyPercent >= 0.25) {
      energyMultiplier = ENERGY_CONFIG.SPEED_MULTIPLIERS.HUNGRY;
    } else {
      energyMultiplier = ENERGY_CONFIG.SPEED_MULTIPLIERS.STARVING;
    }

    // Apply both energy and trait multipliers
    const traitMultiplier = ant.traits.movementSpeed;
    this.energyAdjustedMovementConfig.speed = this.movementConfig.speed * energyMultiplier * traitMultiplier;
    this.energyAdjustedMovementConfig.changeDirectionInterval = this.movementConfig.changeDirectionInterval;
    this.energyAdjustedMovementConfig.turnSpeed = this.movementConfig.turnSpeed;

    return this.energyAdjustedMovementConfig;
  }

  /**
   * Get pheromone behavior config adjusted for ant's pheromone sensitivity trait
   */
  private getPheromoneBehaviorConfigForAnt(ant: Ant): PheromoneBehaviorConfig {
    return {
      sampleDistance: this.pheromoneBehaviorConfig.sampleDistance,
      followStrength: this.pheromoneBehaviorConfig.followStrength * ant.traits.pheromoneSensitivity,
      explorationRandomness: this.pheromoneBehaviorConfig.explorationRandomness,
    };
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

    // Spawn initial food sources
    this.world.spawnFoodSource();
    this.world.spawnFoodSource();

    // Initialize underground world with entrance at colony location
    // Underground uses its own coordinate system (0,0 at top-left of screen)
    const entrance = createEntrance(
      colony.x,
      colony.y, // Surface entrance at colony
      this.world.width / 2, // Underground entrance centered horizontally
      50,  // Underground entrance near top of screen
      COLONY_CONFIG.ENTRANCE_RADIUS
    );
    this.world.entrance = entrance;
    this.undergroundWorld = new UndergroundWorld(
      Math.floor(this.world.width / 10),  // Width in tiles to match screen width
      Math.floor(this.world.height / 10), // Height in tiles to match screen height
      10,  // Tile size in pixels
      entrance
    );

    // Spawn queen in initial chamber
    this.undergroundWorld.spawnQueen(colony.id);
  }

  public getUndergroundWorld(): UndergroundWorld | null {
    return this.undergroundWorld;
  }
}
