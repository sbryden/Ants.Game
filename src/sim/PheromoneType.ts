/**
 * Pheromone types for ant communication
 * Different types allow for complex emergent behaviors
 */
export enum PheromoneType {
  /**
   * Food pheromone - laid by ants that have found food
   * Creates trails leading to food sources
   */
  FOOD = 'FOOD',

  /**
   * Nest pheromone - laid by all active ants
   * Creates trails leading back to the colony
   */
  NEST = 'NEST',

  /**
   * Danger pheromone - laid near threats or obstacles
   * Warns other ants to avoid an area
   */
  DANGER = 'DANGER',
}
