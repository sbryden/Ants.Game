import * as Phaser from 'phaser';
import { Obstacle } from '../sim/Obstacle';

/**
 * ObstacleRenderer handles visualization of static obstacles.
 * Uses procedural graphics to draw circles representing obstacles.
 */
export class ObstacleRenderer {
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  /**
   * Render all obstacles in the world.
   * Obstacles are drawn as filled dark gray circles with a black outline.
   */
  public render(obstacles: Obstacle[]): void {
    this.graphics.clear();

    for (const obstacle of obstacles) {
      // Dark gray fill
      this.graphics.fillStyle(0x4a4a4a, 1.0);
      this.graphics.fillCircle(obstacle.x, obstacle.y, obstacle.radius);

      // Black outline
      this.graphics.lineStyle(2, 0x000000, 1.0);
      this.graphics.strokeCircle(obstacle.x, obstacle.y, obstacle.radius);
    }
  }

  /**
   * Clean up graphics resources
   */
  public destroy(): void {
    this.graphics.destroy();
  }
}
