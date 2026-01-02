/**
 * FoodSource represents a food pile in the world that ants can harvest from
 * 
 * Food sources are depletable: as ants harvest, the foodAmount decreases
 * When fully depleted, the world spawns a new food source elsewhere
 */

export class FoodSource {
  public readonly id: string;
  public readonly x: number;
  public readonly y: number;
  public readonly radius: number;
  public foodAmount: number;

  constructor(
    id: string,
    x: number,
    y: number,
    foodAmount: number,
    radius: number
  ) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.foodAmount = foodAmount;
    this.radius = radius;
  }

  /**
   * Harvest food from this source
   * @param amount The amount of food to harvest
   * @returns The actual amount harvested (min of amount and available foodAmount)
   */
  public harvest(amount: number): number {
    const harvested = Math.min(amount, this.foodAmount);
    this.foodAmount -= harvested;
    return harvested;
  }

  /**
   * Check if this food source has been fully depleted
   */
  public isDepleted(): boolean {
    return this.foodAmount <= 0;
  }
}
