import Phaser from 'phaser';
import { Queen } from '../sim/Queen';

/**
 * QueenRenderer handles procedural rendering of the queen ant.
 * 
 * The queen is larger than worker ants and has a distinct appearance.
 */
export class QueenRenderer {
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
   * Render the queen
   */
  public render(queen: Queen | null): void {
    this.graphics.clear();

    if (!queen) return;

    // Queen body (larger than worker ants)
    this.graphics.fillStyle(0xd4a574, 1.0); // Golden/tan color
    this.graphics.fillCircle(queen.x, queen.y, 8); // Radius 8 (workers are 3)

    // Queen head
    this.graphics.fillStyle(0xb08968, 1.0);
    this.graphics.fillCircle(queen.x, queen.y - 6, 5);

    // Abdomen (distinctive feature)
    this.graphics.fillStyle(0xe6c9a8, 1.0);
    this.graphics.fillCircle(queen.x, queen.y + 6, 6);

    // Crown/marker (visual indicator)
    this.graphics.fillStyle(0xffd700, 1.0); // Gold
    this.graphics.fillCircle(queen.x, queen.y - 10, 2);
  }
}
