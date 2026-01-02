# Plan: Phase 2 — Pheromone System (The Heart of the Game)

## Overview

Implement the pheromone communication system that enables emergent colony-level behavior through indirect communication. This is the foundation for trail formation, path optimization, and complex emergent patterns.

## Phase 2 Exit Criteria

- ✅ Ants form visible trails
- ✅ Trails strengthen and decay naturally
- ✅ Emergent path optimization occurs without hardcoding

## Implementation Segments

### Segment 1: Core Grid Infrastructure & Visualization ✅ **COMPLETE**

**Goal:** Establish pheromone grid and visual feedback loop

**Status:** ✅ **Complete** (Commits: e51a43b, c6c3c95)

**Completed Work:**
1. ✅ Created `PheromoneType` enum (Food, Nest, Danger)
2. ✅ Created `PheromoneGrid` class with:
   - Flat Float32Array storage (one per type)
   - `deposit(x, y, type, strength)` method
   - `sample(x, y, type)` method
   - `decay(deltaTime)` method
   - Grid bounds checking
3. ✅ Added `PHEROMONE_CONFIG` to config.ts:
   - Decay rates per type
   - Deposition strengths per state
   - Grid update interval
   - Diffusion rate
   - Max strength cap
   - Visualization colors
4. ✅ Added `pheromoneGrid` to World class
5. ✅ Created `PheromoneRenderer` with heatmap visualization:
   - Food = red gradient
   - Nest = blue gradient
   - Danger = yellow gradient
   - Toggleable overlay (press 'P' key)
6. ✅ Integrated renderer into MainScene
7. ✅ Moved decay logic to SimulationSystem.tick() (proper separation of concerns)

**Files Created/Modified:**
- ✅ New: `src/sim/PheromoneType.ts`
- ✅ New: `src/sim/PheromoneGrid.ts`
- ✅ New: `src/render/PheromoneRenderer.ts`
- ✅ Modified: `src/sim/World.ts`
- ✅ Modified: `src/config.ts`
- ✅ Modified: `src/scenes/MainScene.ts`
- ✅ Modified: `src/systems/SimulationSystem.ts`

**Test Results:**
- ✅ Can toggle pheromone overlay on/off
- ✅ Can manually deposit pheromones (temporary test code: 'T' key + mouse)
- ✅ Heatmap shows color gradients correctly
- ✅ Pheromones decay over time with configured rates

**Architecture Highlights:**
- Engine-agnostic: PheromoneGrid has no Phaser dependencies
- Performance: Float32Array storage, per-pixel resolution (786k cells/type)
- Configuration-driven: All parameters centralized in PHEROMONE_CONFIG
- Proper layering: Decay logic in SimulationSystem, not scene update

**Next:** Proceed to Segment 2 (Ant Deposition Logic)

---

### Segment 2: Ant Deposition Logic ✅ **COMPLETE**

**Goal:** Ants deposit pheromones based on their state

**Status:** ✅ **Complete** (January 2026)

**Completed Work:**
1. ✅ Added `depositPheromones()` method in `SimulationSystem`
2. ✅ Integrated pheromone deposition after ant movement
3. ✅ Implemented state-based deposition rules:
   - IDLE: No deposition (ant is resting at nest)
   - WANDERING: Nest pheromone only (breadcrumbs)
   - FORAGING: Weak Food pheromone + Nest pheromone (searching)
   - RETURNING: Strong Food pheromone + Nest pheromone (found something!)
4. ✅ Used configuration-driven deposition strengths from `PHEROMONE_CONFIG`
5. ✅ PheromoneGrid handles boundary checking automatically

**Files Modified:**
- ✅ `src/systems/SimulationSystem.ts` — Added `depositPheromones()` method

**Test Results:**
- ✅ Red (Food) trails visible behind RETURNING ants (strong, opacity ~0.6)
- ✅ Faint red traces behind FORAGING ants (weak, barely visible)
- ✅ Blue (Nest) trails from WANDERING, FORAGING, and RETURNING ants
- ✅ Trails decay naturally over time
- ✅ No performance degradation (60 FPS maintained)
- ✅ Boundary checking works correctly (no crashes at edges)

