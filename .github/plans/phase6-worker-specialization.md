# Plan: Phase 6 — Emergent Worker Specialization

**Status:** 🚧 **Planning**

**Goal:** Ants develop distinct behavioral patterns through experience, not hard-coded classes.

## Overview

Phase 6 introduces trait-based worker specialization where ants become better at what they do most. All ants are workers, but they diverge over time through numeric trait profiles rather than fixed roles. Specialization is expressed through behavior, not assigned labels.

> **Core Principle:** Ants become better at what they do most.

## Phase 6 Exit Criteria

- [ ] Ants have trait profiles that affect their behavior
- [ ] Traits influence task selection probabilities
- [ ] Performing tasks increases related trait values
- [ ] Ants visibly specialize over time
- [ ] Behavior feels organic, not scripted
- [ ] Colony efficiency improves naturally through specialization
- [ ] System is observable and debuggable
- [ ] No hard-coded roles (roles are derived labels only)

## Design Decisions

### Trait-Based Model

Each ant has a numeric trait profile stored in `AntState`:

**Core Traits:**
* `taskAffinity` — Object with keys: `gathering`, `nursing`, `digging`, `building`
  * Range: 0.5 to 2.0 (1.0 is baseline)
  * Multipliers for task performance
* `movementSpeed` — Base movement speed multiplier (0.7 to 1.3)
* `carryCapacity` — Food carrying capacity multiplier (0.8 to 1.5)
* `energyEfficiency` — Energy consumption multiplier (0.8 to 1.2, lower is better)
* `pheromoneSensitivity` — Strength of pheromone gradient following (0.5 to 1.5)
* `wanderingRadius` — Preferred exploration distance from colony (0.5 to 2.0)

**Implementation Notes:**
- Traits are multipliers, not gates
- No ant is forbidden from any task
- Traits shift gradually over time
- New ants spawn with near-baseline traits (slight random variance)

### Emergent "Roles" (Labels Only)

Roles are **derived from traits**, never stored as a property.

**Derived Role Profiles:**

#### Food Gatherer
- High `taskAffinity.gathering` (> 1.3)
- High `movementSpeed` (> 1.1)
- High `pheromoneSensitivity` for food trails (> 1.2)
- Increased `carryCapacity` (> 1.2)

#### Nursery Worker
- High `taskAffinity.nursing` (> 1.3)
- Small `wanderingRadius` (< 0.8, stays near colony)
- High `energyEfficiency` (< 0.9, uses less energy when idle)
- Lower `movementSpeed` (< 0.9)

#### Builder / Digger
- High `taskAffinity.building` and `taskAffinity.digging` (> 1.3)
- Lower `movementSpeed` (< 0.9)
- Lower `pheromoneSensitivity` for food trails (< 0.8)
- Higher base strength for terrain modification (future feature)

**Important:** An ant may partially fit multiple roles. Roles are fuzzy labels for debugging/visualization, not actual classes.

### How Specialization Emerges

#### Initial State
- All ants spawn as near-generalists
- Traits start around 1.0 ± small random variance (0.9-1.1)
- No predetermined roles

#### Trait Drift Over Time
- **Performing a task** increases related trait slightly:
  - Foraging food → increases `taskAffinity.gathering` by 0.01 per successful trip
  - Staying idle near colony → increases `taskAffinity.nursing` by 0.005 per update
  - (Building/digging reserved for future phases)
- **Not performing a task** causes trait to slowly decay toward 1.0 (baseline):
  - Decay rate: 0.001 per update when not using trait
  - Prevents permanent lock-in, allows adaptation
- **Trait caps**: Min 0.5, Max 2.0 (prevents runaway specialization)

#### Task Selection Bias
- Ants query their own traits when deciding what to do
- Higher `taskAffinity.gathering` → more likely to transition to FORAGING
- Higher `taskAffinity.nursing` → more likely to stay IDLE or patrol near colony
- Colony needs can override individual preferences (hunger threshold forces foraging)

#### Spawning New Ants (Future Phase 7 Integration)
- New ants may spawn with mild trait bias based on current colony state
- If colony lacks food gatherers, new ants spawn with slightly higher `gathering` trait
- Keeps colony composition balanced without hard-coding ratios

### Technical Implementation

#### File Structure

