# Plan: Phase 5 — Menu & Title Screen

## Overview

Create a calm, minimal menu system that serves as the entry point to the simulation. The menu should feel observational and inviting, with a **living background** where ants move behind the UI. This phase introduces basic configuration options while maintaining sensible defaults that allow immediate play.

The design philosophy is **"watch, then configure"**—players see the simulation first, then adjust parameters if desired.

## Phase 5 Exit Criteria

- [ ] Menu scene loads as the initial entry point
- [ ] Living simulation runs behind menu UI (visible ants moving)
- [ ] "Start Simulation" button transitions to main game scene
- [ ] Configuration panel for starting parameters:
  - [ ] Ant count slider (10-100 ants)
  - [ ] Theme selector (Default, High Contrast, Black & White)
- [ ] Defaults allow immediate play (no configuration required)
- [ ] Theme system is extensible for future additions
- [ ] Menu feels calm and minimalist (not cluttered)
- [ ] Performance: menu runs at 60 FPS with background simulation
- [ ] Proper scene lifecycle (menu → game → back to menu on restart)

## Design Decisions

### Menu as First Screen

**Philosophy:** The menu should feel like **looking through a window** at the colony, not a barrier to entry.

**Implementation:**
- Menu loads first (before MainScene)
- Simulation runs in background at reduced complexity (fewer ants, no UI clutter)
- Semi-transparent overlay with menu options
- Title and tagline set the tone: "Ants.Game — Observe. Adapt. Survive."

**Rationale:**
- Players immediately see what the game is about (ants!)
- Creates curiosity and engagement before play
- Avoids static splash screens or loading bars

### Living Background Simulation

**Challenge:** Run simulation behind menu without duplicating code or causing performance issues.

**Solution:**
- MenuScene creates a lightweight World instance
- Uses same SimulationSystem but with reduced parameters:
  - Fewer initial ants (10-15 vs. 40)
  - Smaller world bounds (match viewport)
  - No food sources (optional: could add one for visual interest)
  - No debug UI or overlays
- Ants wander/idle naturally, creating ambient motion

**Performance Consideration:**
- Limit to 15 ants max for menu background
- Use same renderer classes (AntRenderer, ColonyRenderer)
- Pause simulation when config panels are open (optional optimization)

### Configuration Options

#### 1. Starting Ant Count

**Purpose:** Let players tune initial difficulty (fewer ants = harder survival).

**Implementation:**
- Slider: 10 to 100 ants (step: 5)
- Default: 40 (current WORLD_CONFIG.INITIAL_ANT_COUNT)
- Preview updates background simulation in real-time (optional polish)

**UI Design:**
```
Starting Ants: [====|=====    ] 40
              10              100
```

**Config Impact:**
- Directly sets `WORLD_CONFIG.INITIAL_ANT_COUNT` before scene transition
- Smaller colonies are riskier (starvation, extinction)
- Larger colonies have more foragers but higher consumption

#### 2. Theme Selection

**Purpose:** Visual customization without affecting gameplay.

**Themes:**

1. **Default** (current colors)
   - Background: #2d4a2e (dark green)
   - Ants: State-based colors (gray, brown, green, blue)
   - Pheromones: Red (food), Blue (nest), Yellow (danger)

2. **High Contrast**
   - Background: #1a1a1a (near black)
   - Ants: Brighter, saturated colors
   - Pheromones: Stronger opacity, neon colors
   - Improved readability for accessibility

3. **Black & White**
   - Background: #000000
   - Ants: White/gray scale by state
   - Pheromones: Gray gradients
   - Minimalist aesthetic

**Implementation:**
- Store theme choice in `GameState` (or localStorage for persistence)
- Each renderer checks active theme and adjusts colors
- Themes defined in new `THEME_CONFIG` in config.ts

**Extension Point:**
- Future themes: "Ant Farm Tan", "Neon Cyberpunk", "Forest Canopy"
- Player-submitted themes via JSON config files

