# Ant Behavior Guide

This document explains the behavior systems, state machines, and emergent mechanics in Ants.Game.

## Ant State Machine

Ants are finite state machines that transition between four distinct behavioral modes, each with a clear objective.

### IDLE

**Goal:** Rest and wait at the colony.

An ant enters IDLE when it returns home and has no food to deposit. Idle ants remain at the nest, depositing weak pheromones to mark the colony location. They occasionally transition to WANDERING to explore or forage.

**Visual cue:** Ants rendered in gray

**Behavior:**
- Remain near colony entrance
- Deposit weak NEST pheromones
- Consume stored food to restore energy
- Periodically transition to WANDERING

### WANDERING

**Goal:** Explore the environment and search for food.

Wandering ants move randomly throughout the world, avoiding obstacles. They deposit weak NEST pheromones to create breadcrumb trails back home. If they detect a food source or follow a strong food pheromone trail, they transition to FORAGING.

**Visual cue:** Ants rendered in brown

**Behavior:**
- Random directional movement
- Deposit weak NEST pheromones
- Avoid obstacles using tangent steering
- Detect nearby food sources
- Follow FOOD pheromone gradients
- Return home if energy low (hunger)

### FORAGING

**Goal:** Find food, harvest it, and fill carrying capacity.

Foraging ants actively search for food sources within their perception range. Once food is detected, they move toward it and harvest automatically while nearby. As they harvest and fill their inventory, they deposit **strong food pheromones** (if carrying food) to mark successful routes back home. When full or when the food source is depleted, they transition to RETURNING.

**Visual cue:** Ants rendered in green; red indicator dot appears when carrying food

**Behavior:**
- Move toward nearest detected food source
- Harvest food when in range (automatic)
- Deposit strong FOOD pheromones when carrying food
- Visual inventory indicator (red dot, size = carried amount)
- Transition to RETURNING when inventory full
- Return home if food source depleted
- Return home if energy critically low

### RETURNING

**Goal:** Bring food back to the colony and deposit it.

Returning ants navigate home using nest pheromone trails and their internal sense of colony location. While carrying food, they deposit strong food pheromones to reinforce the successful foraging route. Upon arrival at the colony, they automatically deposit their food into shared storage and transition back to IDLE. If they lose their food (or never had any), they transition directly to IDLE.

**Visual cue:** Ants rendered in blue; red indicator shows carried food amount

**Behavior:**
- Navigate toward home colony
- Follow NEST pheromone trails
- Deposit strong FOOD pheromones while carrying food
- Automatically deposit food at colony
- Eat stored food to restore energy
- Transition to IDLE upon arrival

## State Transitions

```
IDLE → WANDERING (probability-based or when colony needs resources)
WANDERING → FORAGING (food detected within perception range)
FORAGING → RETURNING (inventory full OR food source depleted)
RETURNING → IDLE (arrived at colony AND deposited food)
RETURNING → IDLE (arrived at colony with no food)
```

### Probabilistic Transitions

State transitions use per-second probabilities evaluated each frame:

**From IDLE:**
- `idleToWanderingChance` — Base chance to start wandering

**From WANDERING:**
- `wanderingToForagingChance` — Chance to switch to foraging mode
- `wanderingToReturningChance` — Chance to return home

**From FORAGING:**
- `foragingToReturningChance` — Chance to give up and return

**Hunger Modifiers:**
- Low energy increases return-home probability
- Starving ants prioritize returning over other transitions

## Pheromone System

Pheromones are the primary communication mechanism between ants, creating emergent trail formation and collective intelligence.

### Pheromone Types

**FOOD (Red)**
- Deposited by ants carrying food
- Marks successful foraging routes
- Followed by WANDERING and FORAGING ants
- Creates reinforcing feedback loops

**NEST (Blue)**
- Deposited by all ants moving away from nest
- Creates breadcrumb trails back to colony
- Followed by RETURNING ants
- Helps lost ants find home

**DANGER (Yellow)**
- Reserved for threats and hazards
- Not yet fully implemented
- Will trigger avoidance behavior

### Pheromone Mechanics

**Deposition:**
- Strength varies by ant state and whether carrying food
- RETURNING ants with food deposit strongest FOOD pheromones
- WANDERING ants deposit weak NEST pheromones

**Decay:**
- All pheromones decay exponentially over time
- Different decay rates for different types
- Prevents old trails from persisting indefinitely

**Diffusion:**
- Pheromones spread to adjacent grid cells
- 4-neighbor averaging (up, down, left, right)
- Creates smooth gradients for ants to follow
- Runs every N frames for performance

**Gradient Following:**
- Ants sample pheromones in 8 compass directions
- Calculate direction to strongest concentration
- Blend with random movement for exploration
- Configurable follow strength and randomness

### Emergent Trail Formation

Individual behaviors create emergent colony intelligence:

1. **Discovery:** WANDERING ant finds food, transitions to FORAGING
2. **Marking:** Ant gathers food, deposits FOOD pheromones returning home
3. **Recruitment:** Other ants detect FOOD trail, follow it to source
4. **Reinforcement:** More ants → stronger trail → more recruitment
5. **Optimization:** Multiple paths compete, efficient routes strengthen
6. **Decay:** Depleted sources lose trails as pheromones decay

