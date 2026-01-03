# Plan: Phase 4 — Health & Eating

## Overview

Implement ant consumption and colony starvation mechanics. Ants will consume food to survive and maintain energy. The colony will fail if food consumption exceeds gathering. This creates **meaningful resource scarcity** and makes foraging strategically important—not just mechanically, but for **survival**.

Phase 4 transforms the food system from "collection mechanics" to "economic simulation" where ants must work to eat, and the player observes whether the colony thrives or starves.

## Phase 4 Exit Criteria

- ✅ Individual ants have a health/energy property (0-100)
- ✅ Ants consume food per-second based on activity (idle/moving/foraging)
- ✅ Food consumed by ants is deducted from colony storage
- ✅ Starvation causes ants to slow down and become lethargic
- ✅ Starving ants transition to reduced-movement states
- ✅ Colony tracks resource balance (food in - food eaten = surplus/deficit)
- ✅ UI shows colony metrics: food stored, consumption rate, surplus/deficit
- ✅ Survival becomes a primary objective (colony dies if food depleted)
- ✅ System runs at 60 FPS with consumption mechanics active

**Status: ✅ COMPLETE**

## Design Decisions

### Ant Energy Model

**Energy as Health:**
- Each ant has `energy: number` (0-100)
- Energy = how well-fed and active the ant is
- 100 = fully energized, 0 = starving (lethal)
- Energy decays per-frame based on activity level

**Activity-Based Consumption:**
- IDLE: 0.5 energy/sec (minimal overhead)
- WANDERING: 1.0 energy/sec (movement costs energy)
- FORAGING: 1.5 energy/sec (active searching + movement)
- RETURNING: 1.0 energy/sec (moving back home with cargo)

**Energy Recovery:**
- Ants only recover energy by eating food
- Eating happens when at colony with food available
- RETURNING ants at home automatically eat (0.5 sec per unit of food)
- Energy recovery: +20 per second while eating

**Starvation Behavior:**
- Energy 80-100: Normal movement and speed
- Energy 50-80: Slightly reduced movement speed (-10%)
- Energy 25-50: Noticeably slow (-30%), more likely to return home
- Energy 0-25: Lethal starvation state
  - Movement heavily reduced (-70%)
  - AI favors returning home to eat
  - If dies: ant is removed from simulation

### Colony Resource Balance

**Tracking System:**
- `colony.foodStored` — Current food in storage (from ant deposits)
- `colony.foodConsumed` — Total consumed this second
- `colony.foodGathered` — Total harvested this second
- `colony.surplus` — Gathered - consumed (positive = growth, negative = decline)

**Balance Mechanics:**
- Every frame: calculate total ant consumption
- Deduct consumption from `foodStored`
- Track balance over time (moving average for metrics)
- If `foodStored` drops to 0: ants begin starving (no recovery possible)

**Colony Survival:**
- Colony "healthy" if `surplus > 0` (gathering more than consuming)
- Colony "struggling" if `foodStored` below safety threshold (20% of population)
- Colony "critical" if foodStored exhausted (ants starving)
- Colony "dead" if all ants starve or player abandons

### Feeding Mechanics

**At-Home Eating:**
- When ant reaches IDLE at colony, it's near food storage
- If colony.foodStored > 0:
  - Ant "eats" automatically (simple mechanic, no animation yet)
  - Consumes 0.2 units of food per second
  - Energy recovers +20 per second
  - Stops when energy reaches 100 or food runs out
  - Transition: IDLE → satisfied (ready to wander again)

**Hunger-Driven Behavior:**
- Ants with low energy (< 50) increase probability of RETURNING
- State transition: WANDERING → RETURNING if energy low
- Prevents ants from starving far from home
- Creates "hunger-driven recruitment" back to nest

### Integration with Pheromones