### Scene Architecture

**Scene Flow:**
```
MenuScene (entry point)
    ↓ [Start button pressed]
MainScene (gameplay)
    ↓ [Colony extinct or player restarts]
MenuScene (return to menu)
```

**Scene Management:**
- Phaser scene plugin handles transitions
- MenuScene: `this.scene.start('MainScene', config)`
- MainScene: `this.scene.start('MenuScene')` on restart
- Config passed as data object: `{ antCount: 40, theme: 'default' }`

### UI Layout

**Minimal Design:**

```
┌─────────────────────────────────────┐
│                                     │
│   [Ants wander behind this...]     │
│                                     │
│         Ants.Game                   │
│    Observe. Adapt. Survive.         │
│                                     │
│    ┌─────────────────────┐         │
│    │  Start Simulation   │         │
│    └─────────────────────┘         │
│                                     │
│    ⚙ Configuration (click)         │
│                                     │
└─────────────────────────────────────┘
```

**Expanded Config Panel (when clicked):**
```
┌─────────────────────────────────────┐
│         Configuration               │
│                                     │
│  Starting Ants:                     │
│  [====|=====    ] 40                │
│                                     │
│  Theme:                             │
│  ○ Default  ● High Contrast         │
│  ○ Black & White                    │
│                                     │
│  ┌────────────┐  ┌────────────┐   │
│  │   Apply    │  │   Cancel   │   │
│  └────────────┘  └────────────┘   │
└─────────────────────────────────────┘
```

**Implementation Notes:**
- Semi-transparent dark overlay when config panel opens
- Background simulation pauses (optional)
- ESC key closes config panel
- Defaults pre-selected (no Apply needed to use defaults)

---

## Implementation Plan

### Segment 1: MenuScene Foundation

**Goal:** Create basic menu scene that loads as entry point.

#### Files to Create
- `src/scenes/MenuScene.ts` — New scene class

#### Files to Modify
- `src/main.ts` — Add MenuScene to Phaser config, set as first scene
- `src/types/GameConfig.ts` — Create interface for game configuration

#### Tasks

1. **Create MenuScene Class**
   ```typescript
   export class MenuScene extends Phaser.Scene {
     constructor() {
       super({ key: 'MenuScene' });
     }

     create(): void {
       // Set background color
       this.cameras.main.setBackgroundColor('#2d4a2e');
       
       // Title text
       this.add.text(/* ... */).setText('Ants.Game');
       
       // Start button
       const startButton = this.add.text(/* ... */).setText('Start Simulation');
       startButton.setInteractive();
       startButton.on('pointerdown', () => {
         this.scene.start('MainScene');
       });
     }
   }
   ```

2. **Register MenuScene in main.ts**
   ```typescript
   const config: Phaser.Types.Core.GameConfig = {
     // ...
     scene: [MenuScene, MainScene], // MenuScene first
   };
   ```

3. **GameConfig Interface**
   ```typescript
   export interface GameConfig {
     antCount: number;
     theme: 'default' | 'highContrast' | 'blackWhite';
   }
   ```

#### Exit Criteria
- [ ] MenuScene loads when game starts
- [ ] Start button transitions to MainScene
- [ ] Basic styling (title, button) present
- [ ] No background simulation yet (just static screen)

---

### Segment 2: Living Background Simulation

**Goal:** Add background ant simulation to MenuScene.

#### Files to Modify
- `src/scenes/MenuScene.ts` — Add world, simulation, renderers

#### Tasks

