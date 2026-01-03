/**
 * Global configuration constants
 * Centralized location for tunable values and magic numbers
 * 
 * Pattern: Export const objects grouped by concern
 * Benefits: Easy to find, modify, and understand configurable values
 */

/**
 * Phaser game engine configuration
 * Canvas dimensions and display settings
 */
export const PHASER_CONFIG = {
  /**
   * Game canvas width in pixels
   */
  CANVAS_WIDTH: 1024,

  /**
   * Game canvas height in pixels
   */
  CANVAS_HEIGHT: 768,

  /**
   * Background color for the game canvas
   */
  BACKGROUND_COLOR: '#2d4a2e',
} as const;

/**
 * World and simulation setup configuration
 */
export const WORLD_CONFIG = {
  /**
   * Number of ants spawned at world initialization
   * Affects initial colony population
   */
  INITIAL_ANT_COUNT: 40,
} as const;

/**
 * Movement and physics configuration
 * Used by SimulationSystem and behavior functions
 */
export const MOVEMENT_CONFIG = {
  /**
   * Ant movement speed in pixels per second
   * Controls how fast ants move across the world
   */
  SPEED: 50,

  /**
   * Time interval (in seconds) between random direction changes
   * Lower values = more erratic movement, higher = smoother paths
   */
  CHANGE_DIRECTION_INTERVAL: 2,

  /**
   * Turn speed coefficient (0-1)
   * Controls how quickly ants can change direction
   * Lower values = more realistic, gradual turns
   */
  TURN_SPEED: 0.3,
} as const;

/**
 * Energy and hunger configuration
 * Drives metabolic decay, eating, and starvation effects
 */
export const ENERGY_CONFIG = {
  /**
   * Maximum energy an ant can have (percent-style scale)
   */
  MAX_ENERGY: 100,

  /**
   * Energy consumption rates (energy per second) by activity state
   */
  CONSUMPTION_RATES: {
    IDLE: 0.5,
    WANDERING: 1.0,
    FORAGING: 1.5,
    RETURNING: 1.0,
  },

  /**
   * Thresholds that affect behavior and movement speed
   */
  THRESHOLDS: {
    HUNGER: 50,
    STARVATION: 25,
    WELL_FED: 80,
  },

  /**
   * Speed multipliers by energy band
   */
  SPEED_MULTIPLIERS: {
    WELL_FED: 1.0,      // 80-100
    NORMAL: 0.95,       // 50-80
    HUNGRY: 0.7,        // 25-50
    STARVING: 0.3,      // 0-25
  },

  /**
   * Chance per second for hungry ants to bail out and return home
   * Applied when energy is below the hunger threshold
   */
  HUNGER_RETURN_CHANCE: 0.5,

  /**
   * Energy recovered per second while eating at the colony
   */
  EATING_RECOVERY_RATE: 20,

  /**
   * Food units consumed per second while eating
   */
  FOOD_CONSUMPTION_RATE: 0.2,

  /**
   * Energy gained per unit of food (derived from recovery/consumption rates)
   */
  ENERGY_PER_FOOD_UNIT: 100,
} as const;

/**
 * Behavior state machine configuration
 * Probabilities and durations for ant state transitions
 */
export const BEHAVIOR_CONFIG = {
  /**
   * Chance per second for idle ant to start wandering
   * Higher = ants leave home more frequently
   */
  IDLE_TO_WANDERING_CHANCE: 0.5,

  /**
   * Minimum time (seconds) ant must wander before considering other states
   * Prevents rapid state flickering
   * Increased to 5 (from 3) to allow longer exploration periods
   */
  WANDERING_MIN_DURATION: 5,

  /**
   * Chance per second for wandering ant to transition to foraging
   * Evaluated after minimum wandering duration
   */
  WANDERING_TO_FORAGING_CHANCE: 0.1,

  /**
   * Chance per second for wandering ant to return home
   * Evaluated after minimum wandering duration
   * Lowered to 0.02 (from 0.05) to encourage more exploration
   */
  WANDERING_TO_RETURNING_CHANCE: 0.02,

  /**
   * Minimum time (seconds) ant must forage before considering return
   * Prevents giving up too quickly
   */
  FORAGING_MIN_DURATION: 5,

  /**
   * Chance per second for foraging ant to give up and return home
   * Evaluated after minimum foraging duration
   */
  FORAGING_TO_RETURNING_CHANCE: 0.1,
} as const;

