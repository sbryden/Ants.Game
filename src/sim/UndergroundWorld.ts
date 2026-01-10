import { TileType } from './TileType';
import { Entrance } from './Entrance';
import { Queen } from './Queen';
import { Egg } from './Egg';

/**
 * UndergroundWorld - Engine-agnostic underground simulation state.
 * 
 * Represents the side-view underground layer with tile-based grid.
 * This runs in parallel with the surface World, sharing ants that transition
 * between layers through the entrance.
 * 
 * Grid layout:
 * - Top row (y=0) is ground level
 * - Y increases downward (digging deeper)
 * - Tiles are square (match grid resolution)
 */

export class UndergroundWorld {
  /** Width in tiles */
  readonly width: number;
  
  /** Height in tiles (depth) */
  readonly height: number;
  
  /** Size of each tile in pixels */
  readonly tileSize: number;
  
  /** 2D grid of tile types [y][x] */
  tiles: TileType[][];
  
  /** Entrance connecting to surface */
  entrance: Entrance;

  /** Queen (colony reproduction center) */
  queen: Queen | null = null;

  /** Eggs laid by the queen */
  eggs: Egg[] = [];

  private nextEggId: number = 0;

  constructor(width: number, height: number, tileSize: number, entrance: Entrance) {
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.entrance = entrance;
    
    // Initialize grid with all DIRT
    this.tiles = [];
    for (let y = 0; y < height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < width; x++) {
        this.tiles[y][x] = TileType.DIRT;
      }
    }
    
    // Create initial tunnel structure
    this.createInitialTunnel();
  }

  /**
   * Create the starting tunnel configuration:
   * - Entrance at top
   * - Short vertical shaft
   * - Horizontal tunnel to the right
   * - Small queen chamber at the end
   */
  private createInitialTunnel(): void {
    const entranceX = Math.floor(this.entrance.undergroundX / this.tileSize);
    const entranceY = Math.floor(this.entrance.undergroundY / this.tileSize);
    
    // Entrance tile
    this.setTile(entranceX, entranceY, TileType.ENTRANCE);
    
    // Vertical shaft down (3-5 tiles)
    const shaftDepth = 4;
    for (let i = 1; i <= shaftDepth; i++) {
      this.setTile(entranceX, entranceY + i, TileType.TUNNEL);
    }
    
    // Horizontal tunnel to the right (4-6 tiles)
    const tunnelLength = 5;
    const chamberY = entranceY + shaftDepth;
    for (let i = 1; i <= tunnelLength; i++) {
      this.setTile(entranceX + i, chamberY, TileType.TUNNEL);
    }
    
    // Queen chamber (2x3 tiles)
    const chamberX = entranceX + tunnelLength;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = 0; dx <= 1; dx++) {
        this.setTile(chamberX + dx, chamberY + dy, TileType.CHAMBER);
      }
    }
  }

  /**
   * Set a tile type at grid coordinates.
   * Bounds-checked.
   */
  setTile(x: number, y: number, type: TileType): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y][x] = type;
    }
  }

  /**
   * Get tile type at grid coordinates.
   * Returns DIRT if out of bounds.
   */
  getTile(x: number, y: number): TileType {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.tiles[y][x];
    }
    return TileType.DIRT;
  }

  /**
   * Convert world pixel coordinates to grid coordinates.
   */
  worldToGrid(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: Math.floor(worldX / this.tileSize),
      y: Math.floor(worldY / this.tileSize),
    };
  }

  /**
   * Convert grid coordinates to world pixel coordinates (center of tile).
   */
  gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * this.tileSize + this.tileSize / 2,
      y: gridY * this.tileSize + this.tileSize / 2,
    };
  }

  /**
   * Check if a tile is passable for ants.
   * Ants can move through TUNNEL, CHAMBER, and ENTRANCE tiles.
   */
  isPassable(x: number, y: number): boolean {
    const tile = this.getTile(x, y);
    return tile === TileType.TUNNEL || tile === TileType.CHAMBER || tile === TileType.ENTRANCE;
  }

  /**
   * Check if a tile can be dug.
   * Only DIRT tiles can be excavated.
   */
  isDiggable(x: number, y: number): boolean {
    return this.getTile(x, y) === TileType.DIRT;
  }

  /**
   * Spawn the queen in the initial chamber.
   */
  spawnQueen(colonyId: number): Queen {
    // Place queen in center of initial queen chamber
    const gridPos = this.worldToGrid(this.entrance.undergroundX, this.entrance.undergroundY);
    const chamberX = gridPos.x + 5; // Offset to chamber location
    const chamberY = gridPos.y + 4;
    const worldPos = this.gridToWorld(chamberX, chamberY);
    
    this.queen = new Queen(0, worldPos.x, worldPos.y, colonyId);
    return this.queen;
  }

  /**
   * Lay an egg from the queen.
   * Places egg near queen in a chamber tile.
   */
  layEgg(colonyId: number): Egg | null {
    if (!this.queen) return null;

    // Find a nearby chamber tile for the egg
    const queenGridPos = this.worldToGrid(this.queen.x, this.queen.y);
    
    // Search for chamber tiles nearby
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const checkX = queenGridPos.x + dx;
        const checkY = queenGridPos.y + dy;
        
        if (this.getTile(checkX, checkY) === TileType.CHAMBER) {
          // Check if there's already an egg at this position
          const worldPos = this.gridToWorld(checkX, checkY);
          const hasEgg = this.eggs.some(egg => 
            Math.abs(egg.x - worldPos.x) < 5 && Math.abs(egg.y - worldPos.y) < 5
          );
          
          if (!hasEgg) {
            // Place egg here
            const egg = new Egg(this.nextEggId++, worldPos.x, worldPos.y, colonyId);
            this.eggs.push(egg);
            return egg;
          }
        }
      }
    }
    
    return null; // No space for egg
  }
}