1. **Initialize Simulation in MenuScene**
   ```typescript
   private world!: World;
   private simulationSystem!: SimulationSystem;
   private antRenderer!: AntRenderer;
   
   create(): void {
     // Create world (smaller than main game)
     this.world = new World(this.scale.width, this.scale.height);
     this.simulationSystem = new SimulationSystem(this.world);
     
     // Spawn fewer ants for menu (lightweight)
     const colony = this.world.createColony(
       this.scale.width / 2,
       this.scale.height / 2
     );
     for (let i = 0; i < 15; i++) {
       this.world.spawnAnt(colony);
     }
     
     // Initialize renderers
     this.antRenderer = new AntRenderer(this);
     
     // UI elements on top (higher depth)
     this.createUI();
   }
   
   update(time: number, delta: number): void {
     this.simulationSystem.update(delta / 1000);
     this.antRenderer.render(this.world.getAllAnts());
   }
   ```

2. **Adjust Z-Depths**
   - Ants: default depth (0)
   - Menu overlay: depth 100
   - Config panel: depth 200

#### Exit Criteria
- [ ] Ants move naturally behind menu UI
- [ ] No performance issues (60 FPS maintained)
- [ ] UI text is readable over ant movement
- [ ] Background colony is centered on screen

---

### Segment 3: Configuration Panel - Ant Count Slider

**Goal:** Add slider to configure starting ant count.

#### Files to Modify
- `src/scenes/MenuScene.ts` — Add config panel and slider
- `src/config.ts` — Add UI_CONFIG for menu styling

#### Tasks

1. **Config Panel Toggle**
   ```typescript
   private configPanel!: Phaser.GameObjects.Container;
   private isConfigOpen: boolean = false;
   
   private createUI(): void {
     // ... existing UI ...
     
     // Config button
     const configButton = this.add.text(/* ... */).setText('⚙ Configuration');
     configButton.setInteractive();
     configButton.on('pointerdown', () => {
       this.toggleConfigPanel();
     });
     
     // Create config panel (hidden initially)
     this.createConfigPanel();
   }
   ```

2. **Ant Count Slider**
   ```typescript
   private selectedAntCount: number = 40;
   
   private createConfigPanel(): void {
     this.configPanel = this.add.container(/* ... */);
     
     // Background overlay
     const overlay = this.add.rectangle(/* ... */);
     
     // Slider implementation (use Phaser Graphics)
     const slider = this.createSlider(10, 100, 40);
     
     this.configPanel.add([overlay, slider]);
     this.configPanel.setVisible(false);
   }
   
   private createSlider(min: number, max: number, initial: number) {
     // Draw slider track
     // Draw slider handle (draggable)
     // Update selectedAntCount on drag
     // Display current value
   }
   ```

3. **Apply Configuration**
   ```typescript
   private applyConfig(): void {
     const config: GameConfig = {
       antCount: this.selectedAntCount,
       theme: 'default', // For now
     };
     
     this.scene.start('MainScene', config);
   }
   ```

#### Exit Criteria
- [ ] Config panel opens/closes smoothly
- [ ] Slider allows selecting ant count (10-100)
- [ ] Current value displays next to slider
- [ ] Apply button starts game with selected count
- [ ] Cancel button closes panel without changes

---

### Segment 4: Theme System Foundation

**Goal:** Implement theme switching infrastructure.

#### Files to Create
- `src/types/Theme.ts` — Theme type definitions

#### Files to Modify
- `src/config.ts` — Add THEME_CONFIG
- `src/scenes/MenuScene.ts` — Add theme selector UI
- `src/scenes/MainScene.ts` — Accept and apply theme from config
- All renderer files — Check theme and adjust colors

#### Tasks

1. **Define Theme Types**
   ```typescript
   export type ThemeId = 'default' | 'highContrast' | 'blackWhite';
   
   export interface Theme {
     id: ThemeId;
     name: string;
     backgroundColor: number;
     antColors: {
       idle: number;
       wandering: number;
       foraging: number;
       returning: number;
     };
     pheromoneColors: {
       food: number;
       nest: number;
       danger: number;
     };
   }
   ```

