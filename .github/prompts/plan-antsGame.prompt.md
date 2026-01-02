# Plan: Bootstrap Ants.Game MVP with simulation-first architecture

Initialize a Phaser 3 + TypeScript + Vite project from scratch with strict separation between engine-agnostic simulation logic and Phaser rendering. The workspace is currently empty except for git, so all tooling, structure, and code must be created.

## Steps

1. **Initialize project tooling** — Create `package.json`, `.gitignore`, `tsconfig.json`, `vite.config.ts`, and `index.html` with Phaser 3.80+, TypeScript 5.3+, Vite 5.x

2. **Build folder structure** — Create `/src/sim/` (engine-agnostic), `/src/systems/` (update loops), `/src/render/` (Phaser helpers), `/src/scenes/` (Phaser scenes), `/src/types/` (shared types)

3. **Implement core simulation layer** — Create `src/sim/Ant.ts`, `src/sim/Colony.ts`, `src/sim/World.ts`, `src/sim/AntState.ts` with pure data structures and logic (no Phaser imports)

4. **Create update system** — Build `src/systems/SimulationSystem.ts` to manage deterministic update loop for ants, movement, and future pheromone logic

5. **Wire up Phaser scene** — Implement `src/scenes/MainScene.ts` and `src/main.ts` to initialize game, reference simulation data, and call update system each frame

6. **Add rendering layer** — Create `src/render/AntRenderer.ts` using `Phaser.Graphics` to draw ants as simple shapes, keeping rendering separate from simulation state

## Further Considerations

1. **Grid representation** — Should the world grid be a 2D array, flat array with coordinate conversion, or spatial hash for performance with thousands of ants?

2. **Ant data structure** — Store ants as plain objects with position/velocity/state, or use component pattern for future expandability (tasks, inventory, pheromone sensing)?

3. **Initial ant behavior** — Random walk, seek colony center, or simple patrol pattern for MVP movement demonstration?

## Technology Stack

**Production Dependencies:**
- `phaser`: ^3.80.1

**Development Dependencies:**
- `typescript`: ^5.3.3
- `vite`: ^5.0.11
- `@types/node`: ^20.10.6

**Package Scripts:**
- `dev` — Run Vite dev server
- `build` — Build production bundle
- `preview` — Preview production build
- `type-check` — Run TypeScript compiler check

## Architecture Principles

### Simulation-First Design

- `/src/sim/` — Pure data + logic (ants, states, pheromones, colony rules)
  - **NO Phaser imports allowed**
  - Engine-agnostic simulation logic only
  - Focus on behavior, state machines, and rules

- `/src/systems/` — Update loops that operate on sim data
  - Orchestrate simulation updates
  - Handle game loop timing
  - Coordinate between sim and render

- `/src/render/` — Phaser-specific rendering helpers only
  - Convert sim data to visual representation
  - Use `Phaser.Graphics` for procedural rendering
  - No game logic, only visualization

- `/src/scenes/` — Phaser scenes (game loop, input, camera)
  - Wire up Phaser lifecycle methods
  - Handle input and camera control
  - Delegate to systems for actual work

### Key Constraints

1. **Ants are data, not Phaser objects** — Do not subclass `Phaser.GameObjects` for ants
2. **Minimal assets** — Use procedural graphics, no sprite sheets for MVP
3. **Performance awareness** — Design for hundreds/thousands of ants, avoid per-frame allocations
4. **Copilot-friendly** — Small focused files, explicit interfaces, intent-heavy comments

## MVP Requirements

- A running Phaser scene titled "Ants!"
- A simple grid-based world
- A small number of worker ants with basic movement
- Ants rendered as simple shapes
- A deterministic update loop suitable for future pheromone logic

## Implementation Notes

- Prefer clarity over cleverness
- Avoid premature abstraction
- Leave TODO comments where systems will expand
- When unsure, choose the simplest solution that keeps simulation logic decoupled from rendering
