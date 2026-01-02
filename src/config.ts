/**
 * Global configuration constants
 * Centralized location for tunable values and magic numbers
 * 
 * Pattern: Export const objects grouped by concern
 * Benefits: Easy to find, modify, and understand configurable values
 */

/**
 * World and simulation setup configuration
 */
export const WORLD_CONFIG = {
  /**
   * Number of ants spawned at world initialization
   * Affects initial colony population
   */
  INITIAL_ANT_COUNT: 20,
} as const;

/**
 * Movement and physics configuration
 * Used by SimulationSystem and behavior functions
 */
export const MOVEMENT_CONFIG = {
  // Add movement constants here as needed
  // Example: DEFAULT_SPEED: 50,
} as const;

/**
 * Rendering configuration
 * Visual properties that might be tweaked
 */
export const RENDER_CONFIG = {
  // Add rendering constants here as needed
  // Example: ANT_BODY_RADIUS: 3,
} as const;
