import Phaser from 'phaser';
import { UndergroundWorld } from '../sim/UndergroundWorld';
import { World } from '../sim/World';
import { TileType } from '../sim/TileType';
import { AntRenderer } from '../render/AntRenderer';
import { QueenRenderer } from '../render/QueenRenderer';
import { EggRenderer } from '../render/EggRenderer';
import { THEME_CONFIG } from '../config';

/**
 * UndergroundScene - Side-view rendering of underground colony.
 * 
 * Shows a cross-section view of the underground tunnel network,
 * chambers, queen, eggs, and underground ants.
 * 
 * Runs in parallel with MainScene (surface view).
 * Press 'U' to toggle between views.
 */

export class UndergroundScene extends Phaser.Scene {
  private undergroundWorld!: UndergroundWorld;
  private world!: World;
  private graphics!: Phaser.GameObjects.Graphics;
  private antRenderer!: AntRenderer;
  private queenRenderer!: QueenRenderer;
  private eggRenderer!: EggRenderer;

  constructor() {
    super({ key: 'UndergroundScene' });
  }

  init(data: { undergroundWorld: UndergroundWorld; world: World }) {
    this.undergroundWorld = data.undergroundWorld;
    this.world = data.world;
  }

  create() {
    // Create graphics object for rendering tiles
    this.graphics = this.add.graphics();

    // Initialize renderers
    this.antRenderer = new AntRenderer(this, THEME_CONFIG.default);
    this.queenRenderer = new QueenRenderer(this);
    this.eggRenderer = new EggRenderer(this);

    // Background (sky/surface line)
    this.add.rectangle(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x4a3c2a // Brown dirt color
    ).setOrigin(0, 0);

    // Instructions text
    this.add.text(10, 10, "Underground View - Press 'U' to return to surface", {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 },
    });

    // Set up 'U' key to toggle back to surface
    this.input.keyboard?.on('keydown-U', () => {
      this.scene.pause('UndergroundScene');
      this.scene.resume('MainScene');
    });
  }

  update() {
    // Clear previous frame
    this.graphics.clear();

    // Render tile grid
    this.renderTiles();

    // Render queen
    this.queenRenderer.render(this.undergroundWorld.queen);

    // Render eggs
    this.eggRenderer.render(this.undergroundWorld.eggs);

    // Render underground ants
    const allAnts = this.world.getAllAnts();
    this.antRenderer.render(allAnts, false, 'underground');
  }

  private renderTiles(): void {
    const tileSize = this.undergroundWorld.tileSize;

    for (let y = 0; y < this.undergroundWorld.height; y++) {
      for (let x = 0; x < this.undergroundWorld.width; x++) {
        const tile = this.undergroundWorld.getTile(x, y);
        const worldPos = this.undergroundWorld.gridToWorld(x, y);

        // Skip rendering DIRT tiles (they're the background)
        if (tile === TileType.DIRT) continue;

        // Determine color based on tile type
        let color: number;
        let alpha: number = 1.0;

        switch (tile) {
          case TileType.TUNNEL:
            color = 0x2a2420; // Dark brown tunnel
            break;
          case TileType.CHAMBER:
            color = 0x3a3430; // Slightly lighter brown chamber
            break;
          case TileType.ENTRANCE:
            color = 0x1a1410; // Very dark entrance
            break;
          default:
            continue;
        }

        // Draw tile as filled rectangle
        this.graphics.fillStyle(color, alpha);
        this.graphics.fillRect(
          worldPos.x - tileSize / 2,
          worldPos.y - tileSize / 2,
          tileSize,
          tileSize
        );

        // Draw subtle border for chambers
        if (tile === TileType.CHAMBER) {
          this.graphics.lineStyle(1, 0x5a5450, 0.5);
          this.graphics.strokeRect(
            worldPos.x - tileSize / 2,
            worldPos.y - tileSize / 2,
            tileSize,
            tileSize
          );
        }
      }
    }
  }
}
