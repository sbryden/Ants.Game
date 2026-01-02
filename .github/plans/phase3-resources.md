# Plan: Phase 3 — Colony & Resources

## Overview

Implement food sources and resource gathering mechanics. Ants will forage for food, carry it back to the colony, and accumulate resources. This establishes the economic foundation for ant survival (full health/starvation mechanics come in Phase 4).

## Phase 3 Exit Criteria

- ✅ Food sources spawn randomly on the map (avoiding obstacles and colony entrance)
- ✅ Ants detect and harvest food from sources
- ✅ Ants carry food with uniform capacity back to colony
- ✅ Colonies accumulate food in storage
- ✅ When food source is depleted, a new one spawns elsewhere
- ✅ Visual feedback shows food sources, ant carrying state, and colony storage
- ✅ System runs at 60 FPS with food mechanics active

## Design Decisions

### Food Source Model
- **Depletable & Respawning**: Each food source has a finite `foodAmount` that depletes as ants harvest
- **Single Active Source**: At any time, exactly one food source exists on the map (MVP)
- **Respawn Behavior**: When depleted (foodAmount ≤ 0), immediately spawn new source at random unblocked location
- **Location Constraints**: 
  - Not within obstacles (collision-free)
  - Not within colony entrance radius (don't spawn inside nest)
  - Within world bounds
  - Sufficient distance from edges (at least 1 source radius)

### Ant Carrying System
- **Uniform Capacity**: All ants have same `carriedFood` max capacity (configurable, default 5 units)
- **Per-Ant Tracking**: `Ant.carriedFood: number` (0 to maxCapacity)
- **No Degradation**: Food doesn't spoil during transport (future enhancement if needed)
- **No Consumption Yet**: Ants don't consume food to survive in Phase 3 (eating mechanics Phase 4)

### Behavioral Model
- **Ant States**: Reuse existing states (IDLE, WANDERING, FORAGING, RETURNING) with new carrying-aware logic
- **State Changes**:
  - **WANDERING/FORAGING** → Detect food source within perception range
  - **At Food Source** → Harvest automatically while in proximity (no new state)
  - **With Food** → Automatically transition toward home (leverage existing movement)
  - **RETURNING + carriedFood > 0** → Prioritize home arrival, deposit food at nest
  - **Food Deposit** → Automatic transfer to colony.resourceCount
- **Future Enhancement**: Phase 5 worker specialization can vary forage rates per trait

### Pheromone Integration
- **Food Pheromone Deposition**: 
  - FORAGING ants: weak deposition (0.5) searching for food
  - RETURNING + carriedFood > 0: strong deposition (2.0) with successful food trail
- **Gradient Following**: Existing pheromone gradient behavior allows emergent trail formation
- **Benefit**: Ants naturally create "highways" between food sources and nest after multiple foraging trips

### Resource Tracking
- **Ant Inventory**: `Ant.carriedFood` (displayed visually as carrying indicator)
- **Colony Storage**: `Colony.resourceCount` accumulates harvested food
- **Metrics for Future Use**: Track rates (food/sec gathered, consumed, stored) for Phase 4 survival mechanics
- **No Hard Goals Yet**: Phase 3 focuses on mechanics, not winning/losing

---

## Implementation Plan

### Segment 1: Food Source Entity & World Integration

**Goal**: Define FoodSource class, add to World, implement spawn/respawn logic

#### New Files
- `src/sim/FoodSource.ts`

#### Modified Files
- `src/sim/World.ts` — Add foodSource property, respawn logic
- `src/config.ts` — Add FOOD_CONFIG

#### Tasks

1. **Create FoodSource class**
   ```typescript
   export class FoodSource {
     public readonly id: string;
     public readonly x: number;
     public readonly y: number;
     public readonly radius: number;
     public foodAmount: number;
     
     constructor(id, x, y, foodAmount, radius)
     
     public harvest(amount: number): number {
       // Return min(amount, foodAmount)
       // Decrease foodAmount by returned amount
     }
     
     public isDepleted(): boolean {
       return foodAmount <= 0;
     }
   }
   ```

2. **Add to World**
   ```typescript
   export class World {
     public foodSource: FoodSource | null = null;
     
     public spawnFoodSource(): void {
       // Find random unblocked location
       // Avoid obstacles, colony entrance, edges
       // Create new FoodSource
     }
     
     public findFoodSourcesNear(x, y, range): FoodSource[] {
       // Return array with current foodSource if in range
     }
   }
   ```

3. **Spawn Logic**
   - **At World Initialization**: Spawn first food source in SimulationSystem.tick() or MainScene.create()
   - **Respawn Trigger**: Check `foodSource.isDepleted()` each frame, spawn new if needed
   - **Location Algorithm**:
     - Random point in world bounds (with padding)
     - Check against all obstacles (circle-circle collision)
     - Check distance to colony entrance (must be > entranceRadius + buffer)
     - Retry up to 10 times, then spawn at fallback location
   - **Fallback**: If random fails, use predetermined safe zone (e.g., bottom-right quadrant)

4. **Configuration**
   ```typescript
   export const FOOD_CONFIG = {
     /**
      * Initial food amount spawned in each source
      */
     INITIAL_FOOD_AMOUNT: 100,
     
     /**
      * Radius of food source circle in pixels
      */
     SOURCE_RADIUS: 15,
     
     /**
      * Minimum distance from world edges for spawn
      */
     SPAWN_EDGE_PADDING: 30,
     
     /**
      * Maximum attempts to find valid spawn location
      */
     SPAWN_ATTEMPTS: 10,
   } as const;
   ```

#### Exit Criteria
- ✅ FoodSource class created with harvest() and isDepleted() methods
- ✅ World manages single foodSource instance
- ✅ First food source spawns on initialization
- ✅ New source spawns immediately when previous depleted
- ✅ Spawn locations avoid obstacles and colony
- ✅ No TypeScript errors, builds successfully

---

### Segment 2: Ant Carrying Capacity & Inventory Display

**Goal**: Add carry mechanics to ants, visual feedback for carrying state

#### Modified Files
- `src/sim/Ant.ts` — Add carriedFood property
- `src/config.ts` — Add ant carrying config
- `src/render/AntRenderer.ts` — Visual indicator for carrying state

#### Tasks

1. **Extend Ant class**
   ```typescript
   export class Ant {
     // Existing properties...
     
     public carriedFood: number = 0;
   }
   ```

2. **Add Carry Configuration**
   ```typescript
   export const ANT_CARRY_CONFIG = {
     /**
      * Maximum food units an ant can carry
      */
     MAX_CAPACITY: 5,
     
     /**
      * Radius of carrying indicator dot
      */
     CARRYING_INDICATOR_RADIUS: 1.5,
     
     /**
      * Color of carrying indicator (red = food)
      */
     CARRYING_INDICATOR_COLOR: 0xff4444,
   } as const;
   ```

3. **Rendering Enhancement** (AntRenderer)
   - When `ant.carriedFood > 0`:
     - Draw a small food particle inside ant (colored indicator)
     - Scale proportional to capacity: `scale = carriedFood / MAX_CAPACITY`
   - Visual should be subtle, not distracting

#### Exit Criteria
- ✅ Ant.carriedFood property added, initialized to 0
- ✅ AntRenderer shows visual indicator when carrying
- ✅ Carrying state is observable in debug view
- ✅ No visual clutter at 60 FPS

---

### Segment 3: Foraging & Food Detection Behavior

**Goal**: Ants detect food sources and transition to harvesting

#### New Files
- `src/sim/behaviors/foodBehaviors.ts`

#### Modified Files
- `src/sim/behaviors/antBehaviors.ts` — Import food behaviors
- `src/systems/SimulationSystem.ts` — Call food detection, harvesting
- `src/config.ts` — Add FORAGING_CONFIG

#### Tasks

1. **Create foodBehaviors.ts**
   ```typescript
   /**
    * Detect food sources within perception range
    */
   export function detectFoodSources(
     ant: Ant,
     world: World,
     perceptionRange: number
   ): FoodSource[] {
     // If world.foodSource exists and is in range, return [foodSource]
     // Otherwise return []
   }
   
   /**
    * Check if ant is at food source (within harvest range)
    */
   export function isAtFoodSource(
     ant: Ant,
     foodSource: FoodSource
   ): boolean {
     // Distance from ant to source center <= source.radius + ant.radius
   }
   
   /**
    * Harvest food from source
    * Returns amount actually harvested
    */
   export function harvestFood(
     ant: Ant,
     foodSource: FoodSource,
     harvestRate: number
   ): number {
     const canHarvest = ant.maxCapacity - ant.carriedFood;
     const harvested = foodSource.harvest(
       Math.min(canHarvest, harvestRate)
     );
     ant.carriedFood += harvested;
     return harvested;
   }
   ```

2. **Integrate into Behavior Loop** (SimulationSystem.updateAntBehavior)
   ```typescript
   case AntState.FORAGING:
     const nearbyFood = detectFoodSources(
       ant,
       world,
       config.PERCEPTION_CONFIG.PERCEPTION_RANGE
     );
     
     if (nearbyFood.length > 0) {
       const food = nearbyFood[0];
       
       if (isAtFoodSource(ant, food)) {
         // Harvest automatically
         harvestFood(
           ant,
           food,
           config.FOOD_CONFIG.HARVEST_RATE
         );
         
         // If full or source depleted, return home
         if (ant.carriedFood >= ant.maxCapacity || food.isDepleted()) {
           ant.state = AntState.RETURNING;
         }
       } else {
         // Move toward food
         moveTowardsPoint(ant, food.x, food.y, config);
       }
     } else {
       // No nearby food, random wander (existing behavior)
       applyRandomWander(ant, config);
     }
     
     // Pheromone deposition (existing)
     depositPheromones(ant, world, config);
     break;
   ```

3. **Configuration**
   ```typescript
   export const FOOD_CONFIG = {
     // ... (from Segment 1)
     
     /**
      * Harvest rate in food units per second
      * When ant is at food source
      */
     HARVEST_RATE: 1.0,
     
     /**
      * Distance threshold for ant to be "at" food source
      * Should be sum of ant radius and food source radius
      */
     HARVEST_DISTANCE: 20, // ANT_RENDER_CONFIG.BODY_RADIUS + FOOD_CONFIG.SOURCE_RADIUS
   } as const;
   ```

4. **Pheromone Deposition During Foraging**
   - **With food (carriedFood > 0)**: Deposit strong FOOD pheromone (2.0)
     - Signals "successful food route" to other ants
   - **Without food (carriedFood == 0)**: Weak FOOD pheromone (0.5)
     - Signals "food found here" during searching
   - Update depositPheromones() in SimulationSystem to check ant.carriedFood

#### Exit Criteria
- ✅ Ants detect food sources within perception range
- ✅ Ants move toward detected food
- ✅ Ants harvest automatically when at food source
- ✅ Harvest rate is configurable
- ✅ Ants transition to RETURNING when carrying food
- ✅ Pheromone deposition varies by carrying state
- ✅ 60 FPS maintained during foraging

---

### Segment 4: Food Depositing & Colony Storage

**Goal**: Ants return food to colony, update storage

#### Modified Files
- `src/systems/SimulationSystem.ts` — Add food deposit logic in RETURNING behavior
- `src/sim/Colony.ts` — Track deposited food metrics (future use)

#### Tasks

1. **Extend RETURNING Behavior** (SimulationSystem)
   ```typescript
   case AntState.RETURNING:
     const colony = ant.homeColony;
     
     if (ant.carriedFood > 0) {
       // Check if ant is at home
       if (isAtHome(ant, colony)) {
         // Deposit food
         colony.resourceCount += ant.carriedFood;
         ant.carriedFood = 0;
         ant.state = AntState.IDLE;
       } else {
         // Move toward home (existing logic)
         moveTowardsHome(ant, colony, config);
       }
     } else {
       // No food, transition to idle
       ant.state = AntState.IDLE;
     }
     
     // Pheromone deposition (existing, now aware of carriedFood)
     depositPheromones(ant, world, config);
     break;
   ```

2. **Helper Function**
   ```typescript
   export function depositFoodToColony(
     ant: Ant,
     colony: Colony
   ): void {
     colony.resourceCount += ant.carriedFood;
     ant.carriedFood = 0;
   }
   ```

#### Exit Criteria
- ✅ Ants deposit food at colony when returning home
- ✅ Colony.resourceCount increases correctly
- ✅ Ant.carriedFood zeroed after deposit
- ✅ Ant transitions to IDLE after deposit

---

### Segment 5: Food Source Respawning & Polish

**Goal**: Integrate respawn logic, visual rendering, final tuning

#### New Files
- `src/render/FoodSourceRenderer.ts`

#### Modified Files
- `src/scenes/MainScene.ts` — Integrate FoodSourceRenderer
- `src/systems/SimulationSystem.ts` — Add respawn tick
- `src/render/AntRenderer.ts` — Refine carrying visual

#### Tasks

1. **Food Source Respawning** (SimulationSystem.tick)
   ```typescript
   public tick(deltaTime: number): void {
     // Existing simulation updates...
     
     // Check if food source needs respawn
     if (!world.foodSource || world.foodSource.isDepleted()) {
       world.spawnFoodSource();
     }
   }
   ```

2. **FoodSourceRenderer** (new file)
   ```typescript
   export class FoodSourceRenderer {
     private graphics: Phaser.Graphics;
     
     public render(foodSource: FoodSource | null): void {
       this.graphics.clear();
       
       if (!foodSource) return;
       
       // Draw food source as circle
       // Color: brownish/tan gradient
       // Opacity proportional to remaining food
       
       const fillColor = 0xd4a574; // Tan/brown
       const initialAmount = FOOD_CONFIG.INITIAL_FOOD_AMOUNT;
       const opacity = Math.min(1, foodSource.foodAmount / initialAmount);
       
       this.graphics.fillStyle(fillColor, opacity);
       this.graphics.fillCircle(
         foodSource.x,
         foodSource.y,
         foodSource.radius
       );
       
       // Border
       this.graphics.lineStyle(2, 0x8b6f47, opacity);
       this.graphics.strokeCircle(foodSource.x, foodSource.y, foodSource.radius);
     }
   }
   ```

3. **Integrate Renderer** (MainScene)
   ```typescript
   private foodSourceRenderer: FoodSourceRenderer;
   
   public create(): void {
     // Existing...
     this.foodSourceRenderer = new FoodSourceRenderer(this);
   }
   
   public update(): void {
     // Existing...
     this.foodSourceRenderer.render(this.world.foodSource);
   }
   ```

4. **Visual Polish**
   - Ant carrying indicator: small filled dot inside ant body, red/orange color
   - Carrying scale proportional to carriedFood/maxCapacity
   - Food source opacity fades as depleted (visual feedback)

#### Exit Criteria
- ✅ FoodSourceRenderer renders food source with visual feedback
- ✅ Food source respawns when depleted
- ✅ Ant carrying indicator visible and proportional to load
- ✅ No visual clutter or performance issues
- ✅ 60 FPS maintained throughout gameplay

---

## Testing & Validation

### Manual Testing Checklist

1. **Food Spawning**
   - [ ] First food source spawns on initialization
   - [ ] Food source appears at valid location (not in obstacles/colony)
   - [ ] New source spawns immediately when previous depleted

2. **Foraging**
   - [ ] Ants detect food source within perception range
   - [ ] Ants move toward food
   - [ ] Ants harvest food when at source
   - [ ] Carrying indicator appears when ant has food

3. **Returning & Depositing**
   - [ ] Ants with food move toward colony
   - [ ] Ants deposit food at colony entrance
   - [ ] Colony.resourceCount increases
   - [ ] Ant.carriedFood resets to 0 after deposit

4. **Pheromones**
   - [ ] Ants with food deposit strong food pheromones (red trails)
   - [ ] Other ants follow established trails
   - [ ] Emergent "highways" form between food and nest (after ~1 min)

5. **Performance**
   - [ ] Maintain 60 FPS with 20+ ants
   - [ ] No frame rate drops during food spawning
   - [ ] No memory leaks over 5+ minute gameplay

---

## Future Enhancement Points

### Phase 4 — Health & Eating Mechanics
- **Ant Consumption**: Each ant consumes food at configurable rate (e.g., 0.01 units/sec)
- **Starvation**: Ants with health ≤ 0 become inactive or die
- **Colony Eating**: Food stored in colony distributed to support population
- **Success/Failure**: Colony must maintain positive food flow (production > consumption) to survive
- **Metrics UI**: Display food rate, consumption rate, colony health

### Phase 5 — Worker Specialization + Gathering Traits
- **Harvest Rate Variation**: Specialized foragers gather faster (e.g., 1.5×)
- **Carrying Capacity Variation**: Some ants carry more (6-8 units vs 5)
- **Movement Speed**: Foragers slightly faster, but slower when carrying
- **Trait Drift**: Ants that forage frequently develop gathering affinity over time

### Phase 6 — Player Interaction & Food Placement
- **Manual Food Spawning**: Player places food sources with mouse
- **Source Removal**: Remove placed sources (for testing/experimentation)
- **Configuration UI**: Adjust food spawn rate, initial amount, harvest rate without code changes

### Phase 7 — Nursery / Reproduction
- **Egg/Larva/Pupa Lifecycle**: New ants grow through stages
- **Queen Reproduction**: Colony produces eggs
- **Brood Care**: Worker ants feed larvae
- **Population Growth**: Based on food surplus and energy available
- **Caste Variation**: Different caste types (workers, soldiers, drones) emerge from nursery

### Future Considerations
- **Spoilage**: Food loses quality over distance/time (important if multiple colonies)
- **Food Quality**: Different food types with different nutritional value
- **Storage Limits**: Colony has max food capacity, overflow/waste
- **Fatigue**: Carrying food slows ants down over distance (more realistic)

---

## Technical Debt & Optimizations

### Current MVP
- Single food source (no multiple sources competing)
- No food spoilage or degradation
- No ant energy cost for movement/carrying
- No consumption mechanics yet

### Potential Optimizations (if needed)
- **Grid-Based Food Detection**: Use spatial hash for multiple sources (Phase 8+)
- **Batch Rendering**: Combine food source rendering with other objects
- **Object Pooling**: Reuse FoodSource objects on respawn

---

## Risk Mitigation

**Behavioral Risks:**
- Ants may get stuck trying to reach inaccessible food
  - *Mitigation*: Spawn food only in open areas, ensure movement can pathfind around obstacles
- Ants may ignore trails and re-explore repeatedly
  - *Mitigation*: Pheromone decay rates tuned from Phase 2; if issue persists, check FOLLOW_STRENGTH

**Performance Risks:**
- Food detection per ant per frame could be expensive with many ants
  - *Mitigation*: MVP has single food source (O(1) check); optimize if scales to multiple sources

**Integration Risks:**
- New state transitions might conflict with existing FSM
  - *Mitigation*: FORAGING/RETURNING states reused; only add carry-aware logic, no new states

---

## Estimated Timeline

- **Segment 1**: 2-3 hours (FoodSource, spawn logic, World integration)
- **Segment 2**: 1 hour (Ant carrying, simple rendering)
- **Segment 3**: 2-3 hours (Detection, harvesting, behavior)
- **Segment 4**: 1-2 hours (Deposit logic, colony storage)
- **Segment 5**: 2-3 hours (FoodSourceRenderer, respawn integration, polish)

**Total**: ~8-12 hours

---

## Success Indicators

After Phase 3 completion, you should observe:
- ✅ Ants leaving colony, finding food, returning with visible load
- ✅ Colony.resourceCount increasing over time
- ✅ Red pheromone trails forming between nest and food source
- ✅ Multiple ants reinforcing trails on successful routes
- ✅ New food sources spawning when old ones are depleted
- ✅ Emergent efficiency: ants find food faster on subsequent trips
- ✅ Zero hard-coded pathfinding—all emergent from pheromones + movement

---

## Next Steps After Phase 3

Phase 3 completion sets up:
- **Phase 4 (Health & Eating)**: Implement ant consumption, starvation, colony health, survival conditions
- **Phase 5 (Worker Specialization)**: Add forage-rate and carry-capacity traits
- **Phase 7 (Nursery)**: Implement breeding and population growth
- **Phase 8 (Player Interaction)**: Let player place/remove food sources, adjust spawn rates
