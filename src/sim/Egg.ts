/**
 * Egg - The first stage of the ant lifecycle.
 * 
 * Eggs are laid by the queen in chamber tiles.
 * They will eventually hatch into larvae (Phase 8 - Full Brood Lifecycle).
 * 
 * For Phase 7D, eggs are visualization only - they don't hatch yet.
 * 
 * Engine-agnostic data structure - no rendering logic.
 */

export class Egg {
  public id: number;
  public x: number;
  public y: number;
  public colonyId: number;
  
  /** Age of the egg in seconds */
  public age: number = 0;
  
  /** Time required to hatch (placeholder for Phase 8) */
  public readonly hatchTime: number = 30; // 30 seconds to hatch

  constructor(id: number, x: number, y: number, colonyId: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.colonyId = colonyId;
  }

  /**
   * Update egg age.
   * For Phase 7D, eggs don't hatch yet - this is placeholder for Phase 8.
   */
  update(deltaTime: number): void {
    this.age += deltaTime;
  }

  /**
   * Check if egg is ready to hatch (Phase 8 feature).
   */
  isReadyToHatch(): boolean {
    return false; // Always false until Phase 8
  }
}
