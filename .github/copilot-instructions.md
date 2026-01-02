# GitHub Copilot Instructions for Ants.Game

## Project Overview

<!-- Brief description of what this project does and its goals -->

Ants.Game is a SimAnt-inspired ant colony simulation focused on emergent behavior, pheromone systems, and large numbers of autonomous agents. The game prioritizes simulation clarity over visual polish.

## Technology Stack

- **Engine**: Phaser 3 (v3.80+)
- **Language**: TypeScript (v5.3+)
- **Build Tool**: Vite (v5.x)
- **Rendering**: Procedural graphics using Phaser.Graphics (no sprite sheets)

## Architecture Principles

### Simulation-First Design

**CRITICAL**: Core simulation logic MUST be engine-agnostic.

- `/src/sim/` — Pure data structures and logic. **NO Phaser imports allowed.**
- `/src/systems/` — Update loops that operate on sim data
- `/src/render/` — Phaser-specific rendering helpers only (visualization, no logic)
- `/src/scenes/` — Phaser scenes (lifecycle, input, camera)

### Key Constraints

1. **Ants are data, not Phaser objects** — Never subclass `Phaser.GameObjects` for game entities
2. **Separation of concerns** — Simulation state lives in `/sim`, rendering references it
3. **Performance-first** — Design for hundreds/thousands of agents, avoid per-frame allocations
4. **Minimal dependencies** — Keep the dependency tree small and focused

## Code Style Guidelines

### General Principles

- **Clarity over cleverness** — Prefer explicit, readable code
- **Small, focused files** — Each file should have a single, clear purpose
- **Explicit interfaces and enums** — Define contracts clearly
- **Intent-heavy comments** — Explain "why" before implementation details
- **Avoid premature abstraction** — Start simple, refactor when patterns emerge

### Naming Conventions

Follow this naming scheme consistently:

**Files and Folders:**
- **Folders**: kebab-case (e.g., `ant-colony/`, `pheromone-system/`)
- **Class files**: PascalCase.ts (e.g., `Ant.ts`, `Colony.ts`, `PheromoneGrid.ts`)
- **Utility files**: camelCase.ts (e.g., `pheromoneHelpers.ts`, `mathUtils.ts`)
- **Config files**: kebab-case (e.g., `vite.config.ts`, `tsconfig.json`)

**Code Elements:**
- **Classes**: PascalCase (e.g., `class Ant`, `class ColonyManager`)
- **Interfaces/Types**: PascalCase (e.g., `interface AntState`, `type Position`)
- **Enums**: PascalCase (e.g., `enum AntRole`, `enum PheromoneType`)
- **Functions/Variables**: camelCase (e.g., `updateAnt()`, `antPosition`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_ANTS`, `DEFAULT_SPEED`)

### TypeScript Patterns

- **Enable strict mode** — Set `strict: true` in tsconfig.json to enable all strict type-checking options
- **Explicit type annotations** — Avoid implicit `any`; always annotate function parameters, return types, and variable declarations where type inference is unclear
- **Classes for stateful structures** — Use classes for entities, systems, and data structures with behavior; prefer pure functions for stateless operations and utilities 

## Directory Structure

```
/src
  /sim       - Engine-agnostic simulation (NO Phaser imports)
  /systems   - Update loops and orchestration
  /render    - Phaser rendering layer
  /scenes    - Phaser scene definitions
  /types     - Shared TypeScript types
```

## Common Patterns

### Simulation Entities

<!-- Describe how to structure entities like ants, pheromones, etc. -->

### Update Systems

<!-- Describe the pattern for creating new update systems -->

### Rendering

<!-- Describe how to add new rendering logic -->

## Things to Avoid

- ❌ Importing Phaser in `/src/sim/` files
- ❌ Subclassing `Phaser.GameObjects.*` for game entities
- ❌ Storing game logic in rendering code
- ❌ Creating allocations inside hot loops (per-frame operations)
- ❌ Using sprite assets when procedural graphics will do
- ❌ Premature optimization without profiling

## Documentation Philosophy

### README Maintenance

**Keep README.md current** — Update when:
- Significant technologies are added, removed, or changed (e.g., new libraries, version upgrades)
- Major features are implemented, removed, or substantially changed
- Project status/phase changes (MVP → Beta → Release)

**README should be high-level** — Avoid technical implementation details:
- ✅ "Grid-based pheromone system with decay"
- ❌ "Pheromone grid uses flat Float32Array with bilinear interpolation"

**Handle completed features appropriately**:
- When a feature is completed, incorporate its mechanics into the relevant documentation sections
- Remove completed items from roadmaps — keep roadmaps future-looking only
- Don't mark roadmap items as "done" or "completed"; simply remove them and update to show future state
- If work is purely technical (refactoring, infrastructure), update roadmap without adding documentation

### Code Documentation

**Prefer self-documenting code**:
- Use clear, descriptive names for functions, variables, and types
- Keep functions small and focused on a single responsibility
- Write code that reads like prose when possible

**Light comments where needed**:
- Explain "why" decisions were made, not "what" the code does
- Document non-obvious algorithms or performance considerations
- Add TODOs for future expansion points
- Clarify intent when code constraints require unclear solutions

**Do NOT create documentation files** unless specifically requested:
- No separate API documentation
- No architecture diagrams (unless asked)
- No change logs or verbose documentation

### Planning Files

**Use `.github/` folder for planning**:
- Create plan files (`.prompt.md`) to track work
- Iterate on plans before implementation
- Keep plans focused and actionable
- Archive or remove plans once executed

### Maintaining This Document

**Review for organization when adding content**:
- Check for duplicate sections or overlapping guidance
- Ensure new sections fit logically with existing structure
- Consolidate similar topics to avoid redundancy
- Keep the document scannable and well-organized

## Testing Strategy

<!-- Add testing guidelines as they're established -->

## Performance Considerations

- Target: Support 500+ ants at 60fps
- Use object pooling for frequently created/destroyed objects
- Batch rendering operations when possible
- Profile before optimizing

## Future Expansion Points

<!-- Mark areas designed for future enhancement -->

- Pheromone system (grid-based diffusion)
- Complex ant behaviors (foraging, combat, building)
- Multiple colony support
- Food sources and resource gathering
- Terrain types and navigation

## TODOs and Open Questions

<!-- Track architectural decisions that need to be made -->

-