**New Files:**
```
/src/sim/traits/
  AntTraits.ts          # Trait interface and constants
  traitEvolution.ts     # Functions for trait drift and updates
  roleDerivation.ts     # Derive role labels from traits (debug only)

/src/systems/
  TraitEvolutionSystem.ts  # System to update ant traits over time
```

**Modified Files:**
```
/src/sim/AntState.ts      # Add traits property to AntState interface
/src/sim/behaviors/       # Query traits when making decisions
/src/systems/SimulationSystem.ts  # Integrate TraitEvolutionSystem
/src/render/AntRenderer.ts  # Optional: tint ants based on derived role (debug mode)
```

#### Integration Points

1. **AntState Extension**
   - Add `traits: AntTraits` property to `AntState` interface
   - Initialize traits in Ant constructor (near-baseline with small variance)

2. **Behavior Integration**
   - `antBehaviors.ts`: Query `ant.traits.taskAffinity.gathering` when deciding to forage
   - `pheromoneBehaviors.ts`: Scale gradient strength by `ant.traits.pheromoneSensitivity`
   - `movementSpeed`: Multiply base speed by `ant.traits.movementSpeed`

3. **Trait Evolution System**
   - New system runs after SimulationSystem
   - Checks each ant's recent actions (foraging, idle time, etc.)
   - Adjusts traits accordingly
   - Clamps traits to [0.5, 2.0]

4. **Debug Visualization**
   - Optional: Tint ants based on strongest trait (food gatherer = green, nursery = yellow, builder = brown)
   - Only activate in debug mode (press 'T' key for trait overlay)
   - Show derived role label on hover

### Configuration Constants

Add to `src/config.ts`:

```typescript
export const TRAIT_CONFIG = {
  // Initial trait variance when ants spawn
  INITIAL_VARIANCE: 0.1, // ±0.1 from baseline 1.0
  
  // Trait evolution rates
  TRAIT_INCREASE_RATE: 0.01,  // Per task completion
  TRAIT_DECAY_RATE: 0.001,     // Per update when not using trait
  
  // Trait bounds
  MIN_TRAIT_VALUE: 0.5,
  MAX_TRAIT_VALUE: 2.0,
  
  // Task affinity thresholds for role derivation (debug only)
  HIGH_AFFINITY_THRESHOLD: 1.3,
  LOW_AFFINITY_THRESHOLD: 0.7,
} as const;
```

### Caste System Notes

**Important Context:**
- Phase 6 focuses on **worker specialization** within a single caste
- The game will eventually include multiple castes: workers, soldiers, scouts, queens, princesses
- **All castes can perform any task**, but with different efficiencies:
  - Workers: 100% efficiency at gathering/nursing/building, 10% at combat
  - Soldiers: 100% efficiency at combat, 10% at worker tasks
  - Scouts: High movement speed, average at all tasks
  - Queens/Princesses: Reproduction-focused, low efficiency at other tasks

**For Phase 6:**
- Only workers exist (current state)
- Specialization system applies only to workers
- Architecture should be extensible for future castes
- Traits live in a flexible structure (not hardcoded per role)

**Future Integration (Phase 7+):**
- Each caste has its own trait profile structure
- Caste-specific trait multipliers (soldiers have higher `combatEfficiency`)
- Cross-caste trait influences (experienced worker promoted to soldier retains some gathering skill)

### Performance Considerations

- **Trait evolution runs infrequently**: Every 60 frames (~1 second at 60 FPS)
- **Avoid per-frame trait queries**: Cache derived roles if needed
- **Trait objects are small**: 7-8 numeric properties per ant
- **No allocations in trait evolution loop**: Modify in-place

### Observable Outcomes

**What Players Should See:**

1. **Early game (minutes 1-5):**
   - All ants behave similarly (near-baseline traits)
   - Some slight behavioral variance (random initial traits)

2. **Mid game (minutes 5-15):**
   - Ants start specializing based on what they've been doing
   - Some ants become faster foragers (higher movement speed, carry capacity)
   - Some ants stay near colony more often (nursery workers)
   - Visible pheromone trail following diverges (some ants more sensitive)

3. **Late game (15+ minutes):**
   - Clear behavioral patterns emerge
   - Colony efficiency improves (specialized foragers gather faster)
   - Some ants rarely leave colony (dedicated nursery workers)
   - Debug overlay shows distinct trait profiles

