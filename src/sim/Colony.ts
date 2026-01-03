import { Ant } from './Ant';
import { COLONY_CONFIG, PERCEPTION_CONFIG } from '../config';

/**
 * Colony data structure
 * Manages a group of ants and colony-level state
 */
export class Colony {
  public id: number;
  public x: number; // Colony center position
  public y: number;
  public ants: Ant[];

  // Resource and metabolism tracking
  public foodStored: number;
  public foodConsumedRate: number;
  public foodGatheredRate: number;
  public surplusRate: number;

  private gatheredThisFrame: number;
  private consumedThisFrame: number;

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.ants = [];

    this.foodStored = 0;
    this.foodConsumedRate = 0;
    this.foodGatheredRate = 0;
    this.surplusRate = 0;

    this.gatheredThisFrame = 0;
    this.consumedThisFrame = 0;
  }

  /**
   * Spawn a new ant at the colony location
   */
  public spawnAnt(antId: number): Ant {
    const ant = new Ant(antId, this.x, this.y, this.id, PERCEPTION_CONFIG.PERCEPTION_RANGE);
    this.ants.push(ant);
    return ant;
  }

  /**
   * Prepare per-frame metric accumulators
   */
  public beginFrame(): void {
    this.gatheredThisFrame = 0;
    this.consumedThisFrame = 0;
  }

  /**
   * Record food deposited into the colony
   */
  public addFood(amount: number): void {
    if (amount <= 0) return;
    this.foodStored += amount;
    this.gatheredThisFrame += amount;
  }

  /**
   * Consume food from storage; returns actual consumed amount
   */
  public consumeFood(requested: number): number {
    if (requested <= 0 || this.foodStored <= 0) {
      return 0;
    }

    const consumed = Math.min(requested, this.foodStored);
    this.foodStored -= consumed;
    this.consumedThisFrame += consumed;
    return consumed;
  }

  /**
   * Update smoothed metrics after a frame
   */
  public finalizeFrame(deltaTime: number): void {
    const dt = Math.max(deltaTime, 0.0001);
    const frameGatherRate = this.gatheredThisFrame / dt;
    const frameConsumeRate = this.consumedThisFrame / dt;
    const smoothing = COLONY_CONFIG.METRICS_SMOOTHING_FACTOR;

    this.foodGatheredRate = this.lerp(this.foodGatheredRate, frameGatherRate, smoothing);
    this.foodConsumedRate = this.lerp(this.foodConsumedRate, frameConsumeRate, smoothing);
    this.surplusRate = this.foodGatheredRate - this.foodConsumedRate;
  }

  /**
   * Compute health status based on stored food and population
   */
  public getHealthStatus(): 'healthy' | 'struggling' | 'critical' | 'dead' {
    const population = this.getPopulation();
    if (population === 0) return 'dead';
    if (this.foodStored === 0) return 'critical';

    const safetyThreshold = population * COLONY_CONFIG.SAFETY_FOOD_PER_ANT;
    if (this.foodStored < safetyThreshold) return 'struggling';
    return 'healthy';
  }

  /**
   * Average energy across living ants
   */
  public getAverageEnergy(): number {
    const ants = this.ants;
    if (ants.length === 0) return 0;
    const total = ants.reduce((sum, ant) => sum + ant.energy, 0);
    return total / ants.length;
  }

  /**
   * Get all ants belonging to this colony (shallow copy for safety)
   */
  public getAnts(): Ant[] {
    return [...this.ants];
  }

  /**
   * Get the count of ants in this colony
   */
  public getAntCount(): number {
    return this.ants.length;
  }

  /**
   * Alias for readability when working with colony population
   */
  public getPopulation(): number {
    return this.ants.length;
  }

  private lerp(current: number, target: number, factor: number): number {
    return current + (target - current) * factor;
  }
}
