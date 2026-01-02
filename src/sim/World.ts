import { Colony } from './Colony';
import { Ant } from './Ant';

/**
 * World represents the entire simulation space
 * Grid-based world with colonies and ants
 * Engine-agnostic - no rendering logic here
 */
export class World {
  public width: number;
  public height: number;
  public colonies: Colony[];
  private nextAntId: number;
  private cachedAnts: Ant[];
  private antsCacheDirty: boolean;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.colonies = [];
    this.nextAntId = 0;
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
   * Get all ants across all colonies
   * Useful for global operations like rendering or collision detection
   * Returns cached array to avoid per-frame allocations
   * Note: Cache is invalidated only on ant spawn (MVP does not support removal)
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
}
