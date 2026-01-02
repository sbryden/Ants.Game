import { World } from '../sim/World';
import { Ant } from '../sim/Ant';
import { AntState } from '../sim/AntState';

/**
 * SimulationSystem orchestrates the simulation update loop
 * Deterministic updates for ants, movement, and future pheromone logic
 * Operates on engine-agnostic simulation data
 */
export class SimulationSystem {
  private world: World;
  private antSpeed: number = 50; // pixels per second
  private changeDirectionInterval: number = 2; // seconds
  private timeSinceLastChange: Map<number, number>;

  constructor(world: World) {
    this.world = world;
    this.timeSinceLastChange = new Map();
  }

  /**
   * Main update loop called each frame
   * @param deltaTime - time elapsed since last frame in seconds
   */
  public update(deltaTime: number): void {
    const ants = this.world.getAllAnts();

    for (const ant of ants) {
      this.updateAnt(ant, deltaTime);
    }
  }

  /**
   * Update a single ant's state and position
   * For MVP: simple random walk behavior with periodic direction changes
   */
  private updateAnt(ant: Ant, deltaTime: number): void {
    // Track time for direction changes
    const timeSinceChange = this.timeSinceLastChange.get(ant.id) || 0;
    const updatedTimeSinceChange = timeSinceChange + deltaTime;

    // Change direction periodically for wandering behavior
    if (updatedTimeSinceChange >= this.changeDirectionInterval) {
      ant.setRandomVelocity(this.antSpeed);
      this.timeSinceLastChange.set(ant.id, 0);
    } else {
      this.timeSinceLastChange.set(ant.id, updatedTimeSinceChange);
      // If idle and we didn't just change direction, start moving
      if (ant.state === AntState.IDLE) {
        ant.setRandomVelocity(this.antSpeed);
      }
    }

    // Update position
    ant.updatePosition(deltaTime);

    // Keep ant within world bounds (simple bounce)
    this.bounceOffWalls(ant);
  }

  /**
   * Bounce ant off world boundaries
   * Simple collision response - reverses velocity component when hitting a wall
   * Boundaries are exclusive (0 and width/height are valid positions)
   */
  private bounceOffWalls(ant: Ant): void {
    if (ant.x < 0 || ant.x > this.world.width) {
      ant.vx *= -1;
      ant.x = Math.max(0, Math.min(this.world.width, ant.x));
    }

    if (ant.y < 0 || ant.y > this.world.height) {
      ant.vy *= -1;
      ant.y = Math.max(0, Math.min(this.world.height, ant.y));
    }
  }

  /**
   * Initialize world with a colony and some ants
   * Called once at startup
   */
  public initializeWorld(): void {
    const colony = this.world.createColony(
      this.world.width / 2,
      this.world.height / 2
    );

    // Spawn initial ants for MVP
    const initialAntCount = 20;
    for (let i = 0; i < initialAntCount; i++) {
      const ant = this.world.spawnAnt(colony);
      // Start with random velocity
      ant.setRandomVelocity(this.antSpeed);
    }
  }
}
