import Phaser from 'phaser';
import { PheromoneGrid } from '../sim/PheromoneGrid';
import { PheromoneType } from '../sim/PheromoneType';
import { PHEROMONE_CONFIG, RENDER_CONFIG, THEME_CONFIG } from '../config';
import { Theme } from '../types/Theme';

/**
 * PheromoneRenderer visualizes pheromone grids as heatmap overlays
 * Uses Phaser.Graphics for procedural rendering
 * Food = red gradient, Nest = blue gradient, Danger = yellow gradient
 */
export class PheromoneRenderer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private visible: boolean;
  private theme: Theme;

  constructor(scene: Phaser.Scene, theme?: Theme) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(RENDER_CONFIG.PHEROMONE_DEPTH);
    this.visible = false;
    this.graphics.setVisible(false);
    this.theme = theme || THEME_CONFIG.default;
  }

  /**
   * Render pheromone grid as a heatmap overlay
   * @param grid The pheromone grid to visualize
   */
  public render(grid: PheromoneGrid): void {
    if (!this.visible) {
      return;
    }

    this.graphics.clear();

    const gridWidth = grid.getGridWidth();
    const gridHeight = grid.getGridHeight();
    const cellSize = grid.getCellSize();

    // Render each pheromone type with theme colors
    this.renderPheromoneType(grid, PheromoneType.NEST, gridWidth, gridHeight, cellSize, this.theme.pheromoneColors.nest);
    this.renderPheromoneType(grid, PheromoneType.FOOD, gridWidth, gridHeight, cellSize, this.theme.pheromoneColors.food);
    this.renderPheromoneType(grid, PheromoneType.DANGER, gridWidth, gridHeight, cellSize, this.theme.pheromoneColors.danger);
  }

  /**
   * Render a specific pheromone type as a heatmap
   */
  private renderPheromoneType(
    grid: PheromoneGrid,
    type: PheromoneType,
    gridWidth: number,
    gridHeight: number,
    cellSize: number,
    color: number
  ): void {
    const data = grid.getGrid(type);
    if (!data) return;

    // Extract RGB components from hex color
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    // Render each cell with opacity based on strength
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const index = y * gridWidth + x;
        const strength = data[index];

        if (strength > PHEROMONE_CONFIG.RENDER_THRESHOLD) {
          // Normalize strength to 0-1 range using configured max strength
          const normalizedStrength = Math.min(strength / PHEROMONE_CONFIG.MAX_STRENGTH, 1.0);
          
          // Use configured power curve for better visual perception
          const opacity = Math.pow(normalizedStrength, PHEROMONE_CONFIG.VISUALIZATION_POWER) * PHEROMONE_CONFIG.MAX_OPACITY;

          // Calculate pixel position
          const pixelX = x * cellSize;
          const pixelY = y * cellSize;

          // Create color with opacity
          const rgbaColor = Phaser.Display.Color.GetColor(r, g, b);
          this.graphics.fillStyle(rgbaColor, opacity);
          this.graphics.fillRect(pixelX, pixelY, cellSize, cellSize);
        }
      }
    }
  }

  /**
   * Toggle pheromone overlay visibility
   */
  public toggle(): void {
    this.visible = !this.visible;
    this.graphics.setVisible(this.visible);
    
    if (!this.visible) {
      this.graphics.clear();
    }
  }

  /**
   * Set visibility explicitly
   */
  public setVisible(visible: boolean): void {
    this.visible = visible;
    this.graphics.setVisible(visible);
    
    if (!visible) {
      this.graphics.clear();
    }
  }

  /**
   * Check if overlay is visible
   */
  public isVisible(): boolean {
    return this.visible;
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.graphics.destroy();
  }
}
