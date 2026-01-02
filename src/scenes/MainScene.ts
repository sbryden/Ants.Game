import Phaser from 'phaser';
import { World } from '../sim/World';
import { SimulationSystem } from '../systems/SimulationSystem';
import { AntRenderer } from '../render/AntRenderer';
import { ColonyRenderer } from '../render/ColonyRenderer';
import { AntState } from '../sim/AntState';
import { Ant } from '../sim/Ant';

/**
 * Main game scene for Ants!
 * Wires up Phaser lifecycle to simulation system and rendering
 */
export class MainScene extends Phaser.Scene {
  private world!: World;
  private simulationSystem!: SimulationSystem;
  private antRenderer!: AntRenderer;
  private colonyRenderer!: ColonyRenderer;
  private debugText!: Phaser.GameObjects.Text;

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
    this.colonyRenderer = new ColonyRenderer(this);

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
      .text(16, 56, 'Watch the ants wander and return home...', {
        fontSize: '16px',
        color: '#cccccc',
      })
      .setDepth(100);

    // State color legend
    this.add
      .text(16, 84, 'Colors: Gray=Idle, Brown=Wandering, Green=Foraging, Blue=Returning', {
        fontSize: '12px',
        color: '#aaaaaa',
      })
      .setDepth(100);

    // Debug: State distribution counter
    this.debugText = this.add
      .text(16, this.scale.height - 40, '', {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#00000088',
        padding: { x: 8, y: 4 },
      })
      .setDepth(100);
  }

  update(_time: number, delta: number): void {
    // Convert delta from milliseconds to seconds
    const deltaTime = delta / 1000;

    // Update simulation
    this.simulationSystem.update(deltaTime);

    // Render colonies (nests) first so ants appear on top
    this.colonyRenderer.render(this.world.getColonies());

    // Render ants
    const ants = this.world.getAllAnts();
    this.antRenderer.render(ants);

    // Update debug UI with state distribution
    this.updateDebugUI(ants);
  }

  /**
   * Update debug UI showing state distribution
   */
  private updateDebugUI(ants: Ant[]): void {
    // Count ants in each state
    const stateCounts = {
      [AntState.IDLE]: 0,
      [AntState.WANDERING]: 0,
      [AntState.FORAGING]: 0,
      [AntState.RETURNING]: 0,
    };

    for (const ant of ants) {
      stateCounts[ant.state as keyof typeof stateCounts]++;
    }

    // Format debug text
    const debugInfo = [
      `Total: ${ants.length}`,
      `Idle: ${stateCounts[AntState.IDLE]}`,
      `Wandering: ${stateCounts[AntState.WANDERING]}`,
      `Foraging: ${stateCounts[AntState.FORAGING]}`,
      `Returning: ${stateCounts[AntState.RETURNING]}`,
    ].join(' | ');

    this.debugText.setText(debugInfo);
  }

  shutdown(): void {
    // Clean up renderer resources
    this.antRenderer.destroy();
    this.colonyRenderer.destroy();
  }
}
