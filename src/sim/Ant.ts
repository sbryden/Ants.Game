import { AntState } from './AntState';

/**
 * Pure data structure representing a single ant
 * No Phaser dependencies - this is engine-agnostic simulation data
 */
export class Ant {
  public id: number;
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public state: AntState;
  public colonyId: number;

  constructor(id: number, x: number, y: number, colonyId: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.state = AntState.IDLE;
    this.colonyId = colonyId;
  }

  /**
   * Update ant position based on velocity
   * Simple integration for MVP - no collision detection yet
   */
  public updatePosition(deltaTime: number): void {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
  }

  /**
   * Set random movement direction
   * Used for basic wandering behavior in MVP
   */
  public setRandomVelocity(speed: number): void {
    const angle = Math.random() * Math.PI * 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.state = AntState.MOVING;
  }
}
