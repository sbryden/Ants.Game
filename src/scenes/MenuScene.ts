import Phaser from 'phaser';
import { World } from '../sim/World';
import { SimulationSystem } from '../systems/SimulationSystem';
import { AntRenderer } from '../render/AntRenderer';
import { ColonyRenderer } from '../render/ColonyRenderer';
import { GameConfig, ThemeId } from '../types/GameConfig';
import { MENU_CONFIG, THEME_CONFIG } from '../config';

/**
 * MenuScene - Entry point for Ants.Game
 * 
 * Features:
 * - Living background simulation (15 ants)
 * - Start button for immediate play
 * - Configuration panel for ant count and theme
 * - Calm, minimal design
 */
export class MenuScene extends Phaser.Scene {
  // Background simulation
  private world!: World;
  private simulationSystem!: SimulationSystem;
  private antRenderer!: AntRenderer;
  private colonyRenderer!: ColonyRenderer;

  // UI elements
  private titleText!: Phaser.GameObjects.Text;
  private taglineText!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Container;
  private configButton!: Phaser.GameObjects.Text;

  // Configuration panel
  private configPanel!: Phaser.GameObjects.Container;
  private configOverlay!: Phaser.GameObjects.Rectangle;
  private isConfigOpen: boolean = false;
  private themeDots: Map<string, Phaser.GameObjects.Arc> = new Map();

  // Configuration state
  private selectedAntCount: number = 40;
  private selectedTheme: ThemeId = 'default';

  // Previous configuration state (for Cancel button)
  private previousAntCount: number = 40;
  private previousTheme: ThemeId = 'default';

  // Slider state
  private sliderHandle!: Phaser.GameObjects.Arc;
  private isDraggingSlider: boolean = false;
  private sliderValueText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const theme = THEME_CONFIG[this.selectedTheme];

    // Set background color
    this.cameras.main.setBackgroundColor(theme.backgroundColor);

    // Initialize background simulation
    this.initializeBackgroundSimulation();

    // Create UI elements
    this.createUI();

    // Create configuration panel (hidden initially)
    this.createConfigPanel();

    // Set up keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  /**
   * Initialize lightweight background simulation
   */
  private initializeBackgroundSimulation(): void {
    const worldWidth = this.scale.width;
    const worldHeight = this.scale.height;

    // Create world and simulation
    this.world = new World(worldWidth, worldHeight);
    this.simulationSystem = new SimulationSystem(this.world);

    // Create colony at center
    const centerX = worldWidth / 2;
    const centerY = worldHeight / 2;
    const colony = this.world.createColony(centerX, centerY);

    // Spawn ants for background
    for (let i = 0; i < MENU_CONFIG.BACKGROUND_SIM.ANT_COUNT; i++) {
      this.world.spawnAnt(colony);
    }

    // Initialize renderers
    const theme = THEME_CONFIG[this.selectedTheme];
    this.antRenderer = new AntRenderer(this, theme);
    this.colonyRenderer = new ColonyRenderer(this, theme);

    // Set depth for background elements
    this.antRenderer.setDepth(MENU_CONFIG.DEPTHS.BACKGROUND);
    this.colonyRenderer.setDepth(MENU_CONFIG.DEPTHS.BACKGROUND);
  }

  /**
   * Create menu UI elements
   */
  private createUI(): void {
    const centerX = this.scale.width / 2;
    const theme = THEME_CONFIG[this.selectedTheme];

    // Title
    this.titleText = this.add
      .text(centerX, MENU_CONFIG.TITLE.Y_POSITION, MENU_CONFIG.TITLE.TEXT, {
        fontSize: MENU_CONFIG.TITLE.FONT_SIZE,
        color: theme.uiColors.title,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(MENU_CONFIG.DEPTHS.UI_BASE);

    // Tagline
    this.taglineText = this.add
      .text(centerX, MENU_CONFIG.TAGLINE.Y_POSITION, MENU_CONFIG.TAGLINE.TEXT, {
        fontSize: MENU_CONFIG.TAGLINE.FONT_SIZE,
        color: theme.uiColors.text,
        fontStyle: 'italic',
      })
      .setOrigin(0.5)
      .setDepth(MENU_CONFIG.DEPTHS.UI_BASE);

    // Start button
    this.createStartButton(centerX);

    // Configuration button
    this.configButton = this.add
      .text(centerX, MENU_CONFIG.CONFIG_BUTTON.Y_POSITION, MENU_CONFIG.CONFIG_BUTTON.TEXT, {
        fontSize: MENU_CONFIG.CONFIG_BUTTON.FONT_SIZE,
        color: theme.uiColors.text,
      })
      .setOrigin(0.5)
      .setDepth(MENU_CONFIG.DEPTHS.UI_BASE)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.configButton.setStyle({ color: theme.uiColors.title });
      })
      .on('pointerout', () => {
        this.configButton.setStyle({ color: theme.uiColors.text });
      })
      .on('pointerdown', () => {
        this.toggleConfigPanel();
      });
  }

