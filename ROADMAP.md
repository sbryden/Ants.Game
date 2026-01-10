# Ants.Game Roadmap

This roadmap outlines the evolution of Ants.Game from its current foundation into a deep, emergent ant colony simulation. It is intentionally **system-focused**, not feature-bloated, and prioritizes clarity, iteration, and learning.

The roadmap is organized by **phases**, not strict timelines. Each phase should result in a playable, observable simulation with clear new behaviors.

## Phase 0 — Foundation ✅ **COMPLETE**

**Goal:** A stable simulation loop with visible agents.

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

## Phase 1 — Core Ant Behavior ✅ **COMPLETE**

**Goal:** Ants exhibit purposeful individual behavior.

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

## Phase 2 — Pheromone System ✅ **COMPLETE**

**Goal:** Emergent colony behavior via indirect communication.

- ✅ Pheromone grid data structure (Float32Array-based)
- ✅ Pheromone types: Food, Nest, Danger
- ✅ Core operations: deposit, sample, decay
- ✅ Toggleable pheromone heatmap overlay (press 'P' key)
- ✅ Configuration-driven parameters (PHEROMONE_CONFIG)
- ✅ State-based ant deposition (idle/wandering/foraging/returning)
- ✅ Grid diffusion with 4-neighbor averaging (runs every 3 frames)
- ✅ Pheromone-following behavior (8-directional gradient sampling)
- ✅ Parameter tuning for trail saturation and accumulation

Exit criteria:
* ✅ Ants form visible trails
* ✅ Trails strengthen and decay naturally
* ✅ Emergent path optimization occurs without hardcoding

## Phase 3 — Colony & Resources ✅ **COMPLETE**

**Goal:** The colony becomes a persistent system.

- ✅ Food source entities with spawn/respawn mechanics
- ✅ Ant carrying capacity (5 units per ant)
- ✅ Visual carrying indicators (red dot scaled by inventory)
- ✅ Foraging behavior with food detection
- ✅ Food harvesting at sources
- ✅ Food deposit to colony storage
- ✅ Pheromone trail formation (strong trails when carrying food)
- ✅ Automatic food respawn when depleted
- ✅ Procedural food rendering with opacity feedback

Exit criteria:
* ✅ Ants successfully gather and return food
* ✅ Colony state meaningfully changes over time
* ✅ Player can visually understand resource flow

## Phase 4 — Health & Eating ✅ **COMPLETE**

**Goal:** Colonies survive by maintaining positive food flow.

- ✅ Ant energy/metabolism system (0-100 energy scale)
- ✅ Activity-based energy consumption (idle/wandering/foraging/returning)
- ✅ Food-to-energy conversion (ants eat stored food at colony)
- ✅ Hunger-driven behavior (hungry ants return home more frequently)
- ✅ Starvation effects (movement slowdown based on energy level)
- ✅ Death from starvation (ants die when energy reaches 0)
- ✅ Colony resource tracking (food stored, consumption rate, gathering rate)
- ✅ Colony health status (healthy/struggling/critical/dead)
- ✅ Live metrics UI (displays food balance and colony status)
- ✅ Survival mechanics (colony must maintain positive food production)

Exit criteria:
* ✅ Ants require food to stay active
* ✅ Colony must maintain positive food production (foraging > consumption)
* ✅ Player observes resource flow dynamically
* ✅ Survival mechanics add strategic depth

## Phase 5 — Menu / Title Screen ✅ **COMPLETE**

**Goal:** Create a calm, minimal entry point that reflects the game's observational nature.

The menu system acts as both the **first screen** players see and a **lightweight configuration step** before entering the simulation.

### Design Principles

* **Minimal and observational** — Text and UI elements are kept simple
* **Living background** — Ants are visible and moving behind the menu overlay
* **Defaults-first** — Players can start immediately without changing any settings

### Implemented Features

* **Living Background** — 15 ants wandering behind menu UI at 60 FPS
* **Start Simulation Button** — Immediate play with default settings (ENTER key shortcut)
* **Configuration Panel** — Toggle with ⚙ button
  * Ant count slider (10-100, step 5)
  * Theme selector (Default, High Contrast, Black & White)
  * Apply/Cancel buttons with smooth animations
* **Theme System** — Extensible color system affecting:
  * Ant state colors
  * Colony nest colors
  * Pheromone visualization colors
  * Food source colors
  * Obstacle colors
  * UI text colors
