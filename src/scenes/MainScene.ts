import Phaser from 'phaser';
import { World } from '../sim/World';
import { SimulationSystem } from '../systems/SimulationSystem';
import { AntRenderer } from '../render/AntRenderer';
import { ColonyRenderer } from '../render/ColonyRenderer';
import { ObstacleRenderer } from '../render/ObstacleRenderer';
import { PheromoneRenderer } from '../render/PheromoneRenderer';
import { FoodSourceRenderer } from '../render/FoodSourceRenderer';
import { AntState } from '../sim/AntState';
import { Ant } from '../sim/Ant';
import { Obstacle } from '../sim/Obstacle';
import { PheromoneType } from '../sim/PheromoneType';
import { SCENE_CONFIG, PHASER_CONFIG } from '../config';

/**
 * Main game scene for Ants!
 * Wires up Phaser lifecycle to simulation system and rendering
 */
export class MainScene extends Phaser.Scene {
  private world!: World;
  private simulationSystem!: SimulationSystem;
  private antRenderer!: AntRenderer;
  private colonyRenderer!: ColonyRenderer;
  private obstacleRenderer!: ObstacleRenderer;
  private pheromoneRenderer!: PheromoneRenderer;
  private foodSourceRenderer!: FoodSourceRenderer;
  private debugText!: Phaser.GameObjects.Text;
  private pheromoneOverlayText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    // Set up camera and background
    this.cameras.main.setBackgroundColor(PHASER_CONFIG.BACKGROUND_COLOR);

    // Initialize simulation
    const worldWidth = this.scale.width;
    const worldHeight = this.scale.height;
    this.world = new World(worldWidth, worldHeight);
    this.simulationSystem = new SimulationSystem(this.world);
    this.simulationSystem.initializeWorld();

    // Add test obstacles (hardcoded for MVP)
    this.addTestObstacles();

    // Initialize rendering
    this.antRenderer = new AntRenderer(this);
    this.colonyRenderer = new ColonyRenderer(this);
    this.obstacleRenderer = new ObstacleRenderer(this);
    this.pheromoneRenderer = new PheromoneRenderer(this);
    this.foodSourceRenderer = new FoodSourceRenderer(this);

    // Display title
    this.add
      .text(SCENE_CONFIG.TITLE.X, SCENE_CONFIG.TITLE.Y, SCENE_CONFIG.TITLE.TEXT, {
        fontSize: SCENE_CONFIG.TITLE.FONT_SIZE,
        color: SCENE_CONFIG.TITLE.COLOR,
        fontStyle: 'bold',
      })
      .setDepth(SCENE_CONFIG.UI_DEPTH);

    // Display instructions
    this.add
      .text(SCENE_CONFIG.INSTRUCTIONS.X, SCENE_CONFIG.INSTRUCTIONS.Y, SCENE_CONFIG.INSTRUCTIONS.TEXT, {
        fontSize: SCENE_CONFIG.INSTRUCTIONS.FONT_SIZE,
        color: SCENE_CONFIG.INSTRUCTIONS.COLOR,
      })
      .setDepth(SCENE_CONFIG.UI_DEPTH);

    // State color legend
    this.add
      .text(SCENE_CONFIG.LEGEND.X, SCENE_CONFIG.LEGEND.Y, SCENE_CONFIG.LEGEND.TEXT, {
        fontSize: SCENE_CONFIG.LEGEND.FONT_SIZE,
        color: SCENE_CONFIG.LEGEND.COLOR,
      })
      .setDepth(SCENE_CONFIG.UI_DEPTH);

    // Pheromone overlay indicator
    this.pheromoneOverlayText = this.add
      .text(SCENE_CONFIG.LEGEND.X, SCENE_CONFIG.LEGEND.Y + 20, 'Press P to toggle pheromone overlay | Press T for test pattern', {
        fontSize: SCENE_CONFIG.LEGEND.FONT_SIZE,
        color: SCENE_CONFIG.LEGEND.COLOR,
      })
      .setDepth(SCENE_CONFIG.UI_DEPTH);

    // Debug: State distribution counter
    this.debugText = this.add
      .text(SCENE_CONFIG.DEBUG.X, this.scale.height - SCENE_CONFIG.DEBUG.Y_OFFSET_FROM_BOTTOM, '', {
        fontSize: SCENE_CONFIG.DEBUG.FONT_SIZE,
        color: SCENE_CONFIG.DEBUG.COLOR,
        backgroundColor: SCENE_CONFIG.DEBUG.BACKGROUND_COLOR,
        padding: SCENE_CONFIG.DEBUG.PADDING,
      })
      .setDepth(SCENE_CONFIG.UI_DEPTH);

