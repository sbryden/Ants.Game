import { PheromoneType } from './PheromoneType';

/**
 * PheromoneGrid manages pheromone storage and operations
 * Uses flat Float32Array for performance with large grids
 * Engine-agnostic - no Phaser imports
 */
export class PheromoneGrid {
  private width: number;
  private height: number;
  private cellSize: number;
  private gridWidth: number;
  private gridHeight: number;
  
  // Separate grid for each pheromone type
  private grids: Map<PheromoneType, Float32Array>;

  /**
   * Create a new pheromone grid
   * @param worldWidth World width in pixels
   * @param worldHeight World height in pixels
   * @param cellSize Size of each grid cell in pixels (1 = highest resolution)
   */
  constructor(worldWidth: number, worldHeight: number, cellSize: number) {
    this.width = worldWidth;
    this.height = worldHeight;
    this.cellSize = cellSize;
    
    // Calculate grid dimensions (round up to cover entire world)
    this.gridWidth = Math.ceil(worldWidth / cellSize);
    this.gridHeight = Math.ceil(worldHeight / cellSize);
    
    // Initialize storage for each pheromone type
    this.grids = new Map();
    for (const type of Object.values(PheromoneType)) {
      this.grids.set(type, new Float32Array(this.gridWidth * this.gridHeight));
    }
  }

  /**
   * Deposit pheromone at a world position
   * @param x World X coordinate in pixels
   * @param y World Y coordinate in pixels
   * @param type Pheromone type to deposit
   * @param strength Strength of the deposit (will be added to existing value)
   */
  public deposit(x: number, y: number, type: PheromoneType, strength: number): void {
    // Convert world coordinates to grid coordinates
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);

    // Bounds check
    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return;
    }

    const grid = this.grids.get(type);
    if (!grid) return;

    const index = gridY * this.gridWidth + gridX;
    
    // Add strength to existing value (accumulate)
    grid[index] = Math.min(grid[index] + strength, 10.0); // Cap at 10.0 to prevent overflow
  }

  /**
   * Sample pheromone strength at a world position
   * @param x World X coordinate in pixels
   * @param y World Y coordinate in pixels
   * @param type Pheromone type to sample
   * @returns Pheromone strength at that position (0 if out of bounds)
   */
  public sample(x: number, y: number, type: PheromoneType): number {
    // Convert world coordinates to grid coordinates
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);

    // Bounds check
    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
      return 0;
    }

    const grid = this.grids.get(type);
    if (!grid) return 0;

    const index = gridY * this.gridWidth + gridX;
    return grid[index];
  }

  /**
   * Decay all pheromones by a rate per second
   * @param deltaTime Time elapsed in seconds
   * @param decayRate Decay rate (0-1, proportion lost per second)
   * @param type Pheromone type to decay
   */
  public decay(deltaTime: number, decayRate: number, type: PheromoneType): void {
    const grid = this.grids.get(type);
    if (!grid) return;

    // Calculate decay multiplier (exponential decay)
    const decayMultiplier = Math.pow(1 - decayRate, deltaTime);

    // Apply decay to all cells
    for (let i = 0; i < grid.length; i++) {
      grid[i] *= decayMultiplier;
      
      // Clamp very small values to zero to avoid floating point issues
      if (grid[i] < 0.001) {
        grid[i] = 0;
      }
    }
  }

  /**
   * Get the raw grid data for a pheromone type
   * Used by renderer for visualization
   * @param type Pheromone type
   * @returns Float32Array of pheromone values, or undefined if type doesn't exist
   */
  public getGrid(type: PheromoneType): Float32Array | undefined {
    return this.grids.get(type);
  }

  /**
   * Get grid dimensions
   */
  public getGridWidth(): number {
    return this.gridWidth;
  }

  public getGridHeight(): number {
    return this.gridHeight;
  }

  public getCellSize(): number {
    return this.cellSize;
  }

  /**
   * Clear all pheromones (useful for testing)
   */
  public clear(): void {
    for (const grid of this.grids.values()) {
      grid.fill(0);
    }
  }

  /**
   * Clear a specific pheromone type
   */
  public clearType(type: PheromoneType): void {
    const grid = this.grids.get(type);
    if (grid) {
      grid.fill(0);
    }
  }
}
