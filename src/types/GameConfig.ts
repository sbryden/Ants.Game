/**
 * Game configuration interface
 * Passed between scenes to configure simulation parameters
 */

export type ThemeId = 'default' | 'highContrast' | 'blackWhite';

/**
 * Configuration data passed from MenuScene to MainScene
 */
export interface GameConfig {
  /**
   * Number of ants to spawn at start
   * Range: 10-100
   */
  antCount: number;

  /**
   * Visual theme to apply
   */
  theme: ThemeId;
}