This creates **self-organizing food highways** without centralized planning.

## Movement & Physics

### Smooth Turning (Inertia)
- Ants don't instantly change direction
- Target velocity interpolates to current velocity
- Creates realistic, organic movement
- Configurable turn speed

### Obstacle Avoidance
- Tangent-based steering around obstacles
- Chooses left or right based on current heading
- Collision resolution pushes ants out of obstacles
- Perception range determines avoidance distance

### Speed Modulation
- Base speed from configuration
- Energy level affects movement speed
- Starving ants move slower
- Can be modified by future traits/specialization

## Energy & Metabolism

### Energy System
- Ants have energy (0-100 scale)
- Different activities consume different amounts
- Energy drains faster when active (foraging/returning)
- Energy drains slower when idle

### Eating
- Ants eat when at colony and energy < threshold
- Food converted to energy instantly
- Colony food storage decreases
- No eating if colony storage depleted

### Starvation
- Low energy triggers hunger behavior
- Hungry ants return home more frequently
- Critical energy slows movement speed
- Zero energy = death

### Colony Survival
- Colony tracks food balance (gathering vs consumption)
- Surplus = healthy, growing colony
- Deficit = struggling, dying colony
- Player must maintain positive food production

## Perception System

Ants perceive their environment through the `PerceptionData` interface:

**Current Perceptions:**
- Nearby obstacles
- Distance to home colony
- Direction to home colony
- Pheromone gradients (8-directional sampling)
- Nearby food sources

**Future Perceptions (Planned):**
- Other ants (friend/foe)
- Threats and predators
- Terrain types
- Nest entrances

### Perception Range
- Configurable radius around ant
- Limits what ant can "see"
- Affects food detection
- Affects obstacle avoidance

## Emergent Behaviors

These complex behaviors emerge from simple rules:

### Trail Networks
- Ants create interconnected pheromone highways
- Efficient routes dominate through reinforcement
- New routes emerge as old ones decay
- No centralized pathfinding required

### Resource Distribution
- Food naturally flows from sources to colony
- Ants self-organize around abundant resources
- Colony adapts to changing food availability

### Adaptive Exploration
- Balance between trail-following and random exploration
- Prevents over-commitment to single routes
- Allows discovery of new food sources
- Creates resilience to environmental changes

### Colony Homeostasis
- Population self-regulates based on food availability
- Starvation reduces population if production too low
- Healthy colonies can support more ants
- Creates natural carrying capacity

## Configuration & Tuning

All behavior parameters are in `src/config.ts`:

**Movement:**
- `MOVEMENT_CONFIG.SPEED` — Base movement speed
- `MOVEMENT_CONFIG.TURN_SPEED` — How quickly ants turn
- `MOVEMENT_CONFIG.CHANGE_DIRECTION_INTERVAL` — Wandering frequency

**Behavior:**
- `BEHAVIOR_CONFIG.IDLE_TO_WANDERING_CHANCE` — Exploration rate
- `BEHAVIOR_CONFIG.WANDERING_TO_FORAGING_CHANCE` — Task switching
- `BEHAVIOR_CONFIG.FORAGING_MIN_DURATION` — Minimum foraging time

**Pheromones:**
- `PHEROMONE_CONFIG.FOOD_DECAY_RATE` — Trail persistence
- `PHEROMONE_CONFIG.DIFFUSION_RATE` — Gradient smoothness
- `PHEROMONE_BEHAVIOR_CONFIG.FOLLOW_STRENGTH` — Trail-following intensity
- `PHEROMONE_BEHAVIOR_CONFIG.EXPLORATION_RANDOMNESS` — Exploration vs exploitation

**Energy:**
- `ENERGY_CONFIG.THRESHOLDS` — Hunger triggers
- `ENERGY_CONFIG.CONSUMPTION_RATES` — Activity costs
- `ENERGY_CONFIG.FOOD_TO_ENERGY_RATIO` — Eating efficiency

Tuning these values significantly affects emergent behavior!

## Debug & Observation

### Visual Indicators
- Color-coded ant states (gray/brown/green/blue)
- Carrying indicator (red dot scaled by inventory)
- Pheromone overlay (toggle with 'P' key)
- State distribution counters
- Colony metrics display

### Keyboard Controls
- **P** — Toggle pheromone overlay
- **T** — Deposit test pheromones (debug)
- **R** — Return to menu
- **ESC** — Open/close configuration

### UI Elements
- Live ant count and state distribution
- Colony food storage and rates
- Health status (healthy/struggling/critical/dead)
- Food balance (gathering vs consumption)

## Future Behavior Extensions

Planned additions to the behavior system:

- **Trait-based specialization** — Ants become better at repeated tasks
- **Reproductive behavior** — Queen spawning, brood care
- **Combat mechanics** — Territory defense, rival colonies
- **Building behavior** — Nest expansion, tunnel digging
- **Communication** — Direct ant-to-ant interactions
- **Threat response** — Coordinated defense against predators