2. **Theme Configuration**
   ```typescript
   export const THEME_CONFIG: Record<ThemeId, Theme> = {
     default: {
       id: 'default',
       name: 'Default',
       backgroundColor: 0x2d4a2e,
       antColors: { /* current colors */ },
       pheromoneColors: { /* current colors */ },
     },
     highContrast: {
       id: 'highContrast',
       name: 'High Contrast',
       backgroundColor: 0x1a1a1a,
       antColors: { /* brighter colors */ },
       pheromoneColors: { /* neon colors */ },
     },
     blackWhite: {
       id: 'blackWhite',
       name: 'Black & White',
       backgroundColor: 0x000000,
       antColors: { /* grayscale */ },
       pheromoneColors: { /* grayscale */ },
     },
   };
   ```

3. **Theme Context in Scenes**
   ```typescript
   export class MainScene extends Phaser.Scene {
     private currentTheme: Theme = THEME_CONFIG.default;
     
     create(): void {
       // Get theme from config data
       const config = this.scene.settings.data as GameConfig;
       if (config?.theme) {
         this.currentTheme = THEME_CONFIG[config.theme];
       }
       
       // Apply theme
       this.cameras.main.setBackgroundColor(this.currentTheme.backgroundColor);
       // ... pass theme to renderers ...
     }
   }
   ```

4. **Update Renderers to Use Theme**
   ```typescript
   export class AntRenderer {
     private theme: Theme;
     
     constructor(scene: Phaser.Scene, theme: Theme) {
       this.theme = theme;
       this.graphics = scene.add.graphics();
     }
     
     private drawAnt(ant: Ant): void {
       const bodyColor = this.theme.antColors[ant.state];
       // ... use bodyColor ...
     }
   }
   ```

#### Exit Criteria
- [ ] Three themes defined in THEME_CONFIG
- [ ] Theme selector UI in menu config panel
- [ ] Theme applies when starting simulation
- [ ] All renderers respect active theme
- [ ] Background color changes correctly
- [ ] Ant and pheromone colors update

---

### Segment 5: Scene Lifecycle & Config Passing

**Goal:** Proper scene transitions and config data flow.

#### Files to Modify
- `src/scenes/MainScene.ts` — Accept config, add restart logic
- `src/scenes/MenuScene.ts` — Pass config on start
- `src/systems/SimulationSystem.ts` — Accept ant count parameter

#### Tasks

1. **MainScene Config Acceptance**
   ```typescript
   create(): void {
     const config = this.scene.settings.data as GameConfig;
     const antCount = config?.antCount ?? WORLD_CONFIG.INITIAL_ANT_COUNT;
     const theme = config?.theme ?? 'default';
     
     // Apply configuration
     this.currentTheme = THEME_CONFIG[theme];
     this.cameras.main.setBackgroundColor(this.currentTheme.backgroundColor);
     
     // Initialize world with custom ant count
     this.world = new World(this.scale.width, this.scale.height);
     this.simulationSystem = new SimulationSystem(this.world);
     this.simulationSystem.initializeWorld(antCount);
   }
   ```

2. **SimulationSystem.initializeWorld(antCount)**
   ```typescript
   public initializeWorld(antCount?: number): void {
     const count = antCount ?? WORLD_CONFIG.INITIAL_ANT_COUNT;
     
     const colony = this.world.createColony(
       this.world.width / 2,
       this.world.height / 2
     );

     for (let i = 0; i < count; i++) {
       const ant = this.world.spawnAnt(colony);
       applyRandomWander(ant, this.movementConfig);
     }
   }
   ```

3. **Restart Logic**
   ```typescript
   // In MainScene.create(), add keyboard listener
   this.input.keyboard?.on('keydown-R', () => {
     this.restartSimulation();
   });
   
   private restartSimulation(): void {
     this.shutdown();
     this.scene.start('MenuScene');
   }
   ```

#### Exit Criteria
- [ ] Config passes from MenuScene to MainScene
- [ ] Ant count from slider applies correctly
- [ ] Theme from selector applies correctly
- [ ] R key returns to menu
- [ ] Returning to menu preserves previous config (optional)

---

### Segment 6: Polish & Final Integration

