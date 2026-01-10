import Phaser from 'phaser';
import { Egg } from '../sim/Egg';

/**
 * EggRenderer handles procedural rendering of ant eggs.
 * 
 * Eggs are small white/cream colored circles.
 */
export class EggRenderer {
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  /**
   * Set the rendering depth
   */
  public setDepth(depth: number): void {
    this.graphics.setDepth(depth);
  }

  /**
   * Render all eggs
   */
  public render(eggs: Egg[]): void {
    this.graphics.clear();

    for (const egg of eggs) {
      // Egg body (small white circle)
      this.graphics.fillStyle(0xf5f5dc, 1.0); // Beige/cream color
      this.graphics.fillCircle(egg.x, egg.y, 2);

      // Subtle border
      this.graphics.lineStyle(1, 0xe0e0d1, 0.8);
      this.graphics.strokeCircle(egg.x, egg.y, 2);
    }
  }
}
