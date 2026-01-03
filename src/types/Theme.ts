/**
 * Theme system for visual customization
 * Themes affect colors but not gameplay mechanics
 */

import { ThemeId } from './GameConfig';

/**
 * Complete theme definition
 * Controls all visual colors in the game
 */
export interface Theme {
  /**
   * Unique identifier for this theme
   */
  id: ThemeId;

  /**
   * Display name for menu
   */
  name: string;

  /**
   * Background color for the scene (hex number)
   */
  backgroundColor: number;

  /**
   * Ant body colors by state (hex numbers)
   */
  antColors: {
    idle: number;
    wandering: number;
    foraging: number;
    returning: number;
  };

  /**
   * Pheromone visualization colors (hex numbers)
   */
  pheromoneColors: {
    food: number;
    nest: number;
    danger: number;
  };

  /**
   * Colony nest colors (hex numbers)
   */
  colonyColors: {
    nest: number;
    border: number;
    entrance: number;
  };

  /**
   * Food source colors (hex numbers)
   */
  foodColors: {
    food: number;
    border: number;
  };

  /**
   * Obstacle color (hex number)
   */
  obstacleColor: number;

  /**
   * UI text colors (hex strings for Phaser text)
   */
  uiColors: {
    title: string;
    text: string;
    textDim: string;
  };
}
