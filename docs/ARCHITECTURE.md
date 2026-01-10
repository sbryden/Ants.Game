# Architecture Guide

This document explains the architectural principles and technical decisions behind Ants.Game.

## Design Philosophy

### Simulation First

The core simulation runs independent of the rendering engine. This enables:
- Unit testing without graphics
- Performance profiling of pure logic
- Potential for headless simulation mode
- Easy iteration on behavior without rendering concerns

### Emergent Complexity

Simple individual rules create complex group behaviors:
- Ants follow pheromone gradients
- Pheromones decay over time
- Food sources create natural trails
- Multiple colonies compete for resources

### Performance Awareness

- Object pooling for entities
- Batch rendering operations
- Spatial partitioning for collision detection
- Efficient grid-based pathfinding
- No per-frame allocations in hot loops

## Project Structure

```
Ants.Game/
├── .github/
│   ├── copilot-instructions.md   # AI coding assistant guidelines
│   └── prompts/                   # Development planning documents
├── docs/
│   ├── ARCHITECTURE.md            # This file
│   └── BEHAVIOR.md                # Ant behavior and mechanics
├── src/
│   ├── sim/                       # Core simulation (engine-agnostic)
│   ├── systems/                   # Game systems and update loops
│   ├── render/                    # Phaser rendering layer
│   ├── scenes/                    # Phaser scenes
│   ├── types/                     # TypeScript type definitions
│   └── main.ts                    # Application entry point
├── index.html                     # Vite entry point
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
├── README.md                      # Project overview
└── ROADMAP.md                     # Development phases
```

## Core Architecture

This project follows a **simulation-first architecture** with strict separation of concerns:

```
/src
  /sim       - Pure simulation logic (engine-agnostic, NO Phaser imports)
  /systems   - Update loops and game systems
  /render    - Phaser rendering layer (visualization only)
  /scenes    - Phaser scene definitions
  /types     - Shared TypeScript types
```

### Key Principles

1. **Ants are data, not Phaser objects** — Entity state is separate from rendering
2. **Engine-agnostic simulation** — Core logic can run without Phaser
3. **Performance-first** — Designed to support hundreds/thousands of agents
4. **Clarity over cleverness** — Readable, maintainable code

### `/sim` — Simulation Layer

**CRITICAL:** This directory contains pure simulation logic with **NO Phaser dependencies**.

Contains:
- Entity data structures (`Ant`, `Colony`, `FoodSource`, `Obstacle`)
- Pure behavior functions (movement, perception, state transitions)
- Grid-based systems (`PheromoneGrid`, `World`)
- Enums and state definitions

Rules:
- No `import ... from 'phaser'` allowed
- All functions are pure or operate on explicit state
- No rendering logic whatsoever

### `/systems` — Game Systems

Orchestrates simulation updates and coordinates between sim and render layers.

Contains:
- `SimulationSystem` — Main update loop coordinator
- Behavior composition and system integration
- Configuration management

### `/render` — Rendering Layer

Phaser-specific visualization code that reads simulation state.

Contains:
- Renderer classes (`AntRenderer`, `ColonyRenderer`, `PheromoneRenderer`, etc.)
- Procedural graphics drawing
- Visual effects and animations
- Theme-based color management

Rules:
- Renderers **read** from simulation state, never modify it
- Each renderer is responsible for a specific entity type
- No game logic in rendering code

### `/scenes` — Phaser Scenes

Phaser lifecycle management and scene orchestration.

Contains:
- `MainScene` — Core gameplay scene
- `MenuScene` — Entry point and configuration
- Scene transitions and UI management

### `/types` — Shared Types

TypeScript type definitions shared across layers.

Contains:
- Interfaces for configuration
- Theme definitions
- Shared enums when appropriate

## Data Flow

```
User Input → Scene
             ↓
         Systems → Simulation (state update)
             ↓         ↓
         Renderers ← Simulation (state read)
             ↓
         Phaser Display
```

1. **Input** flows from Phaser scenes to systems
2. **Systems** update simulation state
3. **Simulation** contains pure data and logic
4. **Renderers** read simulation state
5. **Phaser** displays the result

## Configuration System

All tunable parameters live in `src/config.ts` and are grouped by concern:

- `WORLD_CONFIG` — World dimensions and boundaries
- `ANT_CONFIG` — Ant physical properties
- `MOVEMENT_CONFIG` — Movement speeds and physics
- `COLONY_CONFIG` — Colony properties
- `PERCEPTION_CONFIG` — Sensory range and detection
- `BEHAVIOR_CONFIG` — State transition probabilities
- `PHEROMONE_CONFIG` — Pheromone mechanics
- `ENERGY_CONFIG` — Metabolism and hunger
- `FOOD_CONFIG` — Food sources and gathering
- `RENDER_CONFIG` — Visual settings
- `THEME_CONFIG` — Color schemes
- `SCENE_CONFIG` — UI layout
- `MENU_CONFIG` — Menu system

Use `as const` for type safety and group constants logically.

## Performance Considerations

### Target Performance
- Support 500+ ants at 60fps
- Maintain smooth rendering with pheromone overlay

### Optimization Strategies

**Spatial Partitioning**
- Grid-based world structure
- Only check nearby entities for perception/collision

**Efficient Data Structures**
- `Float32Array` for pheromone grid
- Flat arrays over nested structures in hot paths
- Object pooling for frequently created/destroyed entities

**Batched Operations**
- Render all ants in single pass
- Update pheromones in batches
- Throttle expensive operations (e.g., diffusion every N frames)

**Avoid Allocations**
- Reuse objects where possible
- No `new` in per-frame update loops
- Cache frequently accessed data

## Extension Points

The architecture is designed for future expansion:

### Planned Extensions
- Multiple colony support
- Complex terrain and underground layers
- Enhanced perception systems (vision, hearing)
- Trait-based ant specialization
- Combat and threat mechanics
- Reproduction and lifecycle systems

### How to Extend

**Adding New Entity Types:**
1. Create data structure in `/sim`
2. Add system update logic
3. Create renderer in `/render`
4. Wire up in scene

**Adding New Behaviors:**
1. Create pure behavior functions in `/sim/behaviors`
2. Integrate into `SimulationSystem`
3. Add configuration in `config.ts`

**Adding New Rendering:**
1. Create new renderer class extending Phaser.GameObjects
2. Read from simulation state only
3. Register in scene
4. Add theme colors to `THEME_CONFIG`

## Testing Strategy

While formal tests are not yet implemented, the architecture supports:

- **Unit tests** for pure simulation functions
- **Integration tests** for systems
- **Visual tests** for rendering
- **Performance benchmarks** for optimization

The simulation-first design makes testing easier by keeping game logic separate from Phaser.