* **Scene Lifecycle** — Smooth transitions between menu and game
  * R key returns from game to menu
  * Proper resource cleanup on scene transitions
* **Keyboard Shortcuts** — ENTER to start, ESC to close config, R to restart

Exit criteria:
* ✅ Menu serves as an inviting, calm entry point
* ✅ Players can configure basic simulation parameters
* ✅ Sensible defaults allow immediate play
* ✅ Theme system is extensible for future options
* ✅ 60 FPS performance maintained

## Phase 6 — Emergent Worker Specialization ✅ **COMPLETE**

**Goal:** Ants develop distinct behavioral patterns through experience.

**Core Principle:** All ants are workers, but they diverge over time through **traits**, not hard-coded classes. Specialization is **expressed**, not assigned.

> Ants become better at what they do most.

**Status:** ✅ **Complete** (January 2026)

### Trait-Based Model

Each ant has a small numeric trait profile:

* `taskAffinity` — Bias toward gathering, nursing, digging, building
* `movementSpeed`
* `carryCapacity`
* `energyEfficiency`
* `pheromoneSensitivity`
* `wanderingRadius`

Traits are **multipliers**, not gates.

### Emergent "Roles" (Labels Only)

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

### How Specialization Emerges

* Ants start as near-generalists
* Performing a task slightly increases related traits
* Colony needs bias task-selection probabilities
* New ants may spawn with mild trait bias based on colony state
* No instant role-switching — behavior **drifts** over time

### Technical Implementation

* Traits live in `sim/traits`
* Tasks query traits, **never roles**
* Ants do not know what "type" they are
* Rendering may tint ants **only for debug**

### Completed Implementation

- ✅ Trait system with 6 core traits:
  - `taskAffinity` (gathering, nursing, digging, building)
  - `movementSpeed`, `carryCapacity`, `energyEfficiency`
  - `pheromoneSensitivity`, `wanderingRadius`
- ✅ TraitEvolutionSystem for gradual trait changes
- ✅ Traits integrated into all behaviors:
  - Movement speed scaled by trait
  - Pheromone sensitivity affects trail following
  - Carry capacity affects food gathering
  - Energy efficiency affects metabolism
- ✅ Trait evolution based on ant actions:
  - Foraging increases gathering affinity
  - Carrying food increases carry capacity
  - Following trails increases pheromone sensitivity
  - Unused traits decay toward baseline
- ✅ Role derivation system (labels derived from traits, not stored)
- ✅ Debug visualization (press 'Y' for trait overlay)
- ✅ Visual role tinting in debug mode
- ✅ Trait bounds enforced (0.5-2.0 range)

Exit criteria:
* ✅ Ants visibly specialize over time
* ✅ Behavior feels organic, not scripted
* ✅ Colony efficiency improves naturally through specialization
* ✅ System is observable and debuggable

### Caste Notes (concise)

* While the Phase name focuses on worker specialization, the game will include multiple ant castes over time: **workers**, **soldiers**, **scouts**, **queens**, **princesses**, and potentially others.
* For roadmap simplicity, Phase 6 emphasizes worker specialization first. Other castes exist conceptually but their deep specialization systems belong to later phases.
* All castes can perform core tasks (gathering food, caring for young, fighting), but castes differ by efficiency via trait multipliers. Example: a worker might fight at ~10% effectiveness of a soldier, while a soldier might perform worker tasks at ~10% of a worker's efficiency.
* Specialization is expressed as trait multipliers rather than hard roles; this lets any ant perform any task with varying effectiveness.

### Future Flexibility

* The system should allow ants to shift their effective specialization over time if colony needs change (e.g., temporary role drift or deliberate retraining). This is a "future feature" to keep Phase 6 focused and lightweight.
* Deeper caste mechanics, lifecycle rules (e.g., queens/princesses spawning new castes), and caste-specific behaviors will be introduced in later phases when the simulation and pheromone systems are stable.

## Phase 7 — Underground Colony System

**Goal:** Implement SimAnt-style side-view underground layer with automatic expansion.

### Overview

The simulation will now run on two layers:
- **Surface (top-down view)** — existing foraging world
- **Underground (side-view)** — ant farm-style cross-section showing tunnels, chambers, queen, eggs, larvae

Player toggles between views with **'U' key**. Both simulations run continuously regardless of which view is active.

### Core Mechanics

**Dual-World System:**
- Surface and underground share the same ants (ants have `currentLayer` property)
- Single entrance connects the layers (ants transition through it)
- Both layers update every frame, independent of which is being viewed
- Camera switches between scenes, but simulation continues in both