/**
 * Colony configuration
 * Colony behavior and interaction distances
 */
export const COLONY_CONFIG = {
  /**
   * Distance threshold (pixels) for ant to be considered "at home"
   * Used to trigger state transitions when returning to nest
   */
  HOME_ARRIVAL_DISTANCE: 15,

  /**
   * Approximate entrance radius for colony validation (pixels)
   * Used for spawning validation to keep food sources away from colony entrances
   */
  ENTRANCE_RADIUS: 30,

  /**
   * Smoothing factor for rolling-average colony metrics (0-1)
   * Higher values react faster but are noisier
   */
  METRICS_SMOOTHING_FACTOR: 0.2,

  /**
   * Safety buffer of food (per ant) before considering colony struggling
   */
  SAFETY_FOOD_PER_ANT: 0.2,
} as const;

/**
 * Perception and sensing configuration
 * How ants perceive their environment
 */
export const PERCEPTION_CONFIG = {
  /**
   * Range (in pixels) at which ants can detect obstacles
   * Used for collision avoidance behavior
   */
  OBSTACLE_DETECTION_RANGE: 80,

  /**
   * General perception range for future features
   * Useful for pheromone detection, ant-to-ant awareness, etc.
   */
  PERCEPTION_RANGE: 100,
} as const;

/**
 * Ant rendering configuration
 * Visual properties for ant appearance
 */
export const ANT_RENDER_CONFIG = {
  /**
   * Radius of ant body circle in pixels
   */
  BODY_RADIUS: 3,

  /**
   * Radius of ant head circle in pixels
   */
  HEAD_RADIUS: 2,

  /**
   * Color of ant head (hex)
   */
  HEAD_COLOR: 0x654321,

  /**
   * Body colors by state (for debug visualization)
   * Each state gets a distinct color to make behavior visible
   */
  STATE_COLORS: {
    IDLE: 0x808080,      // Gray - resting
    WANDERING: 0x8b4513, // Brown - exploring
    FORAGING: 0x4a7c4e,  // Green - searching for food
    RETURNING: 0x4169a1, // Blue - heading home
  },

  /**
   * Default body color (fallback when state color not found)
   */
  DEFAULT_BODY_COLOR: 0x8b4513,
} as const;

/**
 * Rendering layer depth configuration
 * Controls z-index ordering of visual elements
 */
export const RENDER_CONFIG = {
  /**
   * Depth for pheromone overlay
   * Rendered above obstacles but below ants
   */
  PHEROMONE_DEPTH: 5,

  /**
   * Depth for UI elements
   * Rendered on top of all game elements
   */
  UI_DEPTH: 100,
} as const;

/**
 * Colony nest rendering configuration
 * Visual properties for colony nest appearance
 */
export const COLONY_RENDER_CONFIG = {
  /**
   * Radius of colony nest circle in pixels
   */
  NEST_RADIUS: 20,

  /**
   * Base fill color of nest (hex)
   */
  NEST_COLOR: 0x704214,

  /**
   * Border color of nest (hex)
   */
  NEST_BORDER_COLOR: 0x8b4513,

  /**
   * Border thickness in pixels
   */
  NEST_BORDER_WIDTH: 2,

  /**
   * Opacity of nest fill (0-1)
   */
  NEST_OPACITY: 0.6,

  /**
   * Multiplier for inner entrance radius (relative to nest radius)
   * 0.4 = entrance is 40% of nest size
   */
  ENTRANCE_RADIUS_MULTIPLIER: 0.4,

  /**
   * Color of nest entrance (hex)
   */
  ENTRANCE_COLOR: 0x000000,

  /**
   * Opacity of nest entrance (0-1)
   */
  ENTRANCE_OPACITY: 0.3,
} as const;

/**
 * Scene UI configuration
 * Text positions, sizes, and styling for main scene UI
 */
