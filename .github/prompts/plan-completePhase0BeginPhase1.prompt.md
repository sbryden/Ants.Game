# Plan: Next 2-3 PRs — Complete Phase 0 & Begin Phase 1

## Progress Summary

**Status as of execution:**
- ✅ **PR #1 (Phase 0 Complete)** — DONE
- ✅ **PR #2 (Phase 1 Foundation)** — DONE  
- 🚧 **PR #3 (Phase 1 Completion)** — NEXT

**What's been achieved:**
- Colony nest visualization working
- Ants exhibit wandering and returning home behaviors
- 4-state FSM (IDLE, WANDERING, FORAGING, RETURNING) with probabilistic transitions
- Smooth, inertia-based movement (no instant turns)
- State-based color visualization
- Live debug UI showing state distribution

**What's remaining:**
- Obstacle system and avoidance
- Perception system foundation
- Probabilistic decision-making enhancements
- Phase 1 completion and polish

---

## Context

The roadmap shows Phase 0 (Foundation) as "mostly complete," but the colony structure and basic behaviors are incomplete per the MVP checklist. Phase 1 (Core Ant Behavior) hasn't started yet. The next 2-3 PRs should finish Phase 0, then build Phase 1's FSM and movement systems.

## Current State

**Phase 0 Foundation (85% complete):**
- ✅ Phaser + TypeScript scaffold
- ✅ Deterministic update loop
- ✅ Basic world bounds
- ✅ Ant data model with simple movement
- ✅ Procedural rendering
- ✅ Simulation-first architecture
- ❌ Colony structure (minimal - no resources, no nest visualization)
- ❌ Basic behaviors (only random wandering, no "returning to colony")

**Phase 1 Core Ant Behavior (0% started):**
- ❌ Ant FSM (only 2 placeholder states: IDLE, MOVING)
- ❌ Directional movement with inertia
- ❌ Simple obstacle avoidance
- ❌ Randomized but bounded decision-making
- ❌ Debug visualization of ant state

## Proposed PRs

### PR #1: Complete Phase 0 MVP — Colony Home Behavior ✅ COMPLETED

**Goal:** Finish the incomplete Phase 0 items before moving to Phase 1

**Status:** ✅ **Implemented and tested**

**Scope:**
1. **Colony nest visualization**
   - Add visual indicator for colony location in `AntRenderer.ts` or create `ColonyRenderer.ts`
   - Draw circle/marker at colony center position
   - Use distinct color to differentiate from ants

2. **"Returning to colony" behavior**
   - Add `RETURNING` or `HOME_POSITION` state to `AntState.ts`
   - Implement `moveTowardsPoint(ant, target, speed)` in `antBehaviors.ts`
   - Add "near home" detection (distance threshold)
   - Ants periodically transition from MOVING → RETURNING → IDLE (at home)

3. **Basic colony-level state**
   - Add `resourceCount: number` to `Colony.ts` (unused initially, but structure ready)
   - Add `getAntCount()` convenience method
   - Set up foundation for Phase 4 resource system

**Deliverables:**
- ✅ Visible nest location on map (ColonyRenderer created)
- ✅ Ants exhibit both "wandering" and "returning home" patterns
- ✅ Colony class ready for resource system (resourceCount, getAntCount added)
- ✅ Clean handoff to Phase 1

**Implementation Notes:**
- Added `RETURNING` state to AntState enum
- Implemented `moveTowardsPoint()` and `isNearPoint()` helper functions
- Updated SimulationSystem with state-based behavior logic
- Created ColonyRenderer for nest visualization (semi-transparent circle with border)
- Ants return home probabilistically after ~10 seconds of wandering
- Nest rendered as 20px radius circle at colony center

**Files Modified:**
- ✅ `src/sim/AntState.ts` - Added RETURNING state
- ✅ `src/sim/Colony.ts` - Added resourceCount and getAntCount()
- ✅ `src/sim/behaviors/antBehaviors.ts` - Added moveTowardsPoint, isNearPoint
- ✅ `src/render/ColonyRenderer.ts` - New file for nest rendering
- ✅ `src/systems/SimulationSystem.ts` - State-based behavior logic
- ✅ `src/scenes/MainScene.ts` - Integrated ColonyRenderer

**Estimated Scope:** Small (~1-2 days)

---

### PR #2: Phase 1 Foundation — FSM & Smooth Movement ✅ COMPLETED

**Goal:** Implement proper state machine and improve movement system

