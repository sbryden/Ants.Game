/**
 * Global configuration constants
 * Centralized location for tunable values and magic numbers
 * 
 * Pattern: Export const objects grouped by concern
 * Benefits: Easy to find, modify, and understand configurable values
 */

import { Theme } from './types/Theme';
import { ThemeId } from './types/GameConfig';

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

  /**
   * World width in pixels (100x canvas width for large exploration space)
   * Zoom and pan allow navigation of the full world
   */
  WORLD_WIDTH: 102400,

  /**
   * World height in pixels (100x canvas height for large exploration space)
   * Zoom and pan allow navigation of the full world
   */
  WORLD_HEIGHT: 76800,
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
    TEXT: 'Watch the ants wander and return home... | Scroll to zoom | WASD to pan',
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
 * Camera configuration
 * Controls zoom and pan behavior for navigating the large world
 */
export const CAMERA_CONFIG = {
  /**
   * Minimum zoom level (most zoomed out)
   * Derived from: canvas_width / WORLD_WIDTH = 1024 / 102400 ≈ 0.01
   * At this value the full 100x world fits within the viewport
   */
  MIN_ZOOM: 0.01,

  /**
   * Maximum zoom level (most zoomed in)
   */
  MAX_ZOOM: 5.0,

  /**
   * Zoom step multiplier applied per scroll tick
   * 0.15 = 15% zoom change per wheel notch
   */
  ZOOM_STEP: 0.15,

  /**
   * Camera pan speed in world pixels per second
   */
  PAN_SPEED: 1000,
} as const;

/**
 * Pheromone system configuration
 * Controls pheromone behavior, decay, and grid properties
 */