export const SCENE_CONFIG = {
  /**
   * Title text configuration
   */
  TITLE: {
    X: 16,
    Y: 16,
    FONT_SIZE: '32px',
    COLOR: '#ffffff',
    TEXT: 'Ants!',
  },

  /**
   * Instructions text configuration
   */
  INSTRUCTIONS: {
    X: 16,
    Y: 56,
    FONT_SIZE: '16px',
    COLOR: '#cccccc',
    TEXT: 'Watch the ants wander and return home...',
  },

  /**
   * State legend text configuration
   */
  LEGEND: {
    X: 16,
    Y: 84,
    FONT_SIZE: '12px',
    COLOR: '#aaaaaa',
    TEXT: 'Colors: Gray=Idle, Brown=Wandering, Green=Foraging, Blue=Returning',
  },

  /**
   * Debug info text configuration
   */
  DEBUG: {
    X: 16,
    Y_OFFSET_FROM_BOTTOM: 40,
    FONT_SIZE: '14px',
    COLOR: '#ffffff',
    BACKGROUND_COLOR: '#00000088',
    PADDING: { x: 8, y: 4 },
  },

  /**
   * UI text depth to appear above game elements
   */
  UI_DEPTH: 100,
} as const;

/**
 * Pheromone system configuration
 * Controls pheromone behavior, decay, and grid properties
 */
export const PHEROMONE_CONFIG = {
  /**
   * Grid cell size in pixels
   * 1 = one pheromone unit per pixel (highest resolution)
   */
  GRID_CELL_SIZE: 1,

  /**
   * Decay rate per second for Food pheromone (0-1)
   * Higher = faster decay. 0.05 = loses 5% strength per second
   * Lowered to allow trails to persist longer and accumulate
   */
  FOOD_DECAY_RATE: 0.05,

  /**
   * Decay rate per second for Nest pheromone (0-1)
   * Nest trails should last longer than food trails
   */
  NEST_DECAY_RATE: 0.03,

  /**
   * Decay rate per second for Danger pheromone (0-1)
   * Danger signals should fade relatively quickly
   */
  DANGER_DECAY_RATE: 0.10,

  /**
   * Deposition strength for idle ants
   * Idle ants deposit minimal pheromone
   */
  DEPOSITION_IDLE: 0.0,

  /**
   * Deposition strength for wandering ants
   * Wandering ants leave faint nest trails
   */
  DEPOSITION_WANDERING: 0.5,

  /**
   * Deposition strength for foraging ants
   * Foraging ants leave weak food trails (searching, not returning)
   * Increased to 0.5 for better visibility while still weaker than returning
   */
  DEPOSITION_FORAGING: 0.5,

  /**
   * Deposition strength for returning ants
   * Returning ants leave strong trails (found something!)
   * Increased to 2.0 so multiple ants create visibly saturated trails
   */
  DEPOSITION_RETURNING: 2.0,

  /**
   * Update interval for diffusion (in frames)
   * Diffusion is expensive, run every N frames
   * 3 = diffuse every 3 frames (~20 times per second at 60 FPS)
   */
  DIFFUSION_UPDATE_INTERVAL: 3,

  /**
   * Diffusion rate (0-1)
   * Controls how quickly pheromones spread to adjacent cells
   * Lower = more localized trails, higher = broader spread
   * Lowered to 0.05 to concentrate pheromones instead of spreading too thin
   */
  DIFFUSION_RATE: 0.05,

  /**
   * Maximum pheromone strength cap
   * Prevents overflow from repeated depositions
   * Increased to 20.0 to allow visible saturation when multiple ants traverse same path
   */
  MAX_STRENGTH: 20.0,

  /**
   * Minimum pheromone strength threshold for decay clamping
   * Values below this are set to zero to avoid floating point precision issues
   */
  MIN_STRENGTH: 0.001,

  /**
   * Minimum visible strength threshold for rendering
   * Cells below this strength are not rendered (performance optimization)
   */
  RENDER_THRESHOLD: 0.01,

  /**
   * Visualization power curve exponent
   * Controls how pheromone strength maps to visual opacity
   * 0.5 = square root (emphasizes weaker pheromones for better visibility)
   */
  VISUALIZATION_POWER: 0.5,

  /**
   * Maximum opacity for pheromone visualization (0-1)
   * Prevents pheromones from completely obscuring the game view
   */
  MAX_OPACITY: 0.6,

  /**
   * Visualization colors for pheromone types (hex)
   */
  COLORS: {
    FOOD: 0xff0000,    // Red
    NEST: 0x0000ff,    // Blue
    DANGER: 0xffff00,  // Yellow
  },
} as const;