  /**
   * Create start button with background and hover effect
   */
  private createStartButton(centerX: number): void {
    const theme = THEME_CONFIG[this.selectedTheme];
    const config = MENU_CONFIG.START_BUTTON;

    this.startButton = this.add.container(centerX, config.Y_POSITION);

    // Measure text to size background
    const tempText = this.add.text(0, 0, config.TEXT, {
      fontSize: config.FONT_SIZE,
    });
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy();

    // Button background
    const bgWidth = textWidth + config.PADDING.x * 2;
    const bgHeight = textHeight + config.PADDING.y * 2;
    
    const background = this.add.rectangle(0, 0, bgWidth, bgHeight)
      .setStrokeStyle(config.BORDER_WIDTH, Phaser.Display.Color.HexStringToColor(config.BORDER_COLOR).color)
      .setFillStyle(Phaser.Display.Color.HexStringToColor(config.BACKGROUND_COLOR).color);

    // Button text
    const buttonText = this.add.text(0, 0, config.TEXT, {
      fontSize: config.FONT_SIZE,
      color: theme.uiColors.title,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.startButton.add([background, buttonText]);
    this.startButton.setDepth(MENU_CONFIG.DEPTHS.UI_BASE);
    this.startButton.setSize(bgWidth, bgHeight);
    this.startButton.setInteractive({ useHandCursor: true });

    // Hover effects
    this.startButton.on('pointerover', () => {
      background.setFillStyle(Phaser.Display.Color.HexStringToColor(config.HOVER_COLOR).color);
      this.startButton.setScale(1.05);
    });

    this.startButton.on('pointerout', () => {
      background.setFillStyle(Phaser.Display.Color.HexStringToColor(config.BACKGROUND_COLOR).color);
      this.startButton.setScale(1);
    });

    this.startButton.on('pointerdown', () => {
      this.startSimulation();
    });
  }

  /**
   * Create configuration panel
   */
  private createConfigPanel(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const config = MENU_CONFIG.CONFIG_PANEL;
    const theme = THEME_CONFIG[this.selectedTheme];

    // Semi-transparent overlay
    this.configOverlay = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7)
      .setOrigin(0)
      .setDepth(MENU_CONFIG.DEPTHS.CONFIG_OVERLAY)
      .setVisible(false)
      .setInteractive()
      .on('pointerdown', () => {
        // Click outside panel to close
        this.toggleConfigPanel();
      });

    // Panel container
    this.configPanel = this.add.container(centerX, centerY);
    this.configPanel.setDepth(MENU_CONFIG.DEPTHS.CONFIG_PANEL);
    this.configPanel.setVisible(false);

    // Panel background
    const panelBg = this.add.rectangle(0, 0, config.WIDTH, config.HEIGHT, config.BACKGROUND_COLOR, config.BACKGROUND_ALPHA)
      .setStrokeStyle(config.BORDER_WIDTH, config.BORDER_COLOR);

    // Panel title
    const panelTitle = this.add.text(0, -config.HEIGHT / 2 + 40, 'Configuration', {
      fontSize: '32px',
      color: theme.uiColors.title,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Ant count section
    const antCountLabel = this.add.text(-config.WIDTH / 2 + config.PADDING, -120, 'Starting Ants:', {
      fontSize: '20px',
      color: theme.uiColors.text,
    }).setOrigin(0);

    // Theme selection section
    const themeLabel = this.add.text(-config.WIDTH / 2 + config.PADDING, 20, 'Theme:', {
      fontSize: '20px',
      color: theme.uiColors.text,
    }).setOrigin(0);

    // Add background and labels to panel FIRST (so they render behind interactive elements)
    this.configPanel.add([
      panelBg,
      panelTitle,
      antCountLabel,
      themeLabel,
    ]);

    // Create slider (adds itself to panel)
    this.createSlider(-config.WIDTH / 2 + config.PADDING, -80);

    // Create theme selector (adds itself to panel)
    this.createThemeSelector(-config.WIDTH / 2 + config.PADDING, 60);

    // Apply button (adds itself to panel)
    const applyBtn = this.createPanelButton('Apply', -80, 180);
    applyBtn.on('pointerdown', () => {
      this.toggleConfigPanel();
      // Config is already updated, no need to do anything else
    });

    // Cancel button (adds itself to panel)
    const cancelBtn = this.createPanelButton('Cancel', 80, 180);
    cancelBtn.on('pointerdown', () => {
      // Revert to previous values
      this.selectedAntCount = this.previousAntCount;
      this.selectedTheme = this.previousTheme;
      this.updateSliderPosition();
      this.updateThemeSelector();
      this.toggleConfigPanel();
    });
  }

  /**
   * Create slider for ant count selection
   */
  private createSlider(x: number, y: number): void {
    const config = MENU_CONFIG.SLIDER;
    const theme = THEME_CONFIG[this.selectedTheme];
    
    // Slider track
    const track = this.add.rectangle(x, y, config.WIDTH, config.HEIGHT, config.TRACK_COLOR)
      .setOrigin(0, 0.5);
    
    // Slider handle - use add.circle which returns Arc
    this.sliderHandle = this.add.circle(x, y, config.HANDLE_RADIUS, config.HANDLE_COLOR) as Phaser.GameObjects.Arc;
    this.sliderHandle.setInteractive({ useHandCursor: true, draggable: true });
    
    // Value display
    this.sliderValueText = this.add.text(x + config.WIDTH + 20, y, '40', {
      fontSize: '24px',
      color: theme.uiColors.text,
      fontStyle: 'bold',
    }).setOrigin(0, 0.5);

    // Min/Max labels
    const minLabel = this.add.text(x, y + 25, '10', {
      fontSize: '14px',
      color: theme.uiColors.textDim,
    }).setOrigin(0, 0);

    const maxLabel = this.add.text(x + config.WIDTH, y + 25, '100', {
      fontSize: '14px',
      color: theme.uiColors.textDim,
    }).setOrigin(1, 0);

    // Handle hover
    this.sliderHandle.on('pointerover', () => {
      this.sliderHandle.setFillStyle(config.HANDLE_HOVER_COLOR);
    });

    this.sliderHandle.on('pointerout', () => {
      if (!this.isDraggingSlider) {
        this.sliderHandle.setFillStyle(config.HANDLE_COLOR);
      }
    });

    // Handle dragging
    this.sliderHandle.on('dragstart', () => {
      this.isDraggingSlider = true;
      this.sliderHandle.setFillStyle(config.HANDLE_HOVER_COLOR);
    });

    this.sliderHandle.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number) => {
      const minX = x;
      const maxX = x + config.WIDTH;
      const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
      
      this.sliderHandle.x = clampedX;
      
      // Calculate ant count (10-100, step 5)
      const normalizedValue = (clampedX - minX) / config.WIDTH;
      const rawValue = 10 + normalizedValue * 90;
      this.selectedAntCount = Math.round(rawValue / 5) * 5;
      
      this.sliderValueText.setText(this.selectedAntCount.toString());
    });

    this.sliderHandle.on('dragend', () => {
      this.isDraggingSlider = false;
      this.sliderHandle.setFillStyle(config.HANDLE_COLOR);
    });

    // Add to panel
    this.configPanel.add([track, this.sliderHandle, this.sliderValueText, minLabel, maxLabel]);

    // Set initial position
    this.updateSliderPosition();
  }

  /**
   * Update slider handle position based on selected ant count
   */
  private updateSliderPosition(): void {
    const config = MENU_CONFIG.SLIDER;
    // Panel-relative X position for the start of the slider track
    const sliderX = -MENU_CONFIG.CONFIG_PANEL.WIDTH / 2 + MENU_CONFIG.CONFIG_PANEL.PADDING;
    
    const normalizedValue = (this.selectedAntCount - 10) / 90;
    const handleX = sliderX + normalizedValue * config.WIDTH;
    
    this.sliderHandle.x = handleX;
    this.sliderValueText.setText(this.selectedAntCount.toString());
  }

  /**
   * Create theme selector radio buttons
   */
  private createThemeSelector(x: number, y: number): void {
    const theme = THEME_CONFIG[this.selectedTheme];
    const themes: ThemeId[] = ['default', 'highContrast', 'blackWhite'];
    const spacing = 35;

    themes.forEach((themeId, index) => {
      const themeData = THEME_CONFIG[themeId];
      const yPos = y + index * spacing;

      // Radio button circle (outer ring only, no fill)
      const radio = this.add.circle(x, yPos, 8)
        .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(theme.uiColors.text).color)
        .setFillStyle(0x000000, 0);

      // Inner dot (if selected)
      const dot = this.add.circle(x, yPos, 5, Phaser.Display.Color.HexStringToColor(theme.uiColors.title).color)
        .setVisible(themeId === this.selectedTheme);

      // Label
      const label = this.add.text(x + 20, yPos, themeData.name, {
        fontSize: '18px',
        color: theme.uiColors.text,
      }).setOrigin(0, 0.5);

      // Make interactive
      const hitArea = this.add.rectangle(x, yPos, 200, spacing, 0x000000, 0)
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true });

      hitArea.on('pointerdown', () => {
        this.selectedTheme = themeId;
        // Update all radio buttons
        this.updateThemeSelector();
      });

      hitArea.on('pointerover', () => {
        label.setStyle({ color: theme.uiColors.title });
      });

      hitArea.on('pointerout', () => {
        label.setStyle({ color: theme.uiColors.text });
      });

      // Add in correct order: radio (back), dot (front), then non-visual elements
      this.configPanel.add([radio, dot, label, hitArea]);

      // Store references for updating
      this.themeDots.set(themeId, dot);
    });
  }

  /**
   * Update theme selector to show current selection
   */
  private updateThemeSelector(): void {
    // Update each radio button dot based on selected theme
    this.themeDots.forEach((dot, themeId) => {
      dot.setVisible(themeId === this.selectedTheme);
    });
  }

  /**
   * Create a button for the config panel
   */
  private createPanelButton(text: string, x: number, y: number): Phaser.GameObjects.Container {
    const theme = THEME_CONFIG[this.selectedTheme];
    const button = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 120, 45)
      .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(MENU_CONFIG.START_BUTTON.BORDER_COLOR).color)
      .setFillStyle(Phaser.Display.Color.HexStringToColor(MENU_CONFIG.START_BUTTON.BACKGROUND_COLOR).color);

    const btnText = this.add.text(0, 0, text, {
      fontSize: '20px',
      color: theme.uiColors.title,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    button.add([bg, btnText]);
    button.setSize(120, 45);
    button.setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(MENU_CONFIG.START_BUTTON.HOVER_COLOR).color);
      button.setScale(1.05);
    });

    button.on('pointerout', () => {
      bg.setFillStyle(Phaser.Display.Color.HexStringToColor(MENU_CONFIG.START_BUTTON.BACKGROUND_COLOR).color);
      button.setScale(1);
    });

    this.configPanel.add(button);
    return button;
  }

  /**
   * Toggle configuration panel visibility
   */
  private toggleConfigPanel(): void {
    this.isConfigOpen = !this.isConfigOpen;

    if (this.isConfigOpen) {
      // Store current values as previous values when opening
      this.previousAntCount = this.selectedAntCount;
      this.previousTheme = this.selectedTheme;

      // Show panel with fade in
      this.configOverlay.setVisible(true);
      this.configPanel.setVisible(true);
      this.configPanel.setAlpha(0);
      this.configPanel.setY(this.scale.height / 2 - 30);

      this.tweens.add({
        targets: this.configPanel,
        alpha: 1,
        y: this.scale.height / 2,
        duration: 300,
        ease: 'Power2',
      });
    } else {
      // Hide panel with fade out
      this.tweens.add({
        targets: this.configPanel,
        alpha: 0,
        y: this.scale.height / 2 + 30,
        duration: 200,
        ease: 'Power2',
        onComplete: () => {
          this.configPanel.setVisible(false);
          this.configOverlay.setVisible(false);
        },
      });
    }
  }

  /**
   * Set up keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    // ESC to close config panel and revert changes
    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.isConfigOpen) {
        // Revert to previous values like Cancel button
        this.selectedAntCount = this.previousAntCount;
        this.selectedTheme = this.previousTheme;
        this.updateSliderPosition();
        this.updateThemeSelector();
        this.toggleConfigPanel();
      }
    });

    // ENTER to start simulation
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (!this.isConfigOpen) {
        this.startSimulation();
      }
    });
  }

  /**
   * Start the simulation with current configuration
   */
  private startSimulation(): void {
    const config: GameConfig = {
      antCount: this.selectedAntCount,
      theme: this.selectedTheme,
    };

    // Transition to MainScene with config
    this.scene.start('MainScene', config);
  }

  update(_time: number, delta: number): void {
    // Update background simulation
    const deltaTime = delta / 1000;
    this.simulationSystem.update(deltaTime);

    // Render background ants and colony
    this.colonyRenderer.render(this.world.getColonies());
    this.antRenderer.render(this.world.getAllAnts());
  }

  shutdown(): void {
    // Clean up resources
    if (this.antRenderer) {
      this.antRenderer.destroy();
    }
    if (this.colonyRenderer) {
      this.colonyRenderer.destroy();
    }

    // Clean up keyboard event listeners
    if (this.input.keyboard) {
      this.input.keyboard.off('keydown-ESC');
      this.input.keyboard.off('keydown-ENTER');
    }
  }
}
