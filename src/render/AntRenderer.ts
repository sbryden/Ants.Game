import Phaser from 'phaser';
import { Ant } from '../sim/Ant';
import { AntState } from '../sim/AntState';
import { ANT_RENDER_CONFIG, ANT_CARRY_CONFIG, THEME_CONFIG } from '../config';
import { Theme } from '../types/Theme';
import { deriveRole, getRoleColor } from '../sim/traits/roleDerivation';

/**
 * AntRenderer handles procedural rendering of ants using Phaser.Graphics
 * Purely visual - no game logic here
 * Renders ants as simple shapes for MVP clarity
 */
export class AntRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private theme: Theme;
  private traitVisualizationEnabled: boolean = false;

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
   * Enable or disable trait visualization
   */
  public setTraitVisualization(enabled: boolean): void {
    this.traitVisualizationEnabled = enabled;
  }

  /**
   * Render all ants to the screen
   * Called each frame from the update loop
   * Only renders ants on the specified layer (defaults to 'surface')
   */
  public render(ants: Ant[], traitVisualizationEnabled?: boolean, layer: 'surface' | 'underground' = 'surface'): void {
    // Update trait visualization mode if provided
    if (traitVisualizationEnabled !== undefined) {
      this.traitVisualizationEnabled = traitVisualizationEnabled;
    }

    // Clear previous frame
    this.graphics.clear();

    for (const ant of ants) {
      // Only render ants on the current layer
      if (ant.currentLayer === layer) {
        this.drawAnt(ant);
      }
    }
  }

  /**
   * Draw a single ant as simple circles
   * Body color indicates current state (debug visualization) or derived role (trait mode)
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

    // Determine body color based on visualization mode
    let bodyColor: number;
    if (this.traitVisualizationEnabled) {
      // Trait visualization mode: color by derived role
      const role = deriveRole(ant.traits);
      bodyColor = getRoleColor(role);
    } else {
      // Normal mode: color by state
      const stateColorMap: Record<AntState, keyof Theme['antColors']> = {
        [AntState.IDLE]: 'idle',
        [AntState.WANDERING]: 'wandering',
        [AntState.FORAGING]: 'foraging',
        [AntState.RETURNING]: 'returning',
        [AntState.DIGGING]: 'idle', // Use idle color for digging (brown/earth tone)
      };
      const colorKey = stateColorMap[ant.state] || 'wandering';
      bodyColor = this.theme.antColors[colorKey];
    }

    // Draw body with chosen color
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
      const maxCapacity = ANT_CARRY_CONFIG.MAX_CAPACITY * ant.traits.carryCapacity;
      const carryScale = ant.carriedFood / maxCapacity;
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