/**
 * Pheromone following behavior configuration
 * Controls how foraging ants sense and follow pheromone trails
 */
export const PHEROMONE_BEHAVIOR_CONFIG = {
  /**
   * Distance in pixels to sample pheromones in each of 8 directions
   * Larger = ants sense further but less precisely (requires more computation)
   * Smaller = ants only sense nearby pheromones (more localized)
   * Increased to 80 to help wandering ants detect trails from further away
   */
  SAMPLE_DISTANCE: 80,

  /**
   * Strength of pheromone influence on foraging ant movement (0-1)
   * 0 = ignore pheromones, move randomly
   * 1 = follow pheromone gradient perfectly (greedy)
   * 0.6 = moderately follow trails while maintaining exploration
   */
  FOLLOW_STRENGTH: 0.6,

  /**
   * Randomness factor for pheromone following (0-1)
   * 0 = purely greedy (always choose best direction)
   * 1 = random (never follow pheromones)
   * 0.08 = 8% chance to explore randomly despite pheromone signal
   * 
   * This adds natural variation: ants sometimes ignore trails to explore new areas
   * Reduced from 0.15 to make ants more responsive to trails
   */
  EXPLORATION_RANDOMNESS: 0.08,

  /**
   * Minimum pheromone concentration threshold for gradient detection (0-1)
   * Signal below this is considered noise and ignored
   * Prevents ants from getting stuck on stale/weak pheromones
   * Lowered to 0.005 to make wandering ants more responsive to trails
   */
  GRADIENT_THRESHOLD: 0.005,
} as const;

/**
 * Food source configuration
 * Controls food spawning, harvesting, and carrying mechanics
 */
export const FOOD_CONFIG = {
  /**
   * Initial food amount spawned in each source (units)
   */
  INITIAL_FOOD_AMOUNT: 100,

  /**
   * Radius of food source circle in pixels
   */
  SOURCE_RADIUS: 15,

  /**
   * Harvest rate in food units per second
   * When ant is at food source
   */
  HARVEST_RATE: 1.0,

  /**
   * Distance threshold for ant to be "at" food source (pixels)
   * Ant position distance + ant radius must be <= source radius + this threshold
   */
  HARVEST_DISTANCE: 20,

  /**
   * Minimum distance from world edges for food source spawn (pixels)
   */
  SPAWN_EDGE_PADDING: 30,

  /**
   * Maximum attempts to find valid spawn location before fallback
   */
  SPAWN_ATTEMPTS: 10,

  /**
   * Buffer distance around food sources for spawn validation (pixels)
   * Used to ensure food sources don't spawn too close to obstacles or colonies
   */
  SPAWN_BUFFER_DISTANCE: 15,
} as const;

/**
 * Ant carrying and inventory configuration
 */
export const ANT_CARRY_CONFIG = {
  /**
   * Maximum food units an ant can carry
   */
  MAX_CAPACITY: 5,

  /**
   * Radius of carrying indicator dot (pixels)
   */
  CARRYING_INDICATOR_RADIUS: 1.5,

  /**
   * Color of carrying indicator (red tint for food)
   */
  CARRYING_INDICATOR_COLOR: 0xff4444,
} as const;

/**
 * Food source rendering configuration
 */
export const FOOD_RENDER_CONFIG = {
  /**
   * Color of food source (tan/brown)
   */
  FOOD_COLOR: 0xd4a574,

  /**
   * Border color of food source
   */
  FOOD_BORDER_COLOR: 0x8b6f47,

  /**
   * Border width in pixels
   */
  FOOD_BORDER_WIDTH: 2,
} as const;
