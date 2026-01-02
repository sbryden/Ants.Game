import { PheromoneType } from './PheromoneType';
import { PHEROMONE_CONFIG } from '../config';

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
  
  // Buffer for diffusion calculations (double-buffering)
  private diffusionBuffer: Float32Array;

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
    
    // Initialize diffusion buffer (shared across all types)
    this.diffusionBuffer = new Float32Array(this.gridWidth * this.gridHeight);
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
    
    // Add strength to existing value (accumulate), capped at max strength
    grid[index] = Math.min(grid[index] + strength, PHEROMONE_CONFIG.MAX_STRENGTH);
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
      if (grid[i] < PHEROMONE_CONFIG.MIN_STRENGTH) {
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
   * Diffuse pheromones across the grid using 4-neighbor averaging
   * Uses double-buffering to avoid read-write conflicts
   * 
   * Algorithm: Each cell's new value is the weighted average of itself
   * and its 4 neighbors (north, south, east, west).
   * Edge cells only average with available neighbors.
   * 
   * @param type Pheromone type to diffuse
   * @param diffusionRate Rate of diffusion (0-1). 0 = no diffusion, 1 = full averaging
   */
  public diffuse(type: PheromoneType, diffusionRate: number): void {
    const grid = this.grids.get(type);
    if (!grid) return;

    // Clear the buffer
    this.diffusionBuffer.fill(0);

    // Apply diffusion: for each cell, average with neighbors
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const index = y * this.gridWidth + x;
        const currentValue = grid[index];

        // Accumulate values from this cell and neighbors
        let sum = currentValue;
        let count = 1;

        // North neighbor
        if (y > 0) {
          sum += grid[(y - 1) * this.gridWidth + x];
          count++;
        }

        // South neighbor
        if (y < this.gridHeight - 1) {
          sum += grid[(y + 1) * this.gridWidth + x];
          count++;
        }

        // West neighbor
        if (x > 0) {
          sum += grid[y * this.gridWidth + (x - 1)];
          count++;
        }

        // East neighbor
        if (x < this.gridWidth - 1) {
          sum += grid[y * this.gridWidth + (x + 1)];
          count++;
        }

        // Calculate average
        const average = sum / count;

        // Blend between current value and average based on diffusion rate
        // diffusionRate = 0 means no change, diffusionRate = 1 means full averaging
        this.diffusionBuffer[index] = currentValue * (1 - diffusionRate) + average * diffusionRate;

        // Clamp small values to zero
        if (this.diffusionBuffer[index] < PHEROMONE_CONFIG.MIN_STRENGTH) {
          this.diffusionBuffer[index] = 0;
        }
      }
    }

    // Copy diffusion results back to main grid
    grid.set(this.diffusionBuffer);
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
