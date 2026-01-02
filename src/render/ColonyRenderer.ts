import Phaser from 'phaser';
import { Colony } from '../sim/Colony';
import { COLONY_RENDER_CONFIG } from '../config';

/**
 * ColonyRenderer handles procedural rendering of colony nests
 * Purely visual - no game logic here
 * Renders colonies as distinct markers to show home locations
 */
export class ColonyRenderer {
  private graphics: Phaser.GameObjects.Graphics;

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
    this.graphics.fillStyle(COLONY_RENDER_CONFIG.NEST_COLOR, COLONY_RENDER_CONFIG.NEST_OPACITY);
    this.graphics.fillCircle(colony.x, colony.y, COLONY_RENDER_CONFIG.NEST_RADIUS);

    // Draw nest border
    this.graphics.lineStyle(COLONY_RENDER_CONFIG.NEST_BORDER_WIDTH, COLONY_RENDER_CONFIG.NEST_BORDER_COLOR, 1);
    this.graphics.strokeCircle(colony.x, colony.y, COLONY_RENDER_CONFIG.NEST_RADIUS);

    // Optional: Draw entrance (small inner circle for detail)
    this.graphics.fillStyle(COLONY_RENDER_CONFIG.ENTRANCE_COLOR, COLONY_RENDER_CONFIG.ENTRANCE_OPACITY);
    this.graphics.fillCircle(colony.x, colony.y, COLONY_RENDER_CONFIG.NEST_RADIUS * COLONY_RENDER_CONFIG.ENTRANCE_RADIUS_MULTIPLIER);

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
