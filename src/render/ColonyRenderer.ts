import Phaser from 'phaser';
import { Colony } from '../sim/Colony';
import { COLONY_RENDER_CONFIG, THEME_CONFIG } from '../config';
import { Theme } from '../types/Theme';

/**
 * ColonyRenderer handles procedural rendering of colony nests
 * Purely visual - no game logic here
 * Renders colonies as distinct markers to show home locations
 */
export class ColonyRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private theme: Theme;

  constructor(scene: Phaser.Scene, theme?: Theme) {
    this.graphics = scene.add.graphics();
    this.theme = theme || THEME_CONFIG.default;
  }

  /**
   * Set the rendering depth
   */
  public setDepth(depth: number): void {
    this.graphics.setDepth(depth);
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
    // Draw nest base (filled circle) - use theme colors
    this.graphics.fillStyle(this.theme.colonyColors.nest, COLONY_RENDER_CONFIG.NEST_OPACITY);
    this.graphics.fillCircle(colony.x, colony.y, COLONY_RENDER_CONFIG.NEST_RADIUS);

    // Draw nest border
    this.graphics.lineStyle(COLONY_RENDER_CONFIG.NEST_BORDER_WIDTH, this.theme.colonyColors.border, 1);
    this.graphics.strokeCircle(colony.x, colony.y, COLONY_RENDER_CONFIG.NEST_RADIUS);

    // Optional: Draw entrance (small inner circle for detail)
    this.graphics.fillStyle(this.theme.colonyColors.entrance, COLONY_RENDER_CONFIG.ENTRANCE_OPACITY);
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
