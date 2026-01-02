import Phaser from 'phaser';
import { World } from '../sim/World';
import { SimulationSystem } from '../systems/SimulationSystem';
import { AntRenderer } from '../render/AntRenderer';

/**
 * Main game scene for Ants!
 * Wires up Phaser lifecycle to simulation system and rendering
 */
export class MainScene extends Phaser.Scene {
  private world!: World;
  private simulationSystem!: SimulationSystem;
  private antRenderer!: AntRenderer;

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    // Set up camera and background
    this.cameras.main.setBackgroundColor('#2d4a2e');

    // Initialize simulation
    const worldWidth = this.scale.width;
    const worldHeight = this.scale.height;
    this.world = new World(worldWidth, worldHeight);
    this.simulationSystem = new SimulationSystem(this.world);
    this.simulationSystem.initializeWorld();

    // Initialize rendering
    this.antRenderer = new AntRenderer(this);

    // Display title
    this.add
      .text(16, 16, 'Ants!', {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setDepth(100);

    // Display instructions
    this.add
      .text(16, 56, 'Watch the ants wander...', {
        fontSize: '16px',
        color: '#cccccc',
      })
      .setDepth(100);
  }

  update(_time: number, delta: number): void {
    // Convert delta from milliseconds to seconds
    const deltaTime = delta / 1000;

    // Update simulation
    this.simulationSystem.update(deltaTime);

    // Render ants
    this.antRenderer.render(this.world.getAllAnts());
  }

  shutdown(): void {
    // Clean up renderer resources
    this.antRenderer.destroy();
  }
}
