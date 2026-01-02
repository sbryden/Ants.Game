import { Ant } from './Ant';

/**
 * Colony data structure
 * Manages a group of ants and colony-level state
 */
export class Colony {
  public id: number;
  public x: number; // Colony center position
  public y: number;
  public ants: Ant[];
  public resourceCount: number; // Food/resources stored (Phase 4 feature, structure ready)

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.ants = [];
    this.resourceCount = 0;
  }

  /**
   * Spawn a new ant at the colony location
   */
  public spawnAnt(antId: number): Ant {
    const ant = new Ant(antId, this.x, this.y, this.id);
    this.ants.push(ant);
    return ant;
  }

  /**
   * Get all ants belonging to this colony
   * Returns a shallow copy of the array to prevent external modification of the colony's ant list
   */
  public getAnts(): Ant[] {
    return [...this.ants];
  }

  /**
   * Get the count of ants in this colony
   */
  public getAntCount(): number {
    return this.ants.length;
  }
}
