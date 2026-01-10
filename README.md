# Ants.Game 🐜

A SimAnt-inspired ant colony simulation focused on emergent behavior, pheromone systems, and large numbers of autonomous agents.

**[🎮 Try the game](https://sbryden.github.io/Ants.Game/)**

## Overview

Ants.Game is a simulation-first game that prioritizes behavioral complexity and emergent gameplay over visual polish. Watch hundreds of ants interact through pheromone trails, build colonies, gather resources, and engage in territorial warfare—all driven by simple rules that create complex outcomes.

## Current Features

✅ **Core Simulation**
- Grid-based world with multiple food sources
- State machine-driven ant behavior (Idle, Wandering, Foraging, Returning)
- Smooth movement with inertia and obstacle avoidance
- Energy/metabolism system with hunger-driven behavior

✅ **Pheromone System**
- Three pheromone types (Food, Nest, Danger)
- Emergent trail formation and optimization
- Diffusion and decay mechanics
- Toggleable visualization overlay

✅ **Colony Management**
- Food gathering and storage
- Consumption and starvation mechanics
- Live metrics and health status
- Survival-based gameplay

✅ **Menu & Themes**
- Configuration panel with ant count slider
- Three visual themes (Default, High Contrast, Black & White)
- Living background simulation

## Technology Stack

- **Phaser 3** (v3.80+) — Game engine
- **TypeScript** (v5.3+) — Type-safe development
- **Vite** (v5.x) — Fast build tooling and dev server
- **Procedural Graphics** — Minimal assets, Phaser.Graphics rendering

## Project Status

🚧 **Phase 5 Complete — Next: Worker Specialization**

See [ROADMAP.md](ROADMAP.md) for the full development plan.

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

## Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)** — Design principles, project structure, and technical decisions
- **[Ant Behavior Guide](docs/BEHAVIOR.md)** — State machines, pheromone systems, and emergent mechanics
- **[Roadmap](ROADMAP.md)** — Development phases and planned features

## Contributing

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for architectural guidelines and code style conventions.

## License

[MIT License](LICENSE)

## Inspiration

- **SimAnt** (Maxis, 1991) — The original ant colony simulation
- **Boids** (Craig Reynolds) — Emergent flocking behavior
- **Ant Colony Optimization** — Computational swarm intelligence

---

Built with ☕ and 🐜 by [sbryden](https://github.com/sbryden)
