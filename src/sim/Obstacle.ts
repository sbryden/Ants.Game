/**
 * Represents a static obstacle in the world that ants must navigate around.
 * 
 * Obstacles are simple circular regions for MVP. Can be extended to support
 * rectangles or polygons in the future.
 */
export class Obstacle {
  public readonly x: number;
  public readonly y: number;
  public readonly radius: number;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  /**
   * Check if a point is inside this obstacle (collision detection).
   */
  containsPoint(x: number, y: number): boolean {
    const dx = x - this.x;
    const dy = y - this.y;
    return (dx * dx + dy * dy) <= (this.radius * this.radius);
  }

  /**
   * Get the distance from a point to the nearest edge of this obstacle.
   * Returns negative if point is inside the obstacle.
   */
  distanceToEdge(x: number, y: number): number {
    const dx = x - this.x;
    const dy = y - this.y;
    const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
    return distanceToCenter - this.radius;
  }
}
