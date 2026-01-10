/**
 * TileType enum for underground world grid.
 * 
 * Tiles represent the state of underground terrain:
 * - DIRT: Unexcavated soil (can be dug by ants)
 * - TUNNEL: Excavated passage (ants can move through)
 * - CHAMBER: Large excavated space (special purpose rooms)
 * - ENTRANCE: Connection point between surface and underground
 */

export enum TileType {
  DIRT = 'DIRT',
  TUNNEL = 'TUNNEL',
  CHAMBER = 'CHAMBER',
  ENTRANCE = 'ENTRANCE',
}