**Architecture Highlights:**
- Clean separation: deposition logic in dedicated method
- Configuration-driven: all strengths come from `PHEROMONE_CONFIG`
- State-aware: deposition responds to ant FSM state
- Proper sequencing: deposition happens after movement (correct position)

**Next:** Proceed to Segment 3 (Diffusion System)

---

### Segment 3: Diffusion System

**Goal:** Pheromones spread naturally across the grid

**Scope:**
1. Implement `PheromoneGrid.diffuse()` using 4-neighbor averaging:
   - For each cell: `newValue = (self + north + south + east + west) / 5 * diffusionRate`
   - Handle edge cells (world boundaries)
   - Use double-buffering to avoid read-write conflicts
2. Call diffusion in `SimulationSystem.tick()` every N frames (from config)
3. Tune diffusion rate for natural spread
4. Profile performance, optimize if needed

**Files:**
- ✅ Modified: `src/sim/PheromoneGrid.ts`
- ✅ Modified: `src/systems/SimulationSystem.ts`
- ✅ Modified: `src/config.ts` (diffusion rate, update interval)

**Test Criteria:**
- Pheromone trails widen naturally over time
- Strong deposits create larger "pools" of pheromone
- Diffusion feels smooth, not too fast or too slow
- No performance issues (60 FPS maintained)

**Review Point:** After this segment, pause to review and adjust plan.

---

### Segment 4: Gradient Following Behavior

**Goal:** Ants sense and follow pheromone trails

**Scope:**
1. Create `pheromoneBehaviors.ts` with:
   - `samplePheromoneGradient(ant, grid, type, sampleDistance)` — samples in 8 directions
   - `calculateGradientDirection(samples)` — finds highest concentration direction
   - `followPheromone(ant, direction, strength, config)` — adjusts target velocity
2. Add pheromone readings to `PerceptionData` interface
3. Update `perceiveEnvironment()` to include pheromone data
4. Modify FORAGING behavior to follow Food pheromone gradient
5. Blend pheromone influence with existing movement (use weighted average)
6. Add randomness factor (not purely greedy following)
7. Ensure obstacle avoidance takes priority over pheromone following

**Files:**
- ✅ New: `src/sim/behaviors/pheromoneBehaviors.ts`
- ✅ Modified: `src/sim/behaviors/PerceptionData.ts`
- ✅ Modified: `src/sim/behaviors/antBehaviors.ts`
- ✅ Modified: `src/systems/SimulationSystem.ts`
- ✅ Modified: `src/config.ts` (following strength, randomness)

**Test Criteria:**
- Ants follow trails laid by other ants
- Trails strengthen as more ants use them
- Ants still explore randomly (not 100% trail-locked)
- Obstacle avoidance still works with pheromone following
- Natural-looking path convergence emerges

**Review Point:** After this segment, pause to review and adjust plan.

---

### Segment 5: Polish & Tuning

**Goal:** Refine behavior and optimize performance

