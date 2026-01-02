# Ants.Game 🐜

A SimAnt-inspired ant colony simulation focused on emergent behavior, pheromone systems, and large numbers of autonomous agents.

## Overview

Ants.Game is a simulation-first game that prioritizes behavioral complexity and emergent gameplay over visual polish. Watch hundreds of ants interact through pheromone trails, build colonies, gather resources, and engage in territorial warfare—all driven by simple rules that create complex outcomes.

## Technology Stack

- **Phaser 3** (v3.80+) — Game engine
- **TypeScript** (v5.3+) — Type-safe development
- **Vite** (v5.x) — Fast build tooling and dev server
- **Procedural Graphics** — Minimal assets, Phaser.Graphics rendering

## Project Status

🚧 **Early Development / MVP Phase**

Currently implementing the foundational simulation architecture and basic ant behaviors.

## Features (Planned)

### MVP
- ✅ Grid-based world representation
- ✅ Basic worker ant entities with simple movement
- ✅ Deterministic update loop
- ✅ Procedural ant rendering (simple shapes)
- 🚧 Colony structure
- 🚧 Basic ant behaviors (wandering, returning to colony)

### Future
- Pheromone system (grid-based diffusion and decay)
- Food sources and resource gathering
- Ant roles (workers, soldiers, queens)
- Multiple colonies with territorial behavior
- Combat mechanics
- Nest building and expansion
- Complex emergent behaviors

## Architecture

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

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/sbryden/Ants.Game.git
cd Ants.Game

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

```bash
npm run dev         # Start Vite dev server with HMR
npm run build       # Build for production
npm run preview     # Preview production build
npm run type-check  # Run TypeScript compiler check
```

## Project Structure

```
Ants.Game/
├── .github/
│   ├── copilot-instructions.md   # AI coding assistant guidelines
│   └── prompts/                   # Development planning documents
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
└── package.json                   # Dependencies and scripts
```

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

## Contributing

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for architectural guidelines and code style conventions.

## License

[MIT License](LICENSE) (or your preferred license)

## Inspiration

- **SimAnt** (Maxis, 1991) — The original ant colony simulation
- **Boids** (Craig Reynolds) — Emergent flocking behavior
- **Ant Colony Optimization** — Computational swarm intelligence

## Roadmap

- [x] Project scaffolding and architecture design
- [ ] Basic simulation loop and ant entities
- [ ] Grid-based world representation
- [ ] Simple ant movement behaviors
- [ ] Colony structure and ant spawning
- [ ] Pheromone system implementation
- [ ] Food sources and gathering mechanics
- [ ] Multiple colony support
- [ ] Combat and territorial behavior

---

Built with ☕ and 🐜 by [sbryden](https://github.com/sbryden)
