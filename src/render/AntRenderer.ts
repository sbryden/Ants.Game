import Phaser from 'phaser';
import { Ant } from '../sim/Ant';
import { AntState } from '../sim/AntState';

/**
 * AntRenderer handles procedural rendering of ants using Phaser.Graphics
 * Purely visual - no game logic here
 * Renders ants as simple shapes for MVP clarity
 */
export class AntRenderer {
  private graphics: Phaser.GameObjects.Graphics;

  // Ant visual properties
  private readonly antBodyRadius = 3;
  private readonly antHeadRadius = 2;
  private readonly antHeadColor = 0x654321; // Darker brown

  // State-based body colors for debug visualization
  private readonly stateColors = {
    [AntState.IDLE]: 0x808080,      // Gray - idle/resting
    [AntState.WANDERING]: 0x8b4513, // Brown - normal wandering
    [AntState.FORAGING]: 0x4a7c4e,  // Green - searching for food
    [AntState.RETURNING]: 0x4169a1, // Blue - returning home
  };

  constructor(scene: Phaser.Scene) {
    this.graphics = scene.add.graphics();
  }

  /**
   * Render all ants to the screen
   * Called each frame from the update loop
   */
  public render(ants: Ant[]): void {
    // Clear previous frame
    this.graphics.clear();

    for (const ant of ants) {
      this.drawAnt(ant);
    }
  }

  /**
   * Draw a single ant as simple circles
   * Body color indicates current state (debug visualization)
   * Body + head for MVP, expandable for future detail (legs, mandibles, etc.)
   */
  private drawAnt(ant: Ant): void {
    // Calculate head position based on velocity direction
    const speed = Math.sqrt(ant.vx * ant.vx + ant.vy * ant.vy);
    let headOffsetX = 0;
    let headOffsetY = 0;

    if (speed > 0) {
      const normalizedVx = ant.vx / speed;
      const normalizedVy = ant.vy / speed;
      headOffsetX = normalizedVx * (this.antBodyRadius + this.antHeadRadius);
      headOffsetY = normalizedVy * (this.antBodyRadius + this.antHeadRadius);
    }

    // Draw body with state-based color
    const bodyColor = this.stateColors[ant.state] || 0x8b4513; // Default to brown
    this.graphics.fillStyle(bodyColor, 1);
    this.graphics.fillCircle(ant.x, ant.y, this.antBodyRadius);

    // Draw head
    this.graphics.fillStyle(this.antHeadColor, 1);
    this.graphics.fillCircle(
      ant.x + headOffsetX,
      ant.y + headOffsetY,
      this.antHeadRadius
    );

    // TODO: Add legs, antennae for more realistic appearance
    // TODO: Add pheromone trail visualization
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.graphics.destroy();
  }
}
