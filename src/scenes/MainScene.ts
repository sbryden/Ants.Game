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
import { SCENE_CONFIG, WORLD_CONFIG, THEME_CONFIG, CAMERA_CONFIG } from '../config';
import { GameConfig } from '../types/GameConfig';
import { Theme } from '../types/Theme';

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
  private metricsText!: Phaser.GameObjects.Text;
  private pheromoneOverlayText!: Phaser.GameObjects.Text;
  private legendText!: Phaser.GameObjects.Text;
  private currentTheme!: Theme;
  private traitOverlayEnabled: boolean = false;
  private panKeys?: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private wheelHandler?: (pointer: Phaser.Input.Pointer, _objs: unknown, _dx: number, deltaY: number) => void;

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    // Get configuration from scene data (passed from MenuScene)
    const config = this.scene.settings.data as GameConfig;
    const antCount = config?.antCount ?? WORLD_CONFIG.INITIAL_ANT_COUNT;
    const themeId = config?.theme ?? 'default';
    this.currentTheme = THEME_CONFIG[themeId];

    // Set up camera and background with theme color
    this.cameras.main.setBackgroundColor(this.currentTheme.backgroundColor);

    // Initialize simulation with configured ant count using the expanded world dimensions
    const worldWidth = WORLD_CONFIG.WORLD_WIDTH;
    const worldHeight = WORLD_CONFIG.WORLD_HEIGHT;
    this.world = new World(worldWidth, worldHeight);
    this.simulationSystem = new SimulationSystem(this.world);
    this.simulationSystem.initializeWorld(antCount);

    // Add test obstacles (hardcoded for MVP)
    this.addTestObstacles();

    // Initialize rendering with theme
    this.antRenderer = new AntRenderer(this, this.currentTheme);
    this.colonyRenderer = new ColonyRenderer(this, this.currentTheme);
    this.obstacleRenderer = new ObstacleRenderer(this, this.currentTheme);
    this.pheromoneRenderer = new PheromoneRenderer(this, this.currentTheme);
    this.foodSourceRenderer = new FoodSourceRenderer(this, this.currentTheme);

    // Configure camera: bounds cover full world, start centered on colony (world center)
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.centerOn(worldWidth / 2, worldHeight / 2);

    // Set up WASD pan keys (only when keyboard plugin is available)
    if (this.input.keyboard) {
      const keyboard = this.input.keyboard;
      this.panKeys = {
        up: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // Mouse wheel zoom: adjust zoom and keep the world point under the pointer fixed
    this.wheelHandler = (pointer: Phaser.Input.Pointer, _objs: unknown, _dx: number, deltaY: number): void => {
      const cam = this.cameras.main;
      // World position under the pointer before zoom
      const worldPointBefore = cam.getWorldPoint(pointer.x, pointer.y);
      const factor = deltaY > 0 ? (1 - CAMERA_CONFIG.ZOOM_STEP) : (1 + CAMERA_CONFIG.ZOOM_STEP);
      const newZoom = Phaser.Math.Clamp(cam.zoom * factor, CAMERA_CONFIG.MIN_ZOOM, CAMERA_CONFIG.MAX_ZOOM);
      cam.setZoom(newZoom);
      // Adjust scroll so the same world point remains under the pointer
      const worldPointAfter = cam.getWorldPoint(pointer.x, pointer.y);
      cam.scrollX += worldPointBefore.x - worldPointAfter.x;
      cam.scrollY += worldPointBefore.y - worldPointAfter.y;
    };
    this.input.on('wheel', this.wheelHandler);

    // Display title with theme colors (fixed to screen)
    this.add
      .text(SCENE_CONFIG.TITLE.X, SCENE_CONFIG.TITLE.Y, SCENE_CONFIG.TITLE.TEXT, {
        fontSize: SCENE_CONFIG.TITLE.FONT_SIZE,
        color: this.currentTheme.uiColors.title,
        fontStyle: 'bold',
      })
      .setDepth(SCENE_CONFIG.UI_DEPTH)
      .setScrollFactor(0);

    // Display instructions (fixed to screen)
    this.add
      .text(SCENE_CONFIG.INSTRUCTIONS.X, SCENE_CONFIG.INSTRUCTIONS.Y, SCENE_CONFIG.INSTRUCTIONS.TEXT, {
        fontSize: SCENE_CONFIG.INSTRUCTIONS.FONT_SIZE,
        color: this.currentTheme.uiColors.text,
      })
      .setDepth(SCENE_CONFIG.UI_DEPTH)
      .setScrollFactor(0);

    // State color legend (dynamic based on theme, fixed to screen)
    const legendText = this.generateLegendText();
    this.legendText = this.add
      .text(SCENE_CONFIG.LEGEND.X, SCENE_CONFIG.LEGEND.Y, legendText, {
        fontSize: SCENE_CONFIG.LEGEND.FONT_SIZE,
        color: this.currentTheme.uiColors.textDim,
      })
      .setDepth(SCENE_CONFIG.UI_DEPTH)
      .setScrollFactor(0);

    // Pheromone overlay indicator (fixed to screen)
    this.pheromoneOverlayText = this.add
      .text(SCENE_CONFIG.LEGEND.X, SCENE_CONFIG.LEGEND.Y + 20, 'Press P to toggle pheromone overlay (OFF) | Press Y to toggle trait visualization (OFF)', {
        fontSize: SCENE_CONFIG.LEGEND.FONT_SIZE,
        color: this.currentTheme.uiColors.textDim,
      })
      .setDepth(SCENE_CONFIG.UI_DEPTH)
      .setScrollFactor(0);

    // Debug: State distribution counter (fixed to screen)
    this.debugText = this.add
      .text(SCENE_CONFIG.DEBUG.X, this.scale.height - SCENE_CONFIG.DEBUG.Y_OFFSET_FROM_BOTTOM, '', {
        fontSize: SCENE_CONFIG.DEBUG.FONT_SIZE,
        color: this.currentTheme.uiColors.text,
        backgroundColor: SCENE_CONFIG.DEBUG.BACKGROUND_COLOR,
        padding: SCENE_CONFIG.DEBUG.PADDING,
      })
      .setDepth(SCENE_CONFIG.UI_DEPTH)
      .setScrollFactor(0);

    // Colony metrics display (fixed to screen)
    this.metricsText = this.add
      .text(SCENE_CONFIG.DEBUG.X, this.scale.height - SCENE_CONFIG.DEBUG.Y_OFFSET_FROM_BOTTOM - 30, '', {
        fontSize: SCENE_CONFIG.DEBUG.FONT_SIZE,
        color: this.currentTheme.uiColors.text,
        backgroundColor: SCENE_CONFIG.DEBUG.BACKGROUND_COLOR,
        padding: SCENE_CONFIG.DEBUG.PADDING,
      })
      .setDepth(SCENE_CONFIG.UI_DEPTH)
      .setScrollFactor(0);

    // Set up keyboard input for pheromone overlay toggle
    this.input.keyboard?.on('keydown-P', () => {
      this.pheromoneRenderer.toggle();
      this.updatePheromoneOverlayText();
    });

    // Trait visualization toggle: Press 'Y' to toggle trait overlay
    this.input.keyboard?.on('keydown-Y', () => {
      this.traitOverlayEnabled = !this.traitOverlayEnabled;
      this.updatePheromoneOverlayText();
    });

    // Test key: Press 'T' to deposit test pheromones
    this.input.keyboard?.on('keydown-T', () => {
      this.depositTestPheromones();
    });

    // Zoom keys: '-' zooms out, '=' (keyCode 187, named PLUS in Phaser) zooms in
    this.input.keyboard?.on('keydown-MINUS', () => {
      const cam = this.cameras.main;
      const newZoom = Phaser.Math.Clamp(cam.zoom * (1 - CAMERA_CONFIG.ZOOM_STEP), CAMERA_CONFIG.MIN_ZOOM, CAMERA_CONFIG.MAX_ZOOM);
      cam.setZoom(newZoom);
    });
    this.input.keyboard?.on('keydown-PLUS', () => {
      const cam = this.cameras.main;
      const newZoom = Phaser.Math.Clamp(cam.zoom * (1 + CAMERA_CONFIG.ZOOM_STEP), CAMERA_CONFIG.MIN_ZOOM, CAMERA_CONFIG.MAX_ZOOM);
      cam.setZoom(newZoom);
    });

    // Restart key: Press 'R' to return to menu
    this.input.keyboard?.on('keydown-R', () => {
      this.returnToMenu();
    });

    // Prevent default context menu for right-click test functionality
    this.input.mouse?.disableContextMenu();
  }

  update(_time: number, delta: number): void {
    // Convert delta from milliseconds to seconds
    const deltaTime = delta / 1000;

    // Camera panning with WASD
    // Dividing by cam.zoom keeps perceived movement speed consistent:
    // zoomed out (small zoom) → more world pixels per frame to feel the same speed.
    const cam = this.cameras.main;
    if (this.panKeys) {
      const panSpeed = (CAMERA_CONFIG.PAN_SPEED / cam.zoom) * deltaTime;
      if (this.panKeys.up.isDown)    cam.scrollY -= panSpeed;
      if (this.panKeys.down.isDown)  cam.scrollY += panSpeed;
      if (this.panKeys.left.isDown)  cam.scrollX -= panSpeed;
      if (this.panKeys.right.isDown) cam.scrollX += panSpeed;
    }

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
    this.foodSourceRenderer.render(this.world.foodSources);

    // Render ants on top
    const ants = this.world.getAllAnts();
    this.antRenderer.render(ants, this.traitOverlayEnabled);

    // Update debug UI with state distribution
    this.updateDebugUI(ants);

    // Update colony metrics UI
    this.updateMetricsUI();

    // Test: Deposit pheromones where mouse is held (temporary test code)
    this.handleTestPheromoneDeposition();
  }

  /**
   * Update overlay status text
   * Shows both pheromone and trait visualization status
   */
  private updatePheromoneOverlayText(): void {
    const pheromoneStatus = this.pheromoneRenderer.isVisible() ? 'ON' : 'OFF';
    const traitStatus = this.traitOverlayEnabled ? 'ON' : 'OFF';
    this.pheromoneOverlayText.setText(
      `Press P to toggle pheromone overlay (${pheromoneStatus}) | Press Y to toggle trait visualization (${traitStatus})`
    );
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
      this.world.pheromoneGrid.deposit(pointer.worldX, pointer.worldY, PheromoneType.FOOD, 0.5);
    }
    
    if (pointer.rightButtonDown()) {
      this.world.pheromoneGrid.deposit(pointer.worldX, pointer.worldY, PheromoneType.NEST, 0.5);
    }
    
    if (pointer.middleButtonDown()) {
      this.world.pheromoneGrid.deposit(pointer.worldX, pointer.worldY, PheromoneType.DANGER, 0.5);
    }
  }

  /**
   * Generate color legend text based on current theme
   */
  private generateLegendText(): string {
    const colors = this.currentTheme.antColors;
    
    // Helper to get color name from hex value
    const getColorName = (hex: number): string => {
      // Convert to RGB for color identification
      const r = (hex >> 16) & 0xff;
      const g = (hex >> 8) & 0xff;
      const b = hex & 0xff;
      
      // Simple color naming based on dominant channel
      if (r < 80 && g < 80 && b < 80) return 'Dark Gray';
      if (r > 200 && g > 200 && b > 200) return 'White';
      if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
        if (r < 100) return 'Dark Gray';
        if (r < 150) return 'Gray';
        return 'Light Gray';
      }
      if (r > g && r > b) {
        if (g > 100 && b < 100) return 'Orange';
        if (b > 100) return 'Pink';
        return 'Red';
      }
      if (g > r && g > b) return 'Green';
      if (b > r && b > g) return 'Blue';
      if (r > 150 && g > 100 && b < 100) return 'Brown';
      if (g > 150 && b > 150) return 'Cyan';
      return 'Gray';
    };
    
    const idleColor = getColorName(colors.idle);
    const wanderingColor = getColorName(colors.wandering);
    const foragingColor = getColorName(colors.foraging);
    const returningColor = getColorName(colors.returning);
    
    return `Colors: ${idleColor}=Idle, ${wanderingColor}=Wandering, ${foragingColor}=Foraging, ${returningColor}=Returning`;
  }

  /**
   * Deposit test pheromones in patterns (triggered by 'T' key)
   * Creates visible patterns to test the pheromone system
   */
  private depositTestPheromones(): void {
    const centerX = this.world.width / 2;
    const centerY = this.world.height / 2;

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
   * Update colony metrics display
   */
  private updateMetricsUI(): void {
    const colony = this.world.getColonies()[0];
    if (!colony) return;

    const healthStatus = colony.getHealthStatus();
    const surplus = colony.surplusRate;
    const surplusStr = surplus >= 0 ? `+${surplus.toFixed(2)}` : `${surplus.toFixed(2)}`;

    const metricsInfo = [
      `Food: ${colony.foodStored.toFixed(1)}`,
      `Eaten: ${colony.foodConsumedRate.toFixed(2)}/s`,
      `Gathered: ${colony.foodGatheredRate.toFixed(2)}/s`,
      `Surplus: ${surplusStr}/s`,
      `Status: ${healthStatus}`,
    ].join(' | ');

    this.metricsText.setText(metricsInfo);
  }

  /**
   * Add test obstacles to the world for MVP testing.
   * Positions are relative to the colony (world center) so they remain
   * nearby regardless of world size.
   */
  private addTestObstacles(): void {
    const cx = this.world.width / 2;
    const cy = this.world.height / 2;

    // Top-left obstacle
    this.world.addObstacle(new Obstacle(cx - 256, cy - 192, 35));

    // Top-right obstacle
    this.world.addObstacle(new Obstacle(cx + 256, cy - 192, 30));

    // Bottom-left obstacle
    this.world.addObstacle(new Obstacle(cx - 256, cy + 192, 40));

    // Bottom-right obstacle
    this.world.addObstacle(new Obstacle(cx + 256, cy + 192, 45));

    // Left-side obstacle
    this.world.addObstacle(new Obstacle(cx - 362, cy, 25));
  }

  /**
   * Return to menu scene
   */
  private returnToMenu(): void {
    this.shutdown();
    this.scene.start('MenuScene');
  }

  shutdown(): void {
    // Remove wheel listener to prevent accumulation if scene restarts
    if (this.wheelHandler) {
      this.input.off('wheel', this.wheelHandler);
    }
    // Clean up renderer resources
    this.antRenderer.destroy();
    this.colonyRenderer.destroy();
    this.obstacleRenderer.destroy();
    this.pheromoneRenderer.destroy();
  }
}