**Automatic Digging:**
- Ants dig new tunnels based on colony needs (not player-controlled)
- Digging decisions emerge from needs:
  - Queen needs space → expand queen chamber
  - Food storage full → dig storage chamber
  - Egg count high → expand nursery
  - Colony size growing → widen main tunnels
- Digging behavior is a new ant state (DIGGING)
- Tunnels have organic randomness (not perfect rectangles)
- Dirt tiles become tunnel tiles when dug

**Starting State:**
- Single entrance from surface
- Short main tunnel leading down and to the side
- Small queen chamber at the end
- Queen entity present, begins laying eggs immediately
- 3-5 worker ants start in the chamber

**Underground Features:**
- Tile-based grid (TileType: DIRT, TUNNEL, CHAMBER, ENTRANCE)
- Queen entity (stationary, lays eggs on cooldown)
- Egg entities (placed in chamber, require care)
- Larvae entities (eggs hatch after X time, need feeding)
- Food storage visualization (carried food deposited underground)
- Emergent chamber formation (ants naturally create distinct zones)

**Layer Transitions:**
- Ants can enter/exit through the entrance tile
- Transition logic:
  - Foraging ants exit to surface
  - Returning ants enter underground
  - Brood care ants stay underground
  - Idle ants wander between layers
- Entrance is a special tile on both layers (top-down: hole, side-view: tunnel opening)

### Implementation Phases

This phase is broken into sub-phases for clarity:

**Phase 7A — Underground World Foundation** ✅ **COMPLETE**
- ✅ Create `UndergroundWorld` class (parallel to `World`)
- ✅ Implement tile grid (2D array of TileType)
- ✅ Add `UndergroundScene` (side-view camera)
- ✅ Create entrance entity (shared between layers)
- ✅ Add `currentLayer` property to ants ('surface' | 'underground')

**Phase 7B — Layer Transitions** ✅ **COMPLETE**
- ✅ Implement entrance transition logic
- ✅ Add behavior rules for when ants enter/exit
- ✅ Update ant rendering to handle both layers
- ✅ Ensure both simulations run continuously
- ✅ Add 'U' key toggle between scenes

**Phase 7C — Basic Digging** ✅ **COMPLETE**
- ✅ Add DIGGING state to ant state machine
- ✅ Implement digging behavior (select adjacent dirt tile, convert to tunnel)
- ✅ Add tunnel expansion logic (widen existing paths)
- ✅ Create organic randomness in tunnel shapes
- ✅ Visual feedback for digging (ants stationary while digging)

**Phase 7D — Queen & Eggs**
- Create Queen entity (stationary, high-priority care)
- Implement egg-laying mechanic (cooldown-based)
- Place eggs in chamber tiles
- Add egg visualization (small white circles)
- Queen requires food from workers

**Phase 7E — Emergent Chambers**
- Ants dig chambers when certain thresholds are met:
  - Food storage needs → dig food chamber
  - Egg count high → expand nursery
  - Colony size → dig rest areas
- Chamber identification (connected tunnel tiles exceeding size threshold)
- Visual distinction (chambers slightly larger, different tint)

**Phase 7F — Automatic Expansion Logic**
- Colony need assessment system:
  - Food surplus → trigger storage expansion
  - Egg count / larvae count → trigger nursery expansion
  - Traffic congestion → widen main tunnels
  - Queen health low → prioritize queen chamber
- Digging task assignment (idle ants become diggers when needed)
- Prevent over-expansion (diminishing returns, energy costs)

**Phase 7G — Polish & Integration**
- Render underground elements (dirt, tunnels, chambers, eggs)
- Add pheromone overlay for underground layer
- Minimap shows both layers (toggle or split view)
- Debug UI shows layer stats
- Performance optimization for dual simulation

### Technical Architecture

Key new files:
```
/src/sim/UndergroundWorld.ts       — Tile grid and underground state
/src/sim/Queen.ts                   — Queen entity
/src/sim/Egg.ts                     — Egg entity
/src/sim/TileType.ts                — Enum for tile types
/src/scenes/UndergroundScene.ts     — Side-view scene
/src/render/UndergroundRenderer.ts  — Tile and entity rendering
/src/systems/DiggingSystem.ts       — Automatic digging logic
/src/behaviors/diggingBehaviors.ts  — DIGGING state behavior
```