**Status:** ✅ **Implemented and tested**

**Scope:**
1. **Expand AntState enum**
   - Uncomment/add: `WANDERING`, `FORAGING`, `RETURNING`
   - Keep others commented for later phases (`FOLLOWING_TRAIL`, `FIGHTING`, `BUILDING`)

2. **Create FSM infrastructure**
   - Add `BehaviorStateMachine` class or module in `src/sim/behaviors/`
   - Define state transition rules with probabilities
   - Add `changeState(ant, newState)` function with transition logic
   - Add state-specific timers/counters to `Ant` class
   - Example transitions:
     - IDLE → WANDERING (high probability after timeout)
     - WANDERING → RETURNING (moderate probability after time)
     - RETURNING → IDLE (when near home)

3. **Implement directional movement with inertia**
   - Add `targetVx: number`, `targetVy: number` to `Ant` (desired velocity)
   - Create `applyInertia(ant, turnSpeed)` function (smooth interpolation)
   - Adjust movement config (turning speed, max angular velocity)
   - Replace instant direction changes with gradual turns
   - Ants now "turn" toward new directions rather than snapping

4. **State-specific behaviors**
   - IDLE: Minimal movement, occasionally transition to WANDERING
   - WANDERING: Random exploration with direction changes
   - RETURNING: Move toward colony center, transition to IDLE when close

5. **Debug visualization**
   - Color-code ants by state in `AntRenderer.ts`
     - IDLE: gray
     - WANDERING: brown
     - RETURNING: blue
     - FORAGING: green (for future)
   - Add optional state label overlay (togglable)
   - Display state distribution UI in `MainScene.ts`
     - Example: "Wandering: 12, Returning: 8, Idle: 3"

**Deliverables:**
- ✅ Working FSM with 4 states (IDLE, WANDERING, FORAGING, RETURNING) and transitions
- ✅ Smooth, realistic ant movement (no instant 180° turns)
- ✅ State colors make ant behavior observable
- ✅ Debug UI shows state distribution

**Implementation Notes:**
- Expanded AntState enum with WANDERING and FORAGING states
- Added targetVx/Vy for desired velocity and timeInCurrentState timer to Ant
- Created BehaviorStateMachine module with probabilistic state transitions
- Implemented applyInertia() for smooth turning (lerp-based velocity interpolation)
- Updated SimulationSystem with switch-based state behaviors
- Added state-based coloring in AntRenderer (gray/brown/green/blue)
- Added debug UI showing live state distribution counts
- Tuned turnSpeed to 0.3 for realistic ant movement

**Files Modified:**
- ✅ `src/sim/Ant.ts` - Added targetVx/Vy, timeInCurrentState
- ✅ `src/sim/AntState.ts` - Added WANDERING, FORAGING states
- ✅ `src/sim/behaviors/antBehaviors.ts` - Added applyInertia, updated wander/move
- ✅ `src/sim/behaviors/BehaviorStateMachine.ts` - New FSM module
- ✅ `src/render/AntRenderer.ts` - State-based colors
- ✅ `src/scenes/MainScene.ts` - Debug UI with state counts
- ✅ `src/systems/SimulationSystem.ts` - FSM integration, state behaviors

**Estimated Scope:** Medium (~3-5 days)

---

## Review After PR #2 Completion

### What Worked Well
1. **Clean separation maintained** — Simulation logic stayed engine-agnostic
2. **FSM is elegant** — Probabilistic transitions feel organic
3. **Inertia adds realism** — Smooth turning makes ants feel alive
4. **Debug UI is invaluable** — Can immediately see state distribution
5. **No major refactoring needed** — Architecture held up well

### Observations
1. **Turn speed tuning is critical** — 0.3 seems good, but may need adjustment after obstacles
2. **State transitions work well** — Ants exhibit varied, natural-looking behavior
3. **Color coding works** — Easy to see what ants are doing at a glance
4. **Performance is solid** — 20 ants run smoothly, ready for more

### Considerations for PR #3

**Should we proceed now or pause?**

**Arguments for continuing PR #3:**
- Momentum is strong, architecture is solid
- No blockers or technical debt discovered
- Clear path forward for obstacle system
- Would complete Phase 1 in one session

**Arguments for pausing:**
- PR #3 is larger scope (5-7 days estimated vs 1-2 and 3-5 already done)
- Good checkpoint: Phase 0 complete + Phase 1 foundation done
- Could benefit from user testing/feedback on current behavior
- Time to evaluate if Phase 1's exit criteria are being met