**Goal:** Refinements, styling, and edge case handling.

#### Files to Modify
- `src/scenes/MenuScene.ts` — Polish, animations, styling
- `src/config.ts` — Add MENU_CONFIG for styling constants

#### Tasks

1. **Menu Styling Constants**
   ```typescript
   export const MENU_CONFIG = {
     TITLE: {
       TEXT: 'Ants.Game',
       FONT_SIZE: '48px',
       COLOR: '#ffffff',
       Y_POSITION: 100,
     },
     TAGLINE: {
       TEXT: 'Observe. Adapt. Survive.',
       FONT_SIZE: '20px',
       COLOR: '#cccccc',
       Y_POSITION: 160,
     },
     BUTTON: {
       FONT_SIZE: '24px',
       COLOR: '#ffffff',
       BACKGROUND_COLOR: '#4a7c4e',
       HOVER_COLOR: '#5a8c5e',
       PADDING: { x: 30, y: 15 },
     },
   } as const;
   ```

2. **Button Hover Effects**
   ```typescript
   startButton.on('pointerover', () => {
     startButton.setStyle({ backgroundColor: MENU_CONFIG.BUTTON.HOVER_COLOR });
   });
   startButton.on('pointerout', () => {
     startButton.setStyle({ backgroundColor: MENU_CONFIG.BUTTON.BACKGROUND_COLOR });
   });
   ```

3. **Smooth Config Panel Animation**
   ```typescript
   private toggleConfigPanel(): void {
     this.isConfigOpen = !this.isConfigOpen;
     
     if (this.isConfigOpen) {
       this.configPanel.setVisible(true);
       this.tweens.add({
         targets: this.configPanel,
         alpha: { from: 0, to: 1 },
         y: { from: -50, to: 0 },
         duration: 300,
         ease: 'Power2',
       });
     } else {
       this.tweens.add({
         targets: this.configPanel,
         alpha: { from: 1, to: 0 },
         duration: 200,
         ease: 'Power2',
         onComplete: () => {
           this.configPanel.setVisible(false);
         },
       });
     }
   }
   ```

4. **Default Value Indicators**
   - Show "(default)" next to default selections
   - Highlight changes from defaults
   - Reset to defaults button

5. **Keyboard Shortcuts**
   - ESC closes config panel
   - ENTER starts simulation
   - R restarts (from main scene)

#### Exit Criteria
- [ ] Menu looks polished and professional
- [ ] Animations are smooth and natural
- [ ] Keyboard shortcuts work
- [ ] Hover effects on buttons
- [ ] No visual glitches or artifacts
- [ ] Text is readable over background

---

## Testing & Validation

### Manual Testing Checklist

1. **Menu Loading**
   - [ ] Menu appears immediately on game start
   - [ ] Background ants spawn and move naturally
   - [ ] Title and tagline display correctly
   - [ ] Performance stable at 60 FPS

2. **Start Button**
   - [ ] Clicking starts simulation
   - [ ] MainScene loads without errors
   - [ ] Default config (40 ants, default theme) applies

3. **Ant Count Configuration**
   - [ ] Slider range: 10-100 ants
   - [ ] Dragging updates displayed value
   - [ ] Selected count applies to simulation
   - [ ] Edge cases: 10 ants (min) and 100 ants (max)

4. **Theme Selection**
   - [ ] All three themes selectable
   - [ ] Theme preview visible in menu (optional)
   - [ ] Selected theme applies to main simulation
   - [ ] Colors update correctly for ants and pheromones

5. **Scene Transitions**
   - [ ] Menu → MainScene smooth
   - [ ] MainScene → Menu on restart
   - [ ] Config persists across restarts (optional)
   - [ ] No memory leaks or dangling resources

6. **Config Panel**
   - [ ] Opens and closes smoothly
   - [ ] Apply button starts with config
   - [ ] Cancel button discards changes
   - [ ] ESC key closes panel
   - [ ] Background dims when open

