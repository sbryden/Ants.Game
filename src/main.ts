import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { MainScene } from './scenes/MainScene';
import { UndergroundScene } from './scenes/UndergroundScene';
import { PHASER_CONFIG } from './config';

/**
 * Main entry point for Ants! game
 * Initializes Phaser with configuration and starts the game
 */

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: PHASER_CONFIG.CANVAS_WIDTH,
  height: PHASER_CONFIG.CANVAS_HEIGHT,
  parent: 'game-container',
  backgroundColor: PHASER_CONFIG.BACKGROUND_COLOR,
  scene: [MenuScene, MainScene, UndergroundScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// Create and start the game
new Phaser.Game(config);
