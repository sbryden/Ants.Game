import { Obstacle } from '../Obstacle';
import { PheromoneType } from '../PheromoneType';
import { GradientSamples } from './pheromoneBehaviors';

/**
 * PerceptionData encapsulates what an ant can perceive from its environment.
 * This is the "input" to behavior decision-making systems.
 * 
 * Extension point: Future perception will include:
 * - Nearby ants (friend/foe)
 * - Food sources
 * - Threats or dangers
 * 
 * Phase 1: Basic spatial awareness
 * Phase 2: Pheromone gradient sensing (this phase)
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

  /**
   * Pheromone gradient readings by type
   * Maps pheromone types to gradient samples in 8 directions
   * Used by foraging ants to follow trails laid by other ants
   */
  pheromoneGradients: Map<PheromoneType, GradientSamples>;

  // Extension points for future phases:
  // nearbyAnts?: Ant[];
  // nearbyFood?: FoodSource[];
  // nearbyThreats?: Threat[];
}
