import Phaser from 'phaser';
import { Ant } from '../sim/Ant';
import { AntState } from '../sim/AntState';
import { ANT_RENDER_CONFIG, ANT_CARRY_CONFIG } from '../config';

/**
 * AntRenderer handles procedural rendering of ants using Phaser.Graphics
 * Purely visual - no game logic here
 * Renders ants as simple shapes for MVP clarity
 */
export class AntRenderer {
  private graphics: Phaser.GameObjects.Graphics;

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
      headOffsetX = normalizedVx * (ANT_RENDER_CONFIG.BODY_RADIUS + ANT_RENDER_CONFIG.HEAD_RADIUS);
      headOffsetY = normalizedVy * (ANT_RENDER_CONFIG.BODY_RADIUS + ANT_RENDER_CONFIG.HEAD_RADIUS);
    }

    // Draw body with state-based color
    const bodyColor = ANT_RENDER_CONFIG.STATE_COLORS[ant.state] || ANT_RENDER_CONFIG.DEFAULT_BODY_COLOR;
    this.graphics.fillStyle(bodyColor, 1);
    this.graphics.fillCircle(ant.x, ant.y, ANT_RENDER_CONFIG.BODY_RADIUS);

    // Draw head
    this.graphics.fillStyle(ANT_RENDER_CONFIG.HEAD_COLOR, 1);
    this.graphics.fillCircle(
      ant.x + headOffsetX,
      ant.y + headOffsetY,
      ANT_RENDER_CONFIG.HEAD_RADIUS
    );

    // Draw carrying indicator if ant has food
    if (ant.carriedFood > 0) {
      const carryScale = ant.carriedFood / ANT_CARRY_CONFIG.MAX_CAPACITY;
      const indicatorRadius = ANT_CARRY_CONFIG.CARRYING_INDICATOR_RADIUS * carryScale;
      
      this.graphics.fillStyle(ANT_CARRY_CONFIG.CARRYING_INDICATOR_COLOR, 0.8);
      this.graphics.fillCircle(ant.x, ant.y, indicatorRadius);
    }

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