7. **Edge Cases**
   - [ ] Rapidly clicking Start button (no double scene start)
   - [ ] Changing config while simulation runs in background
   - [ ] Very low ant counts (< 20) still playable
   - [ ] Very high ant counts (100) maintain performance

### Performance Checks

- [ ] Menu scene: 60 FPS with 15 background ants
- [ ] MainScene: 60 FPS with 100 ants (max config)
- [ ] Scene transitions: < 100ms (imperceptible)
- [ ] No frame drops when opening config panel
- [ ] Memory usage stable (no leaks on restart)

### Visual Validation

- [ ] Text readable over ant movement
- [ ] Button contrast sufficient
- [ ] Themes look distinct and intentional
- [ ] High Contrast theme improves readability
- [ ] Black & White theme maintains clarity

---

## Architecture Notes

### Design Consistency

**Maintains Separation of Concerns:**
- MenuScene is Phaser-specific (scenes/)
- GameConfig is engine-agnostic (types/)
- Theme definitions are pure data (config.ts)
- Simulation logic unchanged (sim/ untouched)

**Configuration-Driven:**
- All menu styling in MENU_CONFIG
- All theme definitions in THEME_CONFIG
- Easy to add new themes without code changes
- Config passed via Phaser's scene data system

### Future Extensions

**Phase 6+ Integration:**
- Menu could show colony stats from previous run
- "Continue Last Simulation" option (save/load)
- Difficulty presets (Easy/Normal/Hard)
- Advanced options: food spawn rate, energy consumption multiplier

**Theme Extensions:**
- Custom color pickers (advanced users)
- Import/export theme JSON
- Community-submitted themes
- Seasonal themes (Halloween, Winter)

**Configuration Extensions:**
- Starting food amount
- World size selection
- Pheromone system toggles (for learning)
- Speed controls (slow-mo observation mode)

### Phaser Scene Best Practices

**Scene Lifecycle:**
1. `init(data)` — Receive config data
2. `create()` — Initialize scene, spawn entities
3. `update(time, delta)` — Per-frame simulation
4. `shutdown()` — Clean up resources

**Resource Management:**
- Destroy graphics objects in shutdown()
- Remove event listeners
- Stop tweens
- Clear containers

**Data Passing:**
```typescript
// From MenuScene
this.scene.start('MainScene', { antCount: 40, theme: 'default' });

// In MainScene.create()
const config = this.scene.settings.data as GameConfig;
```

---

## Success Criteria Summary

**Phase 5 is successful when:**
1. Menu loads as first screen with living background
2. Players can configure ant count and theme
3. Configuration applies correctly to simulation
4. Scene transitions are smooth and bug-free
5. Default settings allow immediate play (no config required)
6. Menu feels calm, minimal, and inviting
7. System runs at 60 FPS in both menu and game
8. Theme system is extensible for future additions

**Phase 5 is NOT about:**
- Complex save/load systems (that's Phase 8+)
- Gameplay tutorials (that's Phase 7+)
- Advanced graphics settings (keep it simple)
- Achievements or progression systems

---

## Implementation Order

**Recommended segment sequence:**
1. Segment 1: MenuScene foundation (static menu)
2. Segment 2: Living background simulation
3. Segment 3: Ant count slider
4. Segment 4: Theme system
5. Segment 5: Scene lifecycle integration
6. Segment 6: Polish and animations

**Testing between each segment:**
- Segment 1 done? → Verify menu loads, button works
- Segment 2 done? → Watch ants move behind UI
- Segment 3 done? → Test slider, verify ant count applies
- Segment 4 done? → Switch themes, check colors
- Segment 5 done? → Restart and return to menu
- Segment 6 done? → Polish looks good, no bugs

---

**Estimated effort**: 3-4 hours of development + polish
**Complexity**: Low-Medium (mostly UI work, minimal simulation changes)
**Risk**: Low (isolated to new MenuScene, doesn't affect existing game logic)
