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
- ✅ Colony structure with nest visualization
- ✅ Basic ant behaviors (wandering, foraging, returning to colony)
- ✅ Finite state machine with smooth transitions
- ✅ Obstacle avoidance and perception system

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

This roadmap outlines the evolution of Ants.Game from its current foundation into a deep, emergent ant colony simulation. It is intentionally **system-focused**, not feature-bloated, and prioritizes clarity, iteration, and learning.

The roadmap is organized by **phases**, not strict timelines. Each phase should result in a playable, observable simulation with clear new behaviors.

### Phase 0 — Foundation

**Goal:** A stable simulation loop with visible agents.

Status: ✅ **Complete**

* ✅ Phaser + TypeScript scaffold
* ✅ Deterministic update loop
* ✅ Basic world bounds
* ✅ Ant data model
* ✅ Simple ant movement / wandering
* ✅ Procedural rendering (no assets)
* ✅ Project structure aligned with simulation-first architecture
* ✅ Colony nest visualization
* ✅ Returning to colony behavior
* ✅ Centralized configuration system (config.ts)

Exit criteria:

* ✅ Ants move consistently and deterministically
* ✅ Simulation logic is decoupled from rendering
* ✅ Codebase feels easy to reason about

### Phase 1 — Core Ant Behavior

**Goal:** Ants exhibit purposeful individual behavior.

Status: ✅ **Complete**

* ✅ Ant finite state machine (FSM)
  * Idle
  * Wandering
  * Foraging
  * Returning
* ✅ Directional movement with inertia (smooth turning)
* ✅ Obstacle avoidance using tangent-based steering
* ✅ Perception system foundation (PerceptionData interface)
* ✅ Randomized probabilistic decision-making
* ✅ Debug visualization of ant state (color-coded by state)
* ✅ Live debug UI showing state distribution

Exit criteria:

* ✅ Individual ants feel "alive"
* ✅ States are easy to inspect and reason about
* ✅ No pheromones yet — behavior is still local

### Phase 2 — Pheromone System (The Heart of the Game) (Current)

**Goal:** Emergent colony behavior via indirect communication.

* Pheromone grid data structure
* Pheromone types:
  * Food
  * Nest
  * Danger (future)
* Deposit rules tied to ant state
* Decay and diffusion over time
* Pheromone-following behavior
* Toggleable pheromone heatmap overlay

Exit criteria:

* Ants form visible trails
* Trails strengthen and decay naturally
* Emergent path optimization occurs without hardcoding

### Phase 3 — Emergent Worker Specialization

**Goal:** Ants develop distinct behavioral patterns through experience.

**Core Principle:** All ants are workers, but they diverge over time through **traits**, not hard-coded classes. Specialization is **expressed**, not assigned.

> Ants become better at what they do most.

#### Trait-Based Model

Each ant has a small numeric trait profile:

* `taskAffinity` — Bias toward gathering, nursing, digging, building
* `movementSpeed`
* `carryCapacity`
* `energyEfficiency`
* `pheromoneSensitivity`
* `wanderingRadius`

Traits are **multipliers**, not gates.

#### Emergent "Roles" (Labels Only)

Roles are **derived**, never stored.

* **Food Gatherer**
  * High movement speed
  * High food-pheromone sensitivity
  * Increased carry capacity

* **Nursery Worker**
  * Strong brood-task affinity
  * Small wandering radius
  * High energy efficiency when idle

* **Builder / Digger**
  * Faster terrain modification
  * Lower movement speed
  * Reduced attraction to food trails

> An ant may partially fit multiple roles.

#### How Specialization Emerges

* Ants start as near-generalists
* Performing a task slightly increases related traits
* Colony needs bias task-selection probabilities
* New ants may spawn with mild trait bias based on colony state
* No instant role-switching — behavior **drifts** over time

#### Technical Implementation

* Traits live in `sim/traits`
* Tasks query traits, **never roles**
* Ants do not know what "type" they are
* Rendering may tint ants **only for debug**