**Scope:**
1. Balance parameters:
   - Decay rates (trails shouldn't last forever or disappear instantly)
   - Diffusion rate (trails should spread but not blur too much)
   - Following strength (ants should follow but still explore)
   - Deposition rates (trails should form but not overwhelm)
2. Performance optimization:
   - Profile grid operations
   - Consider lower-resolution grid if needed
   - Optimize rendering (use Phaser RenderTexture if needed)
   - Limit diffusion to "active" regions (future optimization)
3. Visual polish:
   - Adjust heatmap colors/opacity for clarity
   - Add toggle for individual pheromone types
   - Consider adding UI indicator when overlay is active
4. Documentation:
   - Update README.md Phase 2 status
   - Add comments explaining diffusion algorithm
   - Document config parameters

**Files:**
- ✅ Modified: `src/config.ts` (final tuning)
- ✅ Modified: `src/render/PheromoneRenderer.ts` (visual polish)
- ✅ Modified: `src/scenes/MainScene.ts` (UI improvements)
- ✅ Modified: `README.md` (mark Phase 2 complete)

**Test Criteria:**
- Trails form, strengthen, and decay naturally
- Emergent path optimization is visible
- System runs at 60 FPS with 20+ ants
- Phase 2 exit criteria all achieved

**Review Point:** Final review before PR.

---

## Technical Decisions

### Grid Resolution
- **Decision:** Start with 1:1 pixel resolution (1 pheromone unit = 1 pixel)
- **Rationale:** Simplest implementation, defer optimization until needed
- **Fallback:** If performance issues, switch to cell-based grid (e.g., 4×4 pixels per cell)

### Diffusion Algorithm
- **Decision:** Simple 4-neighbor averaging
- **Rationale:** Fast, predictable, good enough for game feel
- **Fallback:** If spreading feels wrong, implement Gaussian blur

### Update Frequency
- **Decision:** Decay every frame, diffusion every 3-5 frames
- **Rationale:** Decay is cheap (multiply), diffusion is expensive (full grid pass)

### Integration with Existing Systems
- **Decision:** Pheromone following is a velocity modifier, not a replacement
- **Rationale:** Preserves obstacle avoidance, FSM, and inertia systems
- **Pattern:** `finalVelocity = baseVelocity + pheromoneInfluence + obstacleAvoidance`

---

## Risk Mitigation

**Performance Risks:**
- Monitor FPS during diffusion implementation
- Add performance config flags (disable diffusion, lower update rate)
- Profile before optimizing

**Behavior Risks:**
- Heavy use of config constants for easy tuning
- Add debug overlays early (see what ants are sensing)
- Expect multiple iteration cycles on following behavior

**Integration Risks:**
- Test each segment independently
- Ensure existing features still work (obstacle avoidance, returning home)
- Use feature flags if needed (pheromone following can be disabled via config)

---

## Estimated Timeline

- **Segment 1:** 2-3 hours (grid + visualization)
- **Segment 2:** 1 hour (deposition logic)
- **Segment 3:** 2-3 hours (diffusion implementation + tuning)
- **Segment 4:** 3-4 hours (gradient following behavior, most complex)
- **Segment 5:** 1-2 hours (polish + optimization)

**Total:** ~9-13 hours (can split across multiple sessions)

---

## Success Indicators

After Phase 2 completion, you should observe:
- Ants leaving visible trails as they explore
- Trails becoming stronger where multiple ants travel
- Ants beginning to follow established trails
- Trails fading when unused
- Emergent "highways" forming between nest and popular areas
- No hard-coded pathfinding—all emergent from pheromone gradients

---

## Next Steps After Phase 2

Phase 2 completion sets up:
- **Phase 3 (Worker Specialization):** Pheromone sensitivity trait variation
- **Phase 4 (Resources):** Food sources create strong pheromone attractors
- **Phase 7 (Colonies):** Territory pheromones for conflict

---

## Implementation Notes

*(This section is updated after each segment with observations, challenges, and solutions)*

### Segment 1 Notes: Core Grid Infrastructure & Visualization ✅

**Implementation Date:** January 2026  
**Status:** Complete

**What Went Well:**
- Float32Array storage proved efficient for 1024×768 grid (786k cells per type)
- Separation of concerns worked perfectly: PheromoneGrid is truly engine-agnostic
- Configuration-driven approach made tuning easy (decay rates, colors, max strength)
- Heatmap visualization provides clear feedback for debugging

**Technical Decisions:**
- **Grid Resolution:** Chose 1:1 pixel mapping (1 cell = 1 pixel) for MVP
  - Simple to implement and reason about
  - Performance is acceptable at 60 FPS with current ant count
  - Can be optimized later if needed (e.g., 4×4 pixel cells)
  
- **Decay Logic Placement:** Initially in MainScene.update(), moved to SimulationSystem.tick()
  - Better separation of concerns (simulation vs rendering)
  - Keeps scene focused on rendering and input
  - Follows established architecture pattern

- **Color Configuration:** Moved hardcoded colors to PHEROMONE_CONFIG
  - Easier to experiment with different visualizations
  - Consistent with project's configuration-first approach
  - MAX_STRENGTH also moved to config for same reason

**Challenges Encountered:**
- Initial confusion about where decay should run (scene vs system)
  - **Solution:** Code review feedback clarified proper layering
  - Decay is simulation logic → belongs in SimulationSystem
  
- Mouse-based pheromone deposition testing was initially complex
  - **Solution:** Added simple keyboard shortcut ('T' key) for test patterns
  - More reliable for validation than simulating mouse events

**Performance Observations:**
- Current implementation maintains 60 FPS with:
  - 20 ants
  - 3 pheromone types (2.3M grid cells total)
  - Per-frame decay on all cells
  - Real-time heatmap rendering
- No optimization needed yet, but profiling shows rendering is the bottleneck

**Code Quality:**
- TypeScript strict mode: ✅ No errors
- Code review: ✅ All feedback addressed
- Security scan: ✅ No vulnerabilities
- Architecture: ✅ Engine-agnostic simulation maintained

**Testing Approach:**
- Manual validation using visual overlay
- Test pattern deposition ('T' key) for repeatable verification
- Decay observed over 5-10 second intervals
- Toggle functionality verified (keyboard input)

**Ready for Next Segment:**
The grid infrastructure is solid and ready for ant-based deposition. All extension points are in place:
- `deposit()` method ready to be called by ants
- Decay running automatically in simulation loop
- Configuration values tuned for initial behavior
- Visualization working for debugging next segment

### Segment 2 Notes: Ant Deposition Logic ✅

**Implementation Date:** January 2026  
**Status:** Complete

**What Went Well:**
- Simple, focused implementation - single method handles all deposition logic
- State-based rules are clear and easy to understand/modify
- Configuration-driven approach continues to pay dividends (easy tuning)
- Grid boundary checking handled transparently by PheromoneGrid class
- Visual feedback works perfectly - can see trails forming in real-time with 'P' toggle

**Technical Decisions:**
- **Deposition Timing:** Placed after movement/position updates
  - Ensures pheromones deposited at ant's final position for frame
  - Avoids depositing at pre-constraint positions (outside world bounds)
  
- **Dual Deposition:** FORAGING and RETURNING deposit both Food and Nest
  - Creates richer trail networks
  - Nest pheromone provides "way home" breadcrumbs
  - Food pheromone strength varies by state (searching vs returning)

- **IDLE No Deposition:** Ants at nest don't deposit
  - Prevents pheromone buildup at colony center
  - Matches natural behavior (only moving ants leave trails)

**Deposition Strength Values (from config):**
- IDLE: 0.0 (none)
- WANDERING: 0.5 (Nest only)
- FORAGING: 0.3 (Food) + 0.5 (Nest)
- RETURNING: 1.0 (Food) + 0.5 (Nest)

**Performance Observations:**
- No measurable performance impact from deposition
- Grid.deposit() is O(1) operation (direct array access)
- 20 ants × 60 FPS = 1200 deposits/sec handled easily
- Still maintaining 60 FPS with full deposition active

**Visual Observations:**
- RETURNING ant trails are clearly visible (red, strong opacity)
- FORAGING ant trails are faint but present (helps with debugging)
- Blue nest trails form interesting patterns as ants explore
- Decay timing feels natural (trails visible for 5-10 seconds)
- Multiple ants strengthen trails (accumulation working)

**Code Quality:**
- TypeScript strict mode: ✅ No errors
- Build: ✅ Success (no warnings)
- Architecture: ✅ Clean separation maintained
- Comments: ✅ Well-documented method with clear rules

**Challenges Encountered:**
- None! Implementation was straightforward due to solid foundation from Segment 1
- Configuration made tuning trivial (no code changes needed for balance)

**Lessons Learned:**
- Configuration-first approach dramatically speeds up iteration
- Visual feedback (pheromone overlay) is essential for validation
- Simple rules create interesting emergent patterns (already seeing trail formation)

**Ready for Next Segment:**
Diffusion system is the natural next step:
- Deposition working perfectly, now trails need to spread
- Current trails are 1-pixel wide (unrealistically precise)
- Diffusion will create more natural, organic-looking trail networks
- Performance profiling may be needed (diffusion is more expensive)

### Segment 3 Notes:
- [To be filled during implementation]

### Segment 3 Notes:
- [To be filled during implementation]

### Segment 4 Notes:
- [To be filled during implementation]

### Segment 5 Notes:
- [To be filled during implementation]
