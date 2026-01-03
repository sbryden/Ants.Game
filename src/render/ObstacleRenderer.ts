import * as Phaser from 'phaser';
import { Obstacle } from '../sim/Obstacle';
import { THEME_CONFIG } from '../config';
import { Theme } from '../types/Theme';

/**
 * ObstacleRenderer handles visualization of static obstacles.
 * Uses procedural graphics to draw circles representing obstacles.
 */
export class ObstacleRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private theme: Theme;

  constructor(scene: Phaser.Scene, theme?: Theme) {
    this.graphics = scene.add.graphics();
    this.theme = theme || THEME_CONFIG.default;
  }

  /**
   * Render all obstacles in the world.
   * Obstacles are drawn as filled circles with theme colors.
   */
  public render(obstacles: Obstacle[]): void {
    this.graphics.clear();

    for (const obstacle of obstacles) {
      // Use theme color for obstacles
      this.graphics.fillStyle(this.theme.obstacleColor, 1.0);
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
