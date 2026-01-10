import { Colony } from './Colony';
import { Ant } from './Ant';
import { Obstacle } from './Obstacle';
import { FoodSource } from './FoodSource';
import { PheromoneGrid } from './PheromoneGrid';
import { Entrance } from './Entrance';
import { PHEROMONE_CONFIG, FOOD_CONFIG, COLONY_CONFIG } from '../config';

/**
 * World represents the entire simulation space
 * Grid-based world with colonies and ants
 * Engine-agnostic - no rendering logic here
 */
export class World {
  public width: number;
  public height: number;
  public colonies: Colony[];
  public obstacles: Obstacle[];
  public pheromoneGrid: PheromoneGrid;
  public foodSources: FoodSource[] = [];
  public entrance: Entrance | null = null; // Connection to underground layer
  private nextAntId: number;
  private nextFoodSourceId: number;
  private cachedAnts: Ant[];
  private antsCacheDirty: boolean;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.colonies = [];
    this.obstacles = [];
    this.pheromoneGrid = new PheromoneGrid(width, height, PHEROMONE_CONFIG.GRID_CELL_SIZE);
    this.nextAntId = 0;
    this.nextFoodSourceId = 0;
    this.cachedAnts = [];
    this.antsCacheDirty = true;
  }

  /**
   * Create a new colony at specified position
   */
  public createColony(x: number, y: number): Colony {
    const colonyId = this.colonies.length;
    const colony = new Colony(colonyId, x, y);
    this.colonies.push(colony);
    return colony;
  }

  /**
   * Spawn an ant in a specific colony
   * Invalidates ant cache since the collection has changed
   */
  public spawnAnt(colony: Colony): Ant {
    const ant = colony.spawnAnt(this.nextAntId++);
    this.antsCacheDirty = true;
    return ant;
  }

  /**
   * Remove an ant from the world and invalidate cache
   */
  public removeAnt(target: Ant): void {
    const colony = this.getColony(target.colonyId);
    if (!colony) return;

    const index = colony.ants.indexOf(target);
    if (index !== -1) {
      colony.ants.splice(index, 1);
      this.antsCacheDirty = true;
    }
  }

  /**
   * Get all ants across all colonies
   * Useful for global operations like rendering or collision detection
   * Returns cached array to avoid per-frame allocations
   * Cache is invalidated when ants are spawned or removed
   */
  public getAllAnts(): Ant[] {
    if (this.antsCacheDirty) {
      this.cachedAnts = [];
      for (const colony of this.colonies) {
        this.cachedAnts.push(...colony.getAnts());
      }
      this.antsCacheDirty = false;
    }
    return this.cachedAnts;
  }

  /**
   * Get all colonies in the world
   * Returns shallow copy to prevent external modification
   */
  public getColonies(): Colony[] {
    return [...this.colonies];
  }

  /**
   * Get a specific colony by ID
   * Returns undefined if colony doesn't exist
   */
  public getColony(colonyId: number): Colony | undefined {
    return this.colonies[colonyId];
  }

  /**
   * Add an obstacle to the world
   */
  public addObstacle(obstacle: Obstacle): void {
    this.obstacles.push(obstacle);
  }

  /**
   * Get all obstacles in the world
   */
  public getObstacles(): Obstacle[] {
    return this.obstacles;
  }

  /**
   * Get obstacles within a certain range of a point
   * Useful for perception and avoidance behaviors
   */
  public getObstaclesNear(x: number, y: number, range: number): Obstacle[] {
    const nearby: Obstacle[] = [];
    for (const obstacle of this.obstacles) {
      const dx = obstacle.x - x;
      const dy = obstacle.y - y;
      const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
      // Consider obstacle "near" if any part of it is within range
      if (distanceToCenter - obstacle.radius <= range) {
        nearby.push(obstacle);
      }
    }
    return nearby;
  }

  /**
   * Spawn a new food source at a random valid location
   * Avoids obstacles and colony entrance areas
   * Returns the spawned FoodSource, or null if spawn failed
   */
  public spawnFoodSource(): FoodSource | null {
    const sourceRadius = FOOD_CONFIG.SOURCE_RADIUS;
    const padding = FOOD_CONFIG.SPAWN_EDGE_PADDING;
    const maxAttempts = FOOD_CONFIG.SPAWN_ATTEMPTS;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = padding + Math.random() * (this.width - 2 * padding);
      const y = padding + Math.random() * (this.height - 2 * padding);

      // Check if location is valid (not in obstacles, not in colony)
      if (this.isValidFoodSourceLocation(x, y, sourceRadius)) {
        const foodSource = new FoodSource(
          `food_${this.nextFoodSourceId++}`,
          x,
          y,
          FOOD_CONFIG.INITIAL_FOOD_AMOUNT,
          sourceRadius
        );
        this.foodSources.push(foodSource);
        return foodSource;
      }
    }

    // Fallback: spawn in bottom-right area if random search fails
    const fallbackX = this.width - sourceRadius - padding;
    const fallbackY = this.height - sourceRadius - padding;
    const fallbackFood = new FoodSource(
      `food_${this.nextFoodSourceId++}`,
      fallbackX,
      fallbackY,
      FOOD_CONFIG.INITIAL_FOOD_AMOUNT,
      sourceRadius
    );
    this.foodSources.push(fallbackFood);
    return fallbackFood;
  }

  /**
   * Check if a location is valid for spawning a food source
   * Valid = not in obstacle, not in colony entrance
   */
  private isValidFoodSourceLocation(x: number, y: number, radius: number): boolean {
    const minDistance = radius + FOOD_CONFIG.SPAWN_BUFFER_DISTANCE;

    // Check against obstacles
    for (const obstacle of this.obstacles) {
      const dx = obstacle.x - x;
      const dy = obstacle.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < minDistance + obstacle.radius) {
        return false;
      }
    }

    // Check against colony entrances
    for (const colony of this.colonies) {
      const dx = colony.x - x;
      const dy = colony.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < minDistance + COLONY_CONFIG.ENTRANCE_RADIUS) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get food sources near a location
   */
  public getFoodSourcesNear(x: number, y: number, range: number): FoodSource[] {
    const nearby: FoodSource[] = [];

    for (const foodSource of this.foodSources) {
      const dx = foodSource.x - x;
      const dy = foodSource.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= range) {
        nearby.push(foodSource);
      }
    }

    return nearby;
  }
}
