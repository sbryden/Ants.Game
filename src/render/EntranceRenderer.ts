import Phaser from 'phaser';
import { Entrance } from '../sim/Entrance';
import { Theme } from '../types/Theme';
import { THEME_CONFIG } from '../config';

/**
 * EntranceRenderer handles procedural rendering of the entrance
 * (the connection point between surface and underground layers)
 */
export class EntranceRenderer {
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
   * Render the entrance as a dark circular hole
   */
  public render(entrance: Entrance | null): void {
    this.graphics.clear();

    if (!entrance) return;

    // Draw dark hole (entrance)
    this.graphics.fillStyle(0x1a1410, 1.0);
    this.graphics.fillCircle(entrance.surfaceX, entrance.surfaceY, entrance.radius);

    // Draw subtle border
    this.graphics.lineStyle(2, 0x0a0805, 0.8);
    this.graphics.strokeCircle(entrance.surfaceX, entrance.surfaceY, entrance.radius);
  }
}