**Recommendation:** Continue with PR #3 if time allows (estimated 1-2 hours for streamlined implementation). The foundation is solid and completing Phase 1 would be a major milestone.

---

### PR #3: Phase 1 Completion — Obstacles & Perception

**Goal:** Add environmental awareness and smarter decision-making

**Scope:**
1. **Simple obstacle system**
   - Add `Obstacle` class in `src/sim/` (circle or rectangle)
   - Store obstacles array in `World`
   - Add `getObstaclesNear(position, radius)` query method
   - Place 3-5 test obstacles in `MainScene.ts`
   - Render obstacles in new `ObstacleRenderer.ts` or extend scene

2. **Obstacle avoidance behavior**
   - Add `detectObstacles(ant, world, range)` function
   - Implement steering behavior: adjust `targetVx/Vy` to avoid collision
   - Apply avoidance in `updateAntBehavior()` before movement
   - Handle edge cases:
     - Ants trapped between obstacles
     - Multiple simultaneous obstacles
   - Use simple ray-cast or proximity check (performance-conscious)

3. **Probabilistic decision-making**
   - Replace deterministic timers with probability-based transitions
   - Add randomness bounds (min/max time in state)
   - Make transition probabilities configurable
   - Example: 5% chance per second to change state, evaluated each tick
   - Add config object for tuning behavior

4. **Ant perception system foundation**
   - Add `perceptionRange: number` property to `Ant`
   - Create `PerceptionData` interface for sensory info:
     - Nearby obstacles
     - Distance to home
     - (Future: pheromone levels, food sources, other ants)
   - Implement `perceiveEnvironment(ant, world)` function
   - Use perception data to influence state transition probabilities
   - Example: Ants near home more likely to return

5. **Phase 1 polish & completion**
   - Tune movement parameters for natural feel
   - Balance state transition rates
   - Ensure ants "feel alive" per roadmap exit criteria
   - Update `README.md`:
     - Mark Phase 0 as complete
     - Mark Phase 1 as complete
     - Update roadmap status

**Deliverables:**
- Ants navigate around obstacles naturally
- Decision-making feels organic, not robotic
- Perception system ready for Phase 2-3 (traits, pheromones)
- Phase 1 fully complete per roadmap

**Estimated Scope:** Larger (~5-7 days)

**Files Modified:**
- `src/sim/Obstacle.ts` (new file)
- `src/sim/World.ts` (obstacle storage, queries)
- `src/sim/Ant.ts` (perceptionRange)
- `src/sim/behaviors/antBehaviors.ts` (avoidance, perception, probabilistic logic)
- `src/sim/behaviors/PerceptionData.ts` (new interface file)
- `src/render/ObstacleRenderer.ts` (new file or extend AntRenderer)
- `src/scenes/MainScene.ts` (spawn obstacles)
- `README.md` (update status)

---

## Further Considerations

### 1. Should PR #2 be split?

**Question:** FSM infrastructure and inertia movement are both substantial changes. Should this be broken into:
- **PR #2a:** FSM only (states, transitions, state-specific behaviors)
- **PR #2b:** Movement system (inertia, smooth turning, debug viz)

**Pros of splitting:**
- Smaller, more focused reviews
- Can test FSM independently before movement changes
- Reduces risk of complex bugs

**Cons of splitting:**
- More overhead (2 PRs instead of 1)
- FSM less impressive without smooth movement
- Slightly longer total time

**Recommendation:** Keep as one PR unless it grows beyond ~500 lines of changes. The FSM and movement systems are tightly coupled conceptually.

---

### 2. Testing strategy?

**Question:** The FSM and movement systems are pure functions—perfect candidates for unit tests. Should tests be added in PR #2, or addressed separately after Phase 1 is complete?

**Options:**
- **Add tests in PR #2/PR #3:** Tests alongside implementation
- **Separate PR #4:** Comprehensive test suite after Phase 1 complete
- **Deferred:** Add tests later when system stabilizes (Phase 8)

**Considerations:**
- No test infrastructure exists yet (need to add Vitest or similar)
- FSM logic is complex enough to warrant tests
- Roadmap doesn't explicitly call for tests until Phase 8
- Tests would slow initial development velocity

**Recommendation:** Add basic tests in PR #2 for FSM transition logic. This is the most complex part and would benefit most from test coverage. Add Vitest as dev dependency.

