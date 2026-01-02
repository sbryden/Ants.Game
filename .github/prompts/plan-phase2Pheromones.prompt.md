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

### Segment 2: Ant Deposition Logic

**Goal:** Ants deposit pheromones based on their state

**Scope:**
1. Add pheromone deposition in `SimulationSystem.updateAntBehavior()`:
   - FORAGING state → deposit Food pheromone (low strength, searching)
   - RETURNING state → deposit Food pheromone (high strength, found food!)
   - All active states → deposit Nest pheromone (breadcrumbs)
2. Use state-specific deposition rates from config
3. Handle edge cases (ants at world boundaries)

**Files:**
- ✅ Modified: `src/systems/SimulationSystem.ts`
- ✅ Modified: `src/config.ts` (tune deposition values)

**Test Criteria:**
- See red trails behind RETURNING ants (strong)
- See faint red traces behind FORAGING ants (weak)
- See blue trails from all moving ants (Nest pheromone)
- Trails fade as decay works

**Review Point:** After this segment, pause to review and adjust plan.

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

### Segment 2 Notes:
- [To be filled during implementation]

### Segment 3 Notes:
- [To be filled during implementation]

### Segment 4 Notes:
- [To be filled during implementation]

### Segment 5 Notes:
- [To be filled during implementation]