Exit criteria:

* Ants visibly specialize over time
* Behavior feels organic, not scripted
* Colony efficiency improves naturally through specialization
* System is observable and debuggable

#### Caste Notes (concise)

* While the Phase name focuses on worker specialization, the game will include multiple ant castes over time: **workers**, **soldiers**, **scouts**, **queens**, **princesses**, and potentially others.
* For roadmap simplicity, Phase 3 emphasizes worker specialization first. Other castes exist conceptually but their deep specialization systems belong to later phases.
* All castes can perform core tasks (gathering food, caring for young, fighting), but castes differ by efficiency via trait multipliers. Example: a worker might fight at ~10% effectiveness of a soldier, while a soldier might perform worker tasks at ~10% of a worker's efficiency.
* Specialization is expressed as trait multipliers rather than hard roles; this lets any ant perform any task with varying effectiveness.

#### Future Flexibility

* The system should allow ants to shift their effective specialization over time if colony needs change (e.g., temporary role drift or deliberate retraining). This is a "future feature" to keep Phase 3 focused and lightweight.
* Deeper caste mechanics, lifecycle rules (e.g., queens/princesses spawning new castes), and caste-specific behaviors will be introduced in later phases when the simulation and pheromone systems are stable.

### Phase 4 — Colony & Resources

**Goal:** The colony becomes a persistent system.

* Nest location
* Food sources placed in the world
* Food pickup and delivery
* Shared colony food store
* Simple success / failure conditions (e.g. starvation)

Exit criteria:

* Ants successfully gather and return food
* Colony state meaningfully changes over time
* Player can visually understand resource flow

### Phase 5 — Player Interaction (Indirect Control)

**Goal:** Player influences the system without direct unit control.

* Place / remove food sources
* Disturb terrain (block paths, create obstacles)
* View colony statistics
* Time controls (pause, speed up, slow down)
* Debug UI becomes intentional UI

Exit criteria:

* Player feels like an observer / influencer, not a micromanager
* Interactions reinforce simulation learning

### Phase 6 — World Depth

**Goal:** Add environmental complexity.

* Above-ground vs underground layers
* Fog of war / unexplored areas
* Terrain types (soft soil, rock, impassable)
* Environmental hazards

Exit criteria:

* Exploration becomes meaningful
* The map feels like a system, not a backdrop

### Phase 7 — Other Colonies & Threats

**Goal:** Introduce conflict and competition.

* Rival ant colonies
* Territory pheromones
* Simple combat interactions
* Predators or environmental threats

Exit criteria:

* Emergent conflict arises naturally
* No hard-scripted battles

### Phase 8 — Systems & Scale

**Goal:** Stress-test the simulation.

* Hundreds to thousands of ants
* Performance profiling and optimization
* System batching and update throttling
* Optional headless / fast-forward simulation

Exit criteria:

* Simulation remains stable under load
* Performance issues are understood and controlled

### Phase 9 — Persistence & Replayability

**Goal:** Make simulations meaningful over time.

* Save / load colony state
* Replay or time-lapse viewing
* Scenario presets
* Parameterized world generation

Exit criteria:

* Simulations can be revisited and compared
* Player can experiment intentionally

### Phase 10 — Polish (Only If It Serves Clarity)

**Goal:** Improve readability, not flash.

* Subtle animations
* Improved color language
* Sound cues tied to system events
* Optional visual themes

Exit criteria:

* Visuals enhance understanding
* No system complexity added purely for aesthetics

### Guiding Principles (Do Not Break)

* Simulation logic is always engine-agnostic
* Emergence > scripting
* Debug views are first-class features
* Clarity beats realism
* Systems should explain themselves visually

### Non-Goals (Intentionally Out of Scope)

* Direct unit control
* Heavy narrative
* High-fidelity art
* Twitch-reflex gameplay

**Ants.Game is not about winning fast — it is about *watching intelligence emerge*.**

---

Built with ☕ and 🐜 by [sbryden](https://github.com/sbryden)
