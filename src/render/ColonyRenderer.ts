import Phaser from 'phaser';
import { Colony } from '../sim/Colony';

/**
 * ColonyRenderer handles procedural rendering of colony nests
 * Purely visual - no game logic here
 * Renders colonies as distinct markers to show home locations
 */
export class ColonyRenderer {
  private graphics: Phaser.GameObjects.Graphics;

  // Colony visual properties
  private readonly nestRadius = 20;
  private readonly nestColor = 0x704214; // Dark brown/tan for nest
  private readonly nestBorderColor = 0x8b4513; // Brown border
  private readonly nestBorderWidth = 2;

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  /**
   * Render all colonies to the screen
   * Called each frame from the update loop
   */
  public render(colonies: Colony[]): void {
    // Clear previous frame
    this.graphics.clear();

    for (const colony of colonies) {
      this.drawColony(colony);
    }
  }

  /**
   * Draw a single colony nest
   * Simple circle marker for MVP
   */
  private drawColony(colony: Colony): void {
    // Draw nest base (filled circle)
    this.graphics.fillStyle(this.nestColor, 0.6); // Semi-transparent
    this.graphics.fillCircle(colony.x, colony.y, this.nestRadius);

    // Draw nest border
    this.graphics.lineStyle(this.nestBorderWidth, this.nestBorderColor, 1);
    this.graphics.strokeCircle(colony.x, colony.y, this.nestRadius);

    // Optional: Draw entrance (small inner circle for detail)
    this.graphics.fillStyle(0x000000, 0.3); // Dark entrance
    this.graphics.fillCircle(colony.x, colony.y, this.nestRadius * 0.4);

    // TODO: Future phases could add nest structure visualization
    // TODO: Show resource count or colony health as visual indicator
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.graphics.destroy();
  }
}
