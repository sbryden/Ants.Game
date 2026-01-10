/**
 * Queen - The colony's reproduction center.
 * 
 * The queen is a stationary entity in the underground chamber
 * that produces eggs to grow the colony. She requires food from
 * workers to continue egg production.
 * 
 * Engine-agnostic data structure - no rendering logic.
 */

export class Queen {
  public id: number;
  public x: number;
  public y: number;
  public colonyId: number;
  
  /** Food stored for egg production */
  public foodReserve: number = 100;
  
  /** Time since last egg laid (seconds) */
  public timeSinceLastEgg: number = 0;
  
  /** Total eggs laid by this queen */
  public totalEggsLaid: number = 0;

  constructor(id: number, x: number, y: number, colonyId: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.colonyId = colonyId;
  }

  /**
   * Check if queen has enough food to lay an egg.
   */
  canLayEgg(): boolean {
    return this.foodReserve >= 10; // Requires 10 food units per egg
  }

  /**
   * Consume food to lay an egg.
   * Returns true if egg was laid.
   */
  layEgg(): boolean {
    if (this.canLayEgg()) {
      this.foodReserve -= 10;
      this.timeSinceLastEgg = 0;
      this.totalEggsLaid++;
      return true;
    }
    return false;
  }

  /**
   * Feed the queen with food from a worker.
   */
  feed(amount: number): void {
    this.foodReserve += amount;
    // Cap at 200 to prevent unlimited accumulation
    if (this.foodReserve > 200) {
      this.foodReserve = 200;
    }
  }
}