**Success Metrics:**
- Colony gathers more food per ant over time (efficiency gain from specialization)
- Trait variance increases over time (spread from 0.9-1.1 to 0.6-1.8)
- Player can observe distinct "personalities" when watching individual ants

## Implementation Steps

### Step 1: Trait Data Structure
- [ ] Create `src/sim/traits/AntTraits.ts`
- [ ] Define `AntTraits` interface
- [ ] Add trait initialization function (near-baseline with variance)
- [ ] Add trait constants to `config.ts`

### Step 2: Integrate Traits into AntState
- [ ] Add `traits: AntTraits` property to `AntState` interface
- [ ] Update `Ant.ts` constructor to initialize traits
- [ ] Update existing ant creation code

### Step 3: Trait Evolution Logic
- [ ] Create `src/sim/traits/traitEvolution.ts`
- [ ] Implement trait increase/decay functions
- [ ] Implement trait clamping (0.5 to 2.0)
- [ ] Create `TraitEvolutionSystem.ts` in systems/

### Step 4: Behavior Integration
- [ ] Modify `antBehaviors.ts` to query `taskAffinity` when deciding actions
- [ ] Scale movement speed by `movementSpeed` trait
- [ ] Scale pheromone following by `pheromoneSensitivity` trait
- [ ] Scale carry capacity by `carryCapacity` trait
- [ ] Scale energy consumption by `energyEfficiency` trait

### Step 5: Debug Visualization
- [ ] Create `src/sim/traits/roleDerivation.ts` (derive role labels from traits)
- [ ] Add trait overlay toggle (press 'T' key)
- [ ] Tint ants based on strongest trait (optional debug mode)
- [ ] Show trait values on hover (debug UI)

### Step 6: Testing & Tuning
- [ ] Test trait drift rates (too fast = instant specialization, too slow = no effect)
- [ ] Verify trait caps work correctly
- [ ] Measure performance impact (should be negligible)
- [ ] Observe colony efficiency improvements
- [ ] Tune `TRAIT_CONFIG` constants for desired emergence speed

### Step 7: Documentation
- [ ] Update README with Phase 6 completion
- [ ] Document trait system in code comments
- [ ] Add trait visualization to debug controls section (README)
- [ ] Archive this plan file

## Open Questions

1. **Should traits be visible to player by default?**
   - Proposal: Debug mode only initially (press 'T' key)
   - Future: Optional UI panel showing ant trait distribution

2. **How fast should traits evolve?**
   - Too fast = instant specialization, feels scripted
   - Too slow = no observable effect
   - Proposal: Tune so visible specialization occurs after 5-10 minutes

3. **Should new ants spawn with colony-bias traits?**
   - Not in Phase 6 (no reproduction yet)
   - Reserve for Phase 7 (Nursery / Reproduction)

4. **Should traits influence ant lifespan or starvation rate?**
   - Not initially (keep Phase 6 focused)
   - Possible future extension (efficient ants live longer)

## Future Extensions (Post-Phase 6)

- **Trait-based lifespan**: Ants with higher `energyEfficiency` live longer
- **Cross-caste traits**: Workers promoted to soldiers retain some foraging skill
- **Experience points**: Explicit counter for task completions (feeds trait evolution)
- **Trait visualization UI**: Panel showing colony trait distribution over time
- **Trait inheritance**: New ants spawned near specialists inherit slight bias

## Non-Goals for Phase 6

- ❌ Hard-coded ant roles or classes
- ❌ Explicit caste system (reserved for later phases)
- ❌ Scripted role assignments
- ❌ Trait-based combat (soldiers don't exist yet)
- ❌ Reproduction system (Phase 7)
- ❌ Complex UI for trait management (keep it observable, not controllable)

## Success Criteria

Phase 6 is successful when:

1. Ants visibly specialize over time based on their actions
2. Colony efficiency improves naturally through specialization
3. Behavior feels organic and emergent, not scripted
4. System is debuggable (trait overlay, hover inspection)
5. No performance regression (trait evolution is lightweight)
6. Architecture is extensible for future caste systems

---

**Implementation Date:** TBD (Phase 6 in progress)