**Example tests:**
```typescript
describe('BehaviorStateMachine', () => {
  it('transitions from IDLE to WANDERING after timeout', () => {
    // Test transition logic
  });
  
  it('transitions from WANDERING to RETURNING with probability', () => {
    // Test probabilistic transitions
  });
});
```

---

### 3. Obstacle placement approach?

**Question:** PR #3 needs obstacles for testing avoidance. How should they be placed?

**Options:**
1. **Hardcoded in MainScene:** Manually place 3-5 obstacles at specific coordinates
2. **Random generation:** Generate obstacles procedurally on scene start
3. **Simple level format:** JSON or similar for obstacle layouts

**Considerations:**
- Need to test specific scenarios (narrow passages, corners, etc.)
- Random generation might create untestable layouts
- Level format is overkill for Phase 1

**Recommendation:** Start with hardcoded placement in `MainScene.ts` for PR #3. This allows testing specific patterns. Add a comment noting that Phase 6 (World Depth) will introduce proper terrain/level systems.

**Example placement:**
```typescript
// Test obstacles - manually placed for specific scenarios
world.addObstacle(new Obstacle(400, 300, 50)); // Center
world.addObstacle(new Obstacle(200, 200, 30)); // Upper left
world.addObstacle(new Obstacle(600, 500, 40)); // Lower right
world.addObstacle(new Obstacle(400, 100, 20)); // Narrow passage test
```

---

## Alternative: Smaller PR Structure

If the above PRs feel too large, consider this alternate breakdown:

### Option A: Split PR #2
- **PR #1:** Complete Phase 0 (as described)
- **PR #2a:** FSM infrastructure + state expansion
- **PR #2b:** Directional movement with inertia
- **PR #2c:** Debug visualization
- **PR #3:** Obstacles + perception (as described)

### Option B: More granular Phase 1
- **PR #1:** Complete Phase 0 (as described)
- **PR #2:** FSM with 3 states working
- **PR #3:** Inertia + smooth movement
- **PR #4:** Obstacle avoidance
- **PR #5:** Perception + probabilistic decisions

**Recommendation:** Stick with the 3-PR plan unless feedback indicates changes are too large. The current structure aligns well with roadmap phases and maintains clear deliverables.

---

## Success Criteria

### After PR #1 (Phase 0 Complete):
- ✅ Nest is visible on map
- ✅ Ants return home periodically
- ✅ Colony class has resource structure
- ✅ README Phase 0 marked complete

### After PR #2 (Phase 1 Foundation):
- ✅ 3-4 states in FSM with working transitions
- ✅ Ants turn smoothly, not instantly
- ✅ State colors make ant behavior observable
- ✅ Debug UI shows state distribution

### After PR #3 (Phase 1 Complete):
- ✅ Ants avoid obstacles naturally
- ✅ Decision-making uses probabilistic transitions
- ✅ Perception system exists and influences behavior
- ✅ Phase 1 exit criteria met per roadmap:
  - Individual ants feel "alive" ✅
  - States are easy to inspect and reason about ✅
  - No pheromones yet — behavior is still local ✅

---

## Next Steps After This Plan

1. **Review and refine this plan** — Adjust scope, split PRs, or add considerations
2. **Create GitHub issues** — One issue per PR with detailed task lists
3. **Begin PR #1 implementation** — Start with colony nest visualization
4. **After each PR, review remaining plan** — Adjust based on what was learned

---

## Dependencies & Risk Factors

**Technical considerations:**
- No spatial partitioning yet (will need for ant-ant interactions in future)
- No performance profiling infrastructure (needed before Phase 8)
- World bounds are hardcoded to scene size (might want configurable maps)

**Architecture readiness:**
- ✅ Clean separation already exists — easy to extend
- ✅ Extension points well-documented
- ✅ Behavior system is pure functions — testable
- ✅ No refactoring needed before Phase 1 work

**Risks:**
- ⚠️ Inertia system could make ants feel sluggish if not tuned well
  - Mitigation: Make turn speed configurable, iterate on values
- ⚠️ Obstacle avoidance might need multiple iterations to feel natural
  - Mitigation: Start simple (single ray-cast), refine in follow-up
- ⚠️ FSM complexity could grow quickly
  - Mitigation: Keep to 3-4 states for Phase 1, resist scope creep

**Time estimates:**
- PR #1: 1-2 days
- PR #2: 3-5 days (add 1-2 days if adding tests)
- PR #3: 5-7 days
- **Total: ~2-3 weeks for Phase 0 complete + Phase 1 complete**