export const PHEROMONE_CONFIG = {
  /**
   * Grid cell size in pixels
   * Scaled to 100 to match the 100x world expansion, keeping the grid
   * resolution proportional (same number of cells as the original 1px grid).
   */
  GRID_CELL_SIZE: 100,

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
   * Scaled to 8000 (100x original) to match the 100x world expansion so
   * ants can still detect pheromone gradients across the larger cell grid.
   * Larger = ants sense further but less precisely (requires more computation)
   */
  SAMPLE_DISTANCE: 8000,

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

/**
 * Theme configuration
 * Visual themes for the game (does not affect gameplay)
 */
export const THEME_CONFIG: Record<ThemeId, Theme> = {
  default: {
    id: 'default',
    name: 'Default',
    backgroundColor: 0x2d4a2e,
    antColors: {
      idle: 0x808080,      // Gray
      wandering: 0x8b4513, // Brown
      foraging: 0x4a7c4e,  // Green
      returning: 0x4169a1, // Blue
    },
    pheromoneColors: {
      food: 0xff0000,    // Red
      nest: 0x0000ff,    // Blue
      danger: 0xffff00,  // Yellow
    },
    colonyColors: {
      nest: 0x704214,
      border: 0x8b4513,
      entrance: 0x000000,
    },
    foodColors: {
      food: 0xd4a574,
      border: 0x8b6f47,
    },
    obstacleColor: 0x4a4a4a,
    uiColors: {
      title: '#ffffff',
      text: '#cccccc',
      textDim: '#aaaaaa',
    },
  },
  highContrast: {
    id: 'highContrast',
    name: 'High Contrast',
    backgroundColor: 0x1a1a1a,
    antColors: {
      idle: 0xaaaaaa,      // Light Gray
      wandering: 0xffaa44, // Bright Orange
      foraging: 0x44ff44,  // Bright Green
      returning: 0x4488ff, // Bright Blue
    },
    pheromoneColors: {
      food: 0xff0055,    // Hot Pink
      nest: 0x00ffff,    // Cyan
      danger: 0xffff00,  // Yellow
    },
    colonyColors: {
      nest: 0xaa6633,
      border: 0xffaa66,
      entrance: 0x000000,
    },
    foodColors: {
      food: 0xffcc66,
      border: 0xff9933,
    },
    obstacleColor: 0x666666,
    uiColors: {
      title: '#ffffff',
      text: '#ffffff',
      textDim: '#cccccc',
    },
  },
  blackWhite: {
    id: 'blackWhite',
    name: 'Black & White',
    backgroundColor: 0x000000,
    antColors: {
      idle: 0x555555,      // Dark Gray
      wandering: 0x999999, // Medium Gray
      foraging: 0xcccccc,  // Light Gray
      returning: 0xffffff, // White
    },
    pheromoneColors: {
      food: 0xbbbbbb,    // Light Gray
      nest: 0x777777,    // Medium Gray
      danger: 0xffffff,  // White
    },
    colonyColors: {
      nest: 0x666666,
      border: 0xaaaaaa,
      entrance: 0x000000,
    },
    foodColors: {
      food: 0xdddddd,
      border: 0xffffff,
    },
    obstacleColor: 0x333333,
    uiColors: {
      title: '#ffffff',
      text: '#dddddd',
      textDim: '#999999',
    },
  },
} as const;

/**
 * Menu scene configuration
 * Styling and layout constants for the menu UI
 */
export const MENU_CONFIG = {
  /**
   * Title text configuration
   */
  TITLE: {
    TEXT: 'Ants.Game',
    FONT_SIZE: '56px',
    Y_POSITION: 150,
  },

  /**
   * Tagline text configuration
   */
  TAGLINE: {
    TEXT: 'Observe. Adapt. Survive.',
    FONT_SIZE: '24px',
    Y_POSITION: 220,
  },

  /**
   * Start button configuration
   */
  START_BUTTON: {
    TEXT: 'Start Simulation',
    FONT_SIZE: '28px',
    Y_POSITION: 320,
    PADDING: { x: 40, y: 18 },
    BACKGROUND_COLOR: '#4a7c4e',
    HOVER_COLOR: '#5a9c6e',
    BORDER_COLOR: '#ffffff',
    BORDER_WIDTH: 2,
  },

  /**
   * Configuration button
   */
  CONFIG_BUTTON: {
    TEXT: '⚙ Configuration',
    FONT_SIZE: '20px',
    Y_POSITION: 420,
  },

  /**
   * Configuration panel
   */
  CONFIG_PANEL: {
    WIDTH: 500,
    HEIGHT: 450,
    BACKGROUND_COLOR: 0x2a2a2a,
    BACKGROUND_ALPHA: 1.0,
    BORDER_COLOR: 0x4a7c4e,
    BORDER_WIDTH: 3,
    PADDING: 30,
  },

  /**
   * Slider configuration
   */
  SLIDER: {
    WIDTH: 400,
    HEIGHT: 8,
    HANDLE_RADIUS: 12,
    TRACK_COLOR: 0x333333,
    HANDLE_COLOR: 0x4a7c4e,
    HANDLE_HOVER_COLOR: 0x5a9c6e,
  },

  /**
   * Background simulation configuration (lightweight)
   */
  BACKGROUND_SIM: {
    ANT_COUNT: 15,
  },

  /**
   * Z-depths for layering
   */
  DEPTHS: {
    BACKGROUND: 0,
    UI_BASE: 100,
    CONFIG_OVERLAY: 200,
    CONFIG_PANEL: 201,
  },
} as const;

/**
 * Trait system configuration
 * Controls ant specialization and trait evolution
 */
export const TRAIT_CONFIG = {
  /**
   * Initial trait variance when ants spawn
   * Range around baseline 1.0 (e.g., 0.1 means 0.9-1.1)
   */
  INITIAL_VARIANCE: 0.1,

  /**
   * Trait increase rate per task completion
   * Applied when ant successfully performs a task
   */
  TRAIT_INCREASE_RATE: 0.01,

  /**
   * Trait decay rate per update when not using trait
   * Pulls traits back toward baseline 1.0
   */
  TRAIT_DECAY_RATE: 0.001,

  /**
   * Minimum allowed trait value
   * Prevents traits from becoming too weak
   */
  MIN_TRAIT_VALUE: 0.5,

  /**
   * Maximum allowed trait value
   * Prevents runaway specialization
   */
  MAX_TRAIT_VALUE: 2.0,

  /**
   * High affinity threshold for role derivation (debug only)
   * Traits above this are considered "high"
   */
  HIGH_AFFINITY_THRESHOLD: 1.3,

  /**
   * Low affinity threshold for role derivation (debug only)
   * Traits below this are considered "low"
   */
  LOW_AFFINITY_THRESHOLD: 0.7,

  /**
   * Trait evolution update interval (in frames)
   * Trait evolution is expensive, run every N frames
   * 60 = once per second at 60 FPS
   */
  EVOLUTION_UPDATE_INTERVAL: 60,
} as const;
