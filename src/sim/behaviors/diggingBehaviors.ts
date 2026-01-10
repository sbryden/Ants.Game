import { Ant } from '../Ant';
import { UndergroundWorld } from '../UndergroundWorld';
import { TileType } from '../TileType';
import { AntState } from '../AntState';

/**
 * Digging behavior for ants underground.
 * 
 * Ants in DIGGING state will:
 * - Select an adjacent DIRT tile
 * - Convert it to TUNNEL
 * - Add organic randomness to tunnel shapes
 * - Widen existing tunnels over time
 */

const DIGGING_DURATION = 2.0; // Seconds to dig one tile
const DIGGING_SEARCH_RADIUS = 30; // Pixels to search for diggable tiles

/**
 * Check if ant is underground and should consider digging.
 */
export function canDig(ant: Ant): boolean {
  return ant.currentLayer === 'underground' && ant.state === AntState.IDLE;
}

/**
 * Find the nearest diggable tile (DIRT) adjacent to tunnels.
 * Returns grid coordinates or null if none found.
 */
export function findDiggableTile(
  ant: Ant,
  undergroundWorld: UndergroundWorld
): { x: number; y: number } | null {
  const gridPos = undergroundWorld.worldToGrid(ant.x, ant.y);
  
  // Search in expanding radius
  for (let radius = 1; radius <= 3; radius++) {
    const candidates: { x: number; y: number; distance: number }[] = [];
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const checkX = gridPos.x + dx;
        const checkY = gridPos.y + dy;
        
        // Must be DIRT
        if (!undergroundWorld.isDiggable(checkX, checkY)) continue;
        
        // Must be adjacent to a passable tile (tunnel/chamber)
        let adjacentToTunnel = false;
        for (let ady = -1; ady <= 1; ady++) {
          for (let adx = -1; adx <= 1; adx++) {
            if (adx === 0 && ady === 0) continue;
            if (undergroundWorld.isPassable(checkX + adx, checkY + ady)) {
              adjacentToTunnel = true;
              break;
            }
          }
          if (adjacentToTunnel) break;
        }
        
        if (adjacentToTunnel) {
          const worldPos = undergroundWorld.gridToWorld(checkX, checkY);
          const distance = Math.sqrt(
            Math.pow(worldPos.x - ant.x, 2) + Math.pow(worldPos.y - ant.y, 2)
          );
          candidates.push({ x: checkX, y: checkY, distance });
        }
      }
    }
    
    // Return closest candidate
    if (candidates.length > 0) {
      candidates.sort((a, b) => a.distance - b.distance);
      return { x: candidates[0].x, y: candidates[0].y };
    }
  }
  
  return null;
}

/**
 * Start digging behavior for an ant.
 * Transitions ant to DIGGING state and sets target tile.
 */
export function startDigging(
  ant: Ant,
  targetTile: { x: number; y: number },
  undergroundWorld: UndergroundWorld
): void {
  ant.state = AntState.DIGGING;
  ant.timeInCurrentState = 0;
  
  // Move ant to digging position (center of target tile)
  const worldPos = undergroundWorld.gridToWorld(targetTile.x, targetTile.y);
  ant.x = worldPos.x;
  ant.y = worldPos.y;
  ant.vx = 0;
  ant.vy = 0;
  ant.targetVx = 0;
  ant.targetVy = 0;
}

/**
 * Update digging progress for an ant.
 * Converts DIRT to TUNNEL when duration complete.
 * 
 * @returns true if digging completed this frame
 */
export function updateDigging(
  ant: Ant,
  deltaTime: number,
  undergroundWorld: UndergroundWorld
): boolean {
  if (ant.state !== AntState.DIGGING) return false;
  
  ant.timeInCurrentState += deltaTime;
  
  // Check if digging complete
  if (ant.timeInCurrentState >= DIGGING_DURATION) {
    // Find the tile we're digging
    const gridPos = undergroundWorld.worldToGrid(ant.x, ant.y);
    
    // Convert to tunnel with organic variation
    const shouldBeChamber = Math.random() < 0.1; // 10% chance of wider chamber
    const tileType = shouldBeChamber ? TileType.CHAMBER : TileType.TUNNEL;
    undergroundWorld.setTile(gridPos.x, gridPos.y, tileType);
    
    // Occasionally widen adjacent tunnels (organic expansion)
    if (Math.random() < 0.3) {
      const widthOffsetX = Math.random() < 0.5 ? -1 : 1;
      const widthOffsetY = Math.random() < 0.5 ? -1 : 1;
      if (undergroundWorld.isDiggable(gridPos.x + widthOffsetX, gridPos.y)) {
        undergroundWorld.setTile(gridPos.x + widthOffsetX, gridPos.y, TileType.TUNNEL);
      }
      if (undergroundWorld.isDiggable(gridPos.x, gridPos.y + widthOffsetY)) {
        undergroundWorld.setTile(gridPos.x, gridPos.y + widthOffsetY, TileType.TUNNEL);
      }
    }
    
    // Return to IDLE state
    ant.state = AntState.IDLE;
    ant.timeInCurrentState = 0;
    return true;
  }
  
  return false;
}

/**
 * Check if underground ant should spontaneously start digging.
 * Returns true probabilistically based on colony needs.
 */
export function shouldStartDigging(ant: Ant): boolean {
  // Only idle underground ants
  if (ant.currentLayer !== 'underground' || ant.state !== AntState.IDLE) {
    return false;
  }
  
  // 5% chance per frame to start digging (will be refined in Phase 7F)
  return Math.random() < 0.05;
}
