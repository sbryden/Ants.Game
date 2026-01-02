import { Obstacle } from '../Obstacle';
import { Ant } from '../Ant';

/**
 * PerceptionData encapsulates what an ant can perceive from its environment.
 * This is the "input" to behavior decision-making systems.
 * 
 * Extension point: Future perception will include:
 * - Pheromone concentrations by type
 * - Nearby ants (friend/foe)
 * - Food sources
 * - Threats or dangers
 * 
 * For now (Phase 1), we track obstacles and basic spatial awareness.
 */
export interface PerceptionData {
  /**
   * Obstacles within perception range
   */
  nearbyObstacles: Obstacle[];

  /**
   * Distance to nearest obstacle (Infinity if none)
   */
  nearestObstacleDistance: number;

  /**
   * Distance to home colony
   */
  distanceToHome: number;

  /**
   * Direction to home colony (radians)
   */
  directionToHome: number;

  // Extension points for future phases:
  // pheromoneConcentrations?: Map<PheromoneType, number>;
  // nearbyAnts?: Ant[];
  // nearbyFood?: FoodSource[];
  // nearbyThreats?: Threat[];
}
