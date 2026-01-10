/**
 * Entrance entity - connection point between surface and underground layers.
 * 
 * The entrance is a shared entity visible on both layers:
 * - Surface: Appears as a hole in the ground
 * - Underground: Appears as a tunnel opening at the top
 * 
 * Ants use the entrance to transition between layers.
 */

export interface Entrance {
  /** Surface-layer position (top-down view) */
  surfaceX: number;
  surfaceY: number;
  
  /** Underground-layer position (side-view) */
  undergroundX: number;
  undergroundY: number;
  
  /** Visual radius for rendering */
  radius: number;
}

export function createEntrance(
  surfaceX: number,
  surfaceY: number,
  undergroundX: number,
  undergroundY: number,
  radius: number = 10
): Entrance {
  return {
    surfaceX,
    surfaceY,
    undergroundX,
    undergroundY,
    radius,
  };
}
