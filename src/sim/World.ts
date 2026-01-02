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

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.colonies = [];
    this.nextAntId = 0;
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
   */
  public spawnAnt(colony: Colony): Ant {
    const ant = colony.spawnAnt(this.nextAntId++);
    return ant;
  }

  /**
   * Get all ants across all colonies
   * Useful for global operations like rendering or collision detection
   */
  public getAllAnts(): Ant[] {
    const allAnts: Ant[] = [];
    for (const colony of this.colonies) {
      allAnts.push(...colony.getAnts());
    }
    return allAnts;
  }

  /**
   * Clamp position to world bounds
   * Prevents ants from leaving the simulation space
   */
  public clampPosition(x: number, y: number): { x: number; y: number } {
    return {
      x: Math.max(0, Math.min(this.width, x)),
      y: Math.max(0, Math.min(this.height, y)),
    };
  }
}