    // Set up keyboard input for pheromone overlay toggle
    this.input.keyboard?.on('keydown-P', () => {
      this.pheromoneRenderer.toggle();
      this.updatePheromoneOverlayText();
    });

    // Test key: Press 'T' to deposit test pheromones
    this.input.keyboard?.on('keydown-T', () => {
      this.depositTestPheromones();
    });

    // Prevent default context menu for right-click test functionality
    this.input.mouse?.disableContextMenu();
  }

  update(_time: number, delta: number): void {
    // Convert delta from milliseconds to seconds
    const deltaTime = delta / 1000;

    // Update simulation (includes pheromone decay)
    this.simulationSystem.update(deltaTime);

    // Render pheromone overlay if visible (performance optimization)
    if (this.pheromoneRenderer.isVisible()) {
      this.pheromoneRenderer.render(this.world.pheromoneGrid);
    }

    // Render obstacles (background layer)
    this.obstacleRenderer.render(this.world.getObstacles());

    // Render colonies (nests)
    this.colonyRenderer.render(this.world.getColonies());

    // Render food sources
    this.foodSourceRenderer.render(this.world.foodSource);

    // Render ants on top
    const ants = this.world.getAllAnts();
    this.antRenderer.render(ants);

    // Update debug UI with state distribution
    this.updateDebugUI(ants);

    // Test: Deposit pheromones where mouse is held (temporary test code)
    this.handleTestPheromoneDeposition();
  }

  /**
   * Update pheromone overlay text
   */
  private updatePheromoneOverlayText(): void {
    const status = this.pheromoneRenderer.isVisible() ? 'ON' : 'OFF';
    this.pheromoneOverlayText.setText(`Press P to toggle pheromone overlay (${status}) | Press T for test pattern`);
  }

  /**
   * Temporary test code for manual pheromone deposition
   * Left click: deposit FOOD pheromone
   * Right click: deposit NEST pheromone
   * Middle click: deposit DANGER pheromone
   */
  private handleTestPheromoneDeposition(): void {
    const pointer = this.input.activePointer;
    
    if (pointer.leftButtonDown()) {
      this.world.pheromoneGrid.deposit(pointer.x, pointer.y, PheromoneType.FOOD, 0.5);
    }
    
    if (pointer.rightButtonDown()) {
      this.world.pheromoneGrid.deposit(pointer.x, pointer.y, PheromoneType.NEST, 0.5);
    }
    
    if (pointer.middleButtonDown()) {
      this.world.pheromoneGrid.deposit(pointer.x, pointer.y, PheromoneType.DANGER, 0.5);
    }
  }

  /**
   * Deposit test pheromones in patterns (triggered by 'T' key)
   * Creates visible patterns to test the pheromone system
   */
  private depositTestPheromones(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Deposit a horizontal line of FOOD pheromones (red)
    for (let i = 0; i < 150; i++) {
      this.world.pheromoneGrid.deposit(centerX - 75 + i, centerY - 100, PheromoneType.FOOD, 3.0);
    }

    // Deposit a horizontal line of NEST pheromones (blue)
    for (let i = 0; i < 150; i++) {
      this.world.pheromoneGrid.deposit(centerX - 75 + i, centerY, PheromoneType.NEST, 3.0);
    }

    // Deposit a square of DANGER pheromones (yellow)
    for (let x = 0; x < 60; x++) {
      for (let y = 0; y < 60; y++) {
        this.world.pheromoneGrid.deposit(centerX - 30 + x, centerY + 50 + y, PheromoneType.DANGER, 2.0);
      }
    }

    console.log('Test pheromones deposited! You should see red, blue, and yellow patterns.');
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

  /**
   * Add test obstacles to the world for MVP testing.
   * Hardcoded positions for now - can be made configurable later.
   */
  private addTestObstacles(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Top-left obstacle
    this.world.addObstacle(new Obstacle(centerX / 2, centerY / 2, 35));

    // Top-right obstacle
    this.world.addObstacle(new Obstacle(centerX * 1.5, centerY / 2, 30));

    // Bottom-left obstacle
    this.world.addObstacle(new Obstacle(centerX / 2, centerY * 1.5, 40));

    // Bottom-right obstacle
    this.world.addObstacle(new Obstacle(centerX * 1.5, centerY * 1.5, 45));

    // Left-side obstacle
    this.world.addObstacle(new Obstacle(150, centerY, 25));
  }

  shutdown(): void {
    // Clean up renderer resources
    this.antRenderer.destroy();
    this.colonyRenderer.destroy();
    this.obstacleRenderer.destroy();
    this.pheromoneRenderer.destroy();
  }
}
