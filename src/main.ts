import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';

/**
 * Main entry point for Ants! game
 * Initializes Phaser with configuration and starts the game
 */

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#2d4a2e',
  scene: [MainScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

// Create and start the game
new Phaser.Game(config);
