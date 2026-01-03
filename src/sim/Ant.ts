import { AntState } from './AntState';

/**
 * Pure data structure representing a single ant
 * No methods, no behavior logic - just state
 * Behavior is applied via pure functions in behaviors/
 * No Phaser dependencies - this is engine-agnostic simulation data
 */
export class Ant {
  // Core identity and position
  public id: number;
  public x: number;
  public y: number;
  public vx: number; // Current velocity
  public vy: number;
  public targetVx: number; // Desired velocity (for inertia/smooth turning)
  public targetVy: number;
  public state: AntState;
  public colonyId: number;

  // Behavior timing state
  // Stored here instead of in the system to support deterministic simulation
  public timeSinceDirectionChange: number;
  public timeInCurrentState: number; // Time spent in current state (for transitions)

  // Perception properties
  public perceptionRange: number; // How far ant can "see" environment

  // Resource carrying state
  public carriedFood: number = 0; // Food units currently being carried

  // Survival and metabolism
  public energy: number = 100; // 0-100 energy scale
  public lastEnergyConsumption: number = 0; // Energy spent in last frame

  // Extension points for future systems (not yet implemented)
  // These will remain unused until Phase 2+
  // TODO: Add pheromone detection data structure
  // TODO: Add trait/role enum
  // TODO: Add task/goal reference

  constructor(id: number, x: number, y: number, colonyId: number, perceptionRange: number = 100) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.targetVx = 0;
    this.targetVy = 0;
    this.state = AntState.IDLE;
    this.colonyId = colonyId;
    this.timeSinceDirectionChange = 0;
    this.timeInCurrentState = 0;
    this.perceptionRange = perceptionRange;
    this.energy = 100;
    this.lastEnergyConsumption = 0;
  }
}