**No Change to Pheromone System:**
- Pheromone deposition remains unchanged (Phase 2 logic)
- Food and nest pheromones work as before
- Starving ants still deposit pheromones (behavior doesn't change, just slower)

**Future Enhancement (Phase 6+):**
- Stressed ants might deposit "alarm" pheromones
- Hunger pheromones could recruit ants to forage more
- For Phase 4, keep it simple: just slow down, no new pheromone types

### UI & Metrics

**Debug Display (Live Update):**
- Ants count by energy level:
  - Well-fed (80-100): green count
  - Normal (50-80): yellow count
  - Hungry (25-50): orange count
  - Starving (0-25): red count
- Colony metrics:
  - Food stored: X units
  - Consumption rate: Y units/sec
  - Gathering rate: Z units/sec
  - Surplus/Deficit: ±W units/sec
  - Population: N ants alive

**Optional Indicator (Phase 4.5):**
- Ant color shift based on hunger (more saturated = well-fed, dull/gray = starving)
- Visual feedback without UI text

---

## Implementation Plan

### Segment 1: Ant Energy Property & Data Structure

**Goal:** Add energy tracking to individual ants, basic decay per frame.

**Status: ✅ COMPLETE**

#### Modified Files
- `src/sim/Ant.ts` — ✅ Added energy property and lastEnergyConsumption tracking
- `src/config.ts` — ✅ Added ENERGY_CONFIG with consumption rates and thresholds

#### Exit Criteria
- ✅ Ant.energy property added, initialized to 100
- ✅ ENERGY_CONFIG created with consumption rates
- ✅ No behavioral changes yet, just data structure
- ✅ TypeScript compiles without errors

---

### Segment 2: Energy Consumption Per Frame

**Goal:** Ants consume energy based on their state, deduct from pool.

**Status: ✅ COMPLETE**

#### Modified Files
- `src/systems/SimulationSystem.ts` — ✅ Added energy decay in tick()
- `src/sim/Ant.ts` — ✅ Energy properties integrated

#### Exit Criteria
- ✅ Ants lose energy each frame based on state
- ✅ Starving ants move slower visibly
- ✅ Energy never goes below 0
- ✅ Consumption tracked for metrics
- ✅ 60 FPS maintained

---

### Segment 3: Food-to-Energy Conversion & Eating

**Goal:** Ants eat food at colony, convert food into energy recovery.

**Status: ✅ COMPLETE**

#### Modified Files
- `src/systems/SimulationSystem.ts` — ✅ Added eating logic in IDLE state
- `src/sim/World.ts` — ✅ Added removeAnt() method for death handling
- `src/sim/Colony.ts` — ✅ Refactored to use foodStored and per-frame metrics

#### Exit Criteria
- ✅ Ants eat food at colony when hungry
- ✅ Energy recovers while eating
- ✅ Colony food decreases as ants eat
- ✅ Eating stops when energy full or food runs out
- ✅ Colony tracks consumption metrics

---

### Segment 4: Hunger-Driven State Transitions

**Goal:** Starving ants prioritize returning home to eat.

**Status: ✅ COMPLETE**

#### Modified Files
- `src/sim/behaviors/BehaviorStateMachine.ts` — ✅ Modified transition probabilities
- `src/systems/SimulationSystem.ts` — ✅ Integrated hunger-based logic

#### Exit Criteria
- ✅ Hungry ants return home more frequently
- ✅ Starving ants deprioritize foraging
- ✅ Behavior feels organic, not hard-coded
- ✅ Transitions smooth, no jank

---

### Segment 5: Colony Survival & UI Metrics

**Goal:** Track colony health, display metrics, define failure conditions.

**Status: ✅ COMPLETE**

#### Modified Files
- `src/sim/Colony.ts` — ✅ Added health tracking and metrics
- `src/scenes/MainScene.ts` — ✅ Display colony metrics in debug UI
- `src/config.ts` — ✅ Added COLONY_CONFIG metrics settings

#### Exit Criteria
- ✅ Colony health status tracked and displayed
- ✅ Metrics shown in UI (food, rates, surplus)
- ✅ Player can observe resource balance
- ✅ Colony failure conditions clear

---

### Segment 6: Integration & Starvation Death

**Goal:** Complete starvation mechanic—ants die if energy reaches 0 for too long.

**Status: ✅ COMPLETE**

#### Modified Files
- `src/systems/SimulationSystem.ts` — ✅ Remove dead ants
- `src/sim/World.ts` — ✅ Ant removal logic
- `src/render/AntRenderer.ts` — ✅ Already handles filtering from getAllAnts()

#### Exit Criteria
- ✅ Starving ants die when energy reaches 0
- ✅ Dead ants removed from world
- ✅ Colony population decreases visibly
- ✅ Metrics update to reflect population loss
- ✅ Game handles extinction gracefully

#### Tasks

1. **Extend Ant class**
   ```typescript
   export class Ant {
     // Existing properties...
     
     public energy: number = 100; // 0-100, starts at full
     public lastEnergyConsumption: number = 0; // For metrics tracking
   }
   ```

2. **Energy Configuration**
   ```typescript
   export const ENERGY_CONFIG = {
     /**
      * Maximum energy an ant can have
      */
     MAX_ENERGY: 100,

     /**
      * Consumption rates (energy per second) by activity state
      */
     CONSUMPTION_RATES: {
       IDLE: 0.5,
       WANDERING: 1.0,
       FORAGING: 1.5,
       RETURNING: 1.0,
     },

     /**
      * Starvation threshold below which ant begins to suffer
      */
     STARVATION_THRESHOLD: 25,

     /**
      * Energy recovered per second while eating
      */
     EATING_RECOVERY_RATE: 20,

     /**
      * Food units consumed per second while eating
      */
     FOOD_CONSUMPTION_RATE: 0.2,

     /**
      * Movement speed multipliers by energy level
      */
     SPEED_MULTIPLIERS: {
       WELL_FED: 1.0,      // 80-100
       NORMAL: 0.95,       // 50-80
       HUNGRY: 0.7,        // 25-50
       STARVING: 0.3,      // 0-25
     },

     /**
      * Energy threshold for "hungry" state (may trigger return home)
      */
     HUNGER_THRESHOLD: 50,
   } as const;
   ```

#### Exit Criteria
- ✅ Ant.energy property added, initialized to 100
- ✅ ENERGY_CONFIG created with consumption rates
- ✅ No behavioral changes yet, just data structure
- ✅ TypeScript compiles without errors

---

### Segment 2: Energy Consumption Per Frame

**Goal:** Ants consume energy based on their state, deduct from pool.

#### Modified Files
- `src/systems/SimulationSystem.ts` — Add energy decay in tick()
- `src/sim/Ant.ts` — Calculate consumption rate helper

#### Tasks

1. **Add Consumption Calculation**
   ```typescript
   // In SimulationSystem.tick(), after state behaviors but before pheromone deposition
   
   for (const ant of ants) {
     // Calculate consumption rate based on current state
     const rate = ENERGY_CONFIG.CONSUMPTION_RATES[ant.state] ?? 0;
     const consumption = rate * deltaTime;
     
     // Decay energy
     ant.energy = Math.max(0, ant.energy - consumption);
     ant.lastEnergyConsumption = consumption;
     
     // Starvation check: if starving, slow down
     if (ant.energy < ENERGY_CONFIG.STARVATION_THRESHOLD) {
       applyStarvationSlowdown(ant, ant.energy);
     }
   }
   ```

2. **Starvation Slowdown Function**
   ```typescript
   function applyStarvationSlowdown(ant: Ant, energy: number): void {
     const energyPercent = energy / ENERGY_CONFIG.MAX_ENERGY;
     
     // Scale movement based on energy
     if (energyPercent > 0.8) {
       multiplier = 1.0; // Well-fed
     } else if (energyPercent > 0.5) {
       multiplier = 0.95; // Slightly hungry
     } else if (energyPercent > 0.25) {
       multiplier = 0.7; // Very hungry
     } else {
       multiplier = 0.3; // Starving
     }
     
     // Apply multiplier to velocity
     ant.targetVx *= multiplier;
     ant.targetVy *= multiplier;
   }
   ```

3. **Ant State-Based Consumption**
   - Create a helper: `getConsumptionRate(state: AntState): number`
   - Return from ENERGY_CONFIG.CONSUMPTION_RATES
   - Allow for future per-ant trait variations (Phase 6)

#### Exit Criteria
- ✅ Ants lose energy each frame based on state
- ✅ Starving ants move slower visibly
- ✅ Energy never goes below 0
- ✅ Consumption tracked for metrics
- ✅ 60 FPS maintained

---

### Segment 3: Food-to-Energy Conversion & Eating

**Goal:** Ants eat food at colony, convert food into energy recovery.

#### Modified Files
- `src/systems/SimulationSystem.ts` — Add eating logic in IDLE state
- `src/sim/World.ts` — Track food consumed from storage
- `src/sim/Colony.ts` — Record eating/consumption metrics

#### Tasks

1. **Eating Logic in IDLE State**
   ```typescript
   case AntState.IDLE:
     // Check if ant is at colony and hungry
     if (ant.energy < ENERGY_CONFIG.MAX_ENERGY && colony.foodStored > 0) {
       // Eat for this frame
       const foodAvailable = colony.foodStored;
       const foodNeeded = 
         (ENERGY_CONFIG.MAX_ENERGY - ant.energy) / ENERGY_CONFIG.EATING_RECOVERY_RATE;
       const foodToEat = Math.min(
         ENERGY_CONFIG.FOOD_CONSUMPTION_RATE * deltaTime,
         foodAvailable,
         foodNeeded
       );
       
       // Transfer food from colony to ant energy
       colony.foodStored -= foodToEat;
       ant.energy += foodToEat * ENERGY_CONFIG.EATING_RECOVERY_RATE;
       
       // Track consumption
       colony.foodConsumed += foodToEat;
     }
     break;
   ```

2. **Colony Consumption Tracking**
   ```typescript
   export class Colony {
     // Existing properties...
     
     public foodConsumed: number = 0; // Total consumed this session
     public foodGathered: number = 0; // Total gathered this session
     
     // Calculated properties (for UI):
     public getConsumptionRate(): number { ... }
     public getGatheringRate(): number { ... }
     public getSurplus(): number { ... }
   }
   ```

3. **Daily/Session Metrics**
   - Track consumption and gathering per second (rolling average)
   - Update every frame for smooth UI display
   - Reset metrics on colony restart

#### Exit Criteria
- ✅ Ants eat food at colony when hungry
- ✅ Energy recovers while eating
- ✅ Colony food decreases as ants eat
- ✅ Eating stops when energy full or food runs out
- ✅ Colony tracks consumption metrics

---

### Segment 4: Hunger-Driven State Transitions

**Goal:** Starving ants prioritize returning home to eat.

#### Modified Files
- `src/sim/behaviors/BehaviorStateMachine.ts` — Modify transition probabilities
- `src/systems/SimulationSystem.ts` — Add hunger-based priority logic

#### Tasks

1. **Modify State Transitions**
   ```typescript
   export function evaluateStateTransition(
     ant: Ant,
     deltaTime: number,
     config: StateTransitionConfig
   ): AntState {
     // ... existing logic ...
     
     case AntState.WANDERING:
       // If hungry, prioritize returning home
       if (ant.energy < ENERGY_CONFIG.HUNGER_THRESHOLD) {
         if (Math.random() < 0.5 * deltaTime) {
           return AntState.RETURNING;
         }
       }
       
       // Normal transitions (foraging, etc.)
       if (timeInState >= config.wanderingMinDuration) {
         // ... existing logic ...
       }
       break;
     
     case AntState.FORAGING:
       // Hungry foragers are more likely to give up and go home
       if (ant.energy < ENERGY_CONFIG.HUNGER_THRESHOLD) {
         if (Math.random() < config.foragingToReturningChance * 2 * deltaTime) {
           return AntState.RETURNING;
         }
       }
       // ... existing logic ...
       break;
   }
   ```

2. **Optional: Hunger Pheromone Signal**
   - For Phase 4, skip this
   - Note for Phase 6: Could add alarm pheromones if multiple ants starving
   - Keep Phase 4 focused on individual behavior

#### Exit Criteria
- ✅ Hungry ants return home more frequently
- ✅ Starving ants deprioritize foraging
- ✅ Behavior feels organic, not hard-coded
- ✅ Transitions smooth, no jank

---

### Segment 5: Colony Survival & UI Metrics

**Goal:** Track colony health, display metrics, define failure conditions.

#### Modified Files
- `src/sim/Colony.ts` — Add health tracking and metrics
- `src/scenes/MainScene.ts` — Display colony metrics in debug UI
- `src/render/AntRenderer.ts` — Optional: tint ants by hunger level

#### Tasks

1. **Colony Health Tracking**
   ```typescript
   export class Colony {
     // Existing properties...
     
     // Computed metrics
     public getHealthStatus(): 'healthy' | 'struggling' | 'critical' | 'dead' {
       if (this.getPopulation() === 0) return 'dead';
       
       const foodThreshold = this.getPopulation() * 0.2;
       if (this.foodStored === 0) return 'critical';
       if (this.foodStored < foodThreshold) return 'struggling';
       return 'healthy';
     }
     
     public getPopulation(): number {
       // Count living ants
       return this.ants.length;
     }
     
     public getAverageEnergy(): number {
       // Average energy across all ants
       if (ants.length === 0) return 0;
       return ants.reduce((sum, a) => sum + a.energy, 0) / ants.length;
     }
   }
   ```

2. **Metrics Display (MainScene)**
   ```typescript
   // In update(), after debug UI section:
   
   const colony = this.world.getColonies()[0]; // First colony
   const healthStatus = colony.getHealthStatus();
   const surplus = colony.getSurplus();
   const surplusStr = surplus > 0 ? `+${surplus.toFixed(2)}` : `${surplus.toFixed(2)}`;
   
   const metricsText = `
     Food: ${colony.foodStored.toFixed(1)} | 
     Rate: ${colony.getConsumptionRate().toFixed(2)}/s | 
     Gathered: ${colony.getGatheringRate().toFixed(2)}/s | 
     Surplus: ${surplusStr}/s | 
     Status: ${healthStatus}
   `;
   
   this.metricsText.setText(metricsText);
   ```

3. **Optional: Ant Hunger Coloring**
   ```typescript
   // In AntRenderer.render():
   
   if (ant.energy > 80) {
     // Well-fed: saturated color
     color = 0x00ff00; // Bright green
   } else if (ant.energy > 50) {
     // Normal: slightly duller
     color = 0x00dd00;
   } else if (ant.energy > 25) {
     // Hungry: orange
     color = 0xff8800;
   } else {
     // Starving: dark red
     color = 0x880000;
   }
   ```

#### Exit Criteria
- ✅ Colony health status tracked and displayed
- ✅ Metrics shown in UI (food, rates, surplus)
- ✅ Player can observe resource balance
- ✅ Colony failure conditions clear
- ✅ Ant color optionally indicates hunger (or skip for Phase 4)

---

### Segment 6: Integration & Starvation Death

**Goal:** Complete starvation mechanic—ants die if energy reaches 0 for too long.

#### Modified Files
- `src/systems/SimulationSystem.ts` — Remove dead ants
- `src/sim/World.ts` — Ant removal logic
- `src/render/AntRenderer.ts` — Stop rendering dead ants

#### Tasks

1. **Ant Death Logic**
   ```typescript
   // In SimulationSystem.tick(), after energy consumption:
   
   for (const ant of ants) {
     if (ant.energy === 0) {
       // Ant is dead from starvation
       this.world.removeAnt(ant);
     }
   }
   ```

2. **World Ant Removal**
   ```typescript
   export class World {
     public removeAnt(ant: Ant): void {
       const colony = this.getColony(ant.colonyId);
       if (colony) {
         const idx = colony.ants.indexOf(ant);
         if (idx !== -1) {
           colony.ants.splice(idx, 1);
         }
       }
       this.antsCacheDirty = true;
     }
   }
   ```

3. **Rendering Integration**
   - AntRenderer already filters from `world.getAllAnts()`
   - No changes needed—dead ants won't be in list

4. **Optional: End-Game Condition**
   - If all ants die: pause simulation
   - Show "Colony Extinct" message
   - Allow restart or continue watching decay

#### Exit Criteria
- ✅ Starving ants die when energy reaches 0
- ✅ Dead ants removed from world
- ✅ Colony population decreases visually
- ✅ Metrics update to reflect population loss
- ✅ Game handles extinction gracefully

---

## Testing & Validation

### Manual Testing Checklist

1. **Energy Consumption**
   - [ ] Ants lose energy based on state (idle slowest, foraging fastest)
   - [ ] Energy never goes below 0
   - [ ] Starving ants move noticeably slower

2. **Eating Mechanics**
   - [ ] Ants at colony eat when hungry
   - [ ] Food decreases as ants eat
   - [ ] Energy recovers while eating
   - [ ] Eating stops when full or food depleted

3. **Hunger-Driven Behavior**
   - [ ] Hungry ants (< 50 energy) return home more often
   - [ ] Starving ants (< 25 energy) move much slower
   - [ ] Transition back to home feels natural, not glitchy

4. **Colony Metrics**
   - [ ] Food stored decreases as ants eat
   - [ ] Consumption rate > 0 (ants are eating)
   - [ ] Surplus positive if gathering > consuming
   - [ ] Surplus negative if colony is failing

5. **Starvation & Death**
   - [ ] Ants die when energy reaches 0
   - [ ] Dead ants disappear from render
   - [ ] Colony population counts decrease
   - [ ] Colony can theoretically go extinct if no food

6. **Edge Cases**
   - [ ] Empty colony (no food): ants should starve quickly
   - [ ] Food abundant: ants should thrive, surplus high
   - [ ] Single food source, many ants: competition visible
   - [ ] Ants far from food: takes time to gather, starvation risk real

### Performance Checks

- [ ] 60 FPS maintained with 100+ ants consuming energy
- [ ] No frame drops during starvation transitions
- [ ] Metrics calculation doesn't cause lag
- [ ] Removal of dead ants doesn't cause GC stalls

### Visual Feedback Validation

- [ ] Ants visibly slow down as energy drops
- [ ] UI metrics align with visual observation
- [ ] Hunger-based returns home look natural
- [ ] Colony failure feels like "natural consequences," not bugs

---

## Architecture Notes

### Design Consistency

**Maintains Separation of Concerns:**
- Energy decay: pure calculation in SimulationSystem.tick()
- Eating: state-specific logic in IDLE behavior
- Hunger transitions: evaluated in BehaviorStateMachine
- Metrics: computed properties in Colony class
- Rendering: optional visualization in AntRenderer

**Configuration-Driven:**
- All consumption rates, thresholds, multipliers in ENERGY_CONFIG
- Easy to tune for balance without code changes
- Example: "ants eating too slowly?" → adjust FOOD_CONSUMPTION_RATE

### Future Extensions

**Phase 5 (Menu):**
- Starting population difficulty (fewer ants = harder)
- Ant energy difficulty modifier (faster/slower starvation)

**Phase 6 (Worker Specialization):**
- Traits affect energy consumption (efficient workers eat less)
- Traits affect movement speed multipliers
- Different ant types have different energy curves

**Phase 7 (Nursery/Reproduction):**
- Larvae consume less energy (cheaper to raise)
- Queens consume more energy (larger body)
- Energy becomes tied to lifespan and reproduction

**Phase 8+ (Advanced Survival):**
- Hibernation modes (low energy = slower but survive longer)
- Scavenging dead ant bodies (emergency food source)
- Stress/morale based on colony health

---

## Success Criteria Summary

**Phase 4 is successful when:**
1. ✅ Ants visibly slow down from hunger
2. ✅ Colony can fail if food gathering < consumption
3. ✅ Player can observe resource flow in real-time
4. ✅ Starvation feels like natural consequence, not glitch
5. ✅ Survival becomes the primary challenge
6. ✅ System runs at 60 FPS under load
7. ✅ Metrics make colony economics transparent

**Phase 4 is NOT about:**
- Visual polish for starving ants (that's Phase 13)
- Complex nutrient types (that's Phase 6+)
- Behavioral specialization (that's Phase 6)
- World-scale disasters (that's Phase 8+)

---

## Implementation Order

**Recommended segment sequence:**
1. Segment 1: Energy data structure
2. Segment 2: Energy consumption per frame
3. Segment 3: Eating mechanics
4. Segment 4: Hunger-driven transitions
5. Segment 5: Metrics & UI
6. Segment 6: Death & integration

**Testing between each segment:**
- Segment 1 done? → Verify energy property exists
- Segment 2 done? → Watch ants slow down as energy drops
- Segment 3 done? → Watch ants eat and recover
- Segment 4 done? → Observe hungry ants return home more
- Segment 5 done? → Read metrics on screen
- Segment 6 done? → Watch colony succeed or fail

---

**Estimated effort**: 4-6 hours of development + iteration
**Complexity**: Medium (new behavior logic, but straightforward mechanics)
**Risk**: Low (changes isolated to energy system, no breaking changes to pheromones)