Updated files:
```
/src/sim/Ant.ts                     — Add currentLayer, DIGGING state
/src/sim/World.ts                   — Add entrance reference
/src/systems/SimulationSystem.ts    — Update both worlds
/src/scenes/MainScene.ts            — Add 'U' key handler
```

### Exit Criteria
* ✅ Underground side-view renders correctly
* ✅ Ants transition between layers via entrance
* ✅ Queen lays eggs in chamber
* ✅ Ants dig tunnels automatically based on needs
* ✅ Chambers emerge naturally (food storage, nursery)
* ✅ Both layers simulate simultaneously
* ✅ 'U' key toggles between views smoothly
* ✅ Performance stable with dual simulation

## Phase 8 — Full Brood Lifecycle

**Goal:** Complete the ant reproduction cycle with larvae and pupae stages.

* Larvae entities (hatched eggs, require feeding)
* Worker feeding behavior (carry food to larvae)
* Larvae growth stages (visual progression)
* Pupae stage (mature larvae, dormant period)
* Pupae → adult ant transition (workers, specialized castes)
* Population growth dynamics
* Energy cost of reproduction (colony needs surplus food)
* Brood care specialization (some workers prioritize nursery tasks)

Exit criteria:
* Full egg → larva → pupa → ant lifecycle works
* Brood care creates specialized worker behavior
* Colony population grows if food surplus sufficient
* Population stabilizes or declines if food deficit
* Larvae visually grow over time
* Pupae hatch into adults with appropriate castes

## Phase 9 — Minimap & Spatial Awareness

**Goal:** Provide players with a spatial overview of the world and colony activity.

* Minimap display in corner of screen
* Shows colony location and home base
* Displays food source locations
* Visualizes ant activity hotspots
* Indicates exploration boundaries
* Real-time updates of ant distribution
* Interactive click-to-pan navigation
* Toggleable layers (ants, food, pheromones)
* Configurable zoom level and detail

Exit criteria:
* Minimap accurately represents world state
* Click-to-pan navigation works smoothly
* Layer toggles function correctly
* Minimap provides useful spatial awareness
* Performance remains stable with minimap active

## Phase 10 — Player Interaction (Indirect Control)

**Goal:** Player influences the system without direct unit control.

* Place / remove food sources
* Disturb terrain (block paths, create obstacles)
* View colony statistics
* Time controls (pause, speed up, slow down)
* Debug UI becomes intentional UI
* Pheromone placement tools
* Observation/inspection mode for individual ants

Exit criteria:
* Player feels like an observer / influencer, not a micromanager
* Interactions reinforce simulation learning
* Tools feel responsive and intuitive

## Phase 11 — World Depth

**Goal:** Add environmental complexity.

* Fog of war / unexplored areas
* Terrain types (soft soil, rock, impassable)
* Environmental hazards
* Multiple underground layers (deeper digging)
* Resource veins (underground minerals, water)

Exit criteria:
* Exploration becomes meaningful
* The map feels like a system, not a backdrop
* Underground has depth and variety

## Phase 12 — Other Colonies & Threats

**Goal:** Introduce conflict and competition.

* Rival ant colonies
* Territory pheromones
* Simple combat interactions
* Predators or environmental threats

Exit criteria:
* Emergent conflict arises naturally
* No hard-scripted battles

## Phase 13 — Systems & Scale

**Goal:** Stress-test the simulation.

* Hundreds to thousands of ants
* Performance profiling and optimization
* System batching and update throttling
* Optional headless / fast-forward simulation

Exit criteria:
* Simulation remains stable under load
* Performance issues are understood and controlled

## Phase 14 — Persistence & Replayability

**Goal:** Make simulations meaningful over time.

* Save / load colony state
* Replay or time-lapse viewing
* Scenario presets
* Parameterized world generation

Exit criteria:
* Simulations can be revisited and compared
* Player can experiment intentionally

## Phase 15 — Polish (Only If It Serves Clarity)

**Goal:** Improve readability, not flash.

* Subtle animations
* Improved color language
* Sound cues tied to system events
* Optional visual themes

Exit criteria:
* Visuals enhance understanding
* No system complexity added purely for aesthetics

## Guiding Principles (Do Not Break)

* Simulation logic is always engine-agnostic
* Emergence > scripting
* Debug views are first-class features
* Clarity beats realism
* Systems should explain themselves visually

## Non-Goals (Intentionally Out of Scope)

* Direct unit control
* Heavy narrative
* High-fidelity art
* Twitch-reflex gameplay

**Ants.Game is not about winning fast — it is about *watching intelligence emerge*.**
