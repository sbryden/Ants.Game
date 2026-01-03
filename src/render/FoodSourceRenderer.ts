import Phaser from 'phaser';
import type { FoodSource } from '../sim/FoodSource';
import { FOOD_CONFIG, THEME_CONFIG } from '../config';
import { Theme } from '../types/Theme';

/**
 * Renders a food source as a procedural circle with opacity based on remaining food amount.
 * Uses tan/brown colors to distinguish from ant pheromones.
 */
export class FoodSourceRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private theme: Theme;

  constructor(scene: Phaser.Scene, theme?: Theme) {
    this.graphics = scene.add.graphics({ x: 0, y: 0 });
    this.theme = theme || THEME_CONFIG.default;
  }

  /**
   * Render all food sources in the world.
   * Clears and redraws each frame based on current food amounts.
   */
  render(foodSource: FoodSource | null): void {
    this.graphics.clear();

    if (!foodSource) {
      return;
    }

    // Calculate opacity based on remaining food (0 to 1)
    const foodPercentage = Math.min(foodSource.foodAmount / FOOD_CONFIG.INITIAL_FOOD_AMOUNT, 1.0);
    const alpha = Math.max(0.3, foodPercentage); // Never fully transparent

    // Draw border circle (slightly larger) - use theme colors
    this.graphics.lineStyle(2, this.theme.foodColors.border, alpha);
    this.graphics.strokeCircleShape(
      new Phaser.Geom.Circle(foodSource.x, foodSource.y, foodSource.radius + 1)
    );

    // Draw filled circle
    this.graphics.fillStyle(this.theme.foodColors.food, alpha);
    this.graphics.fillCircleShape(
      new Phaser.Geom.Circle(foodSource.x, foodSource.y, foodSource.radius)
    );
  }

  /**
   * Get the graphics object for adding to display list.
   */
  getGraphics(): Phaser.GameObjects.Graphics {
    return this.graphics;
  }

  /**
   * Destroy the graphics object when done.
   */
  destroy(): void {
    this.graphics.destroy();
  }
}
