import Phaser from 'phaser';
import { PheromoneGrid } from '../sim/PheromoneGrid';
import { PheromoneType } from '../sim/PheromoneType';

/**
 * PheromoneRenderer visualizes pheromone grids as heatmap overlays
 * Uses Phaser.Graphics for procedural rendering
 * Food = red gradient, Nest = blue gradient, Danger = yellow gradient
 */
export class PheromoneRenderer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private visible: boolean;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(5); // Render above obstacles but below ants
    this.visible = false;
    this.graphics.setVisible(false);
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

    // Render each pheromone type with different colors
    this.renderPheromoneType(grid, PheromoneType.NEST, gridWidth, gridHeight, cellSize, 0x0000ff); // Blue
    this.renderPheromoneType(grid, PheromoneType.FOOD, gridWidth, gridHeight, cellSize, 0xff0000); // Red
    this.renderPheromoneType(grid, PheromoneType.DANGER, gridWidth, gridHeight, cellSize, 0xffff00); // Yellow
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

        if (strength > 0.01) {
          // Normalize strength to 0-1 range (assuming max strength is 10)
          const normalizedStrength = Math.min(strength / 10.0, 1.0);
          
          // Use quadratic curve for better visual perception
          const opacity = Math.pow(normalizedStrength, 0.5) * 0.6; // Max opacity 0.6

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
