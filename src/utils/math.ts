import * as THREE from "three";

// Strict slot → world position mapping. Centralized.
export const SLOT_GAP = 1.6;
export const SLOT_ORIGIN = 0;

export function getSlotPosition(index: number, opts?: { gap?: number; y?: number; z?: number }): THREE.Vector3 {
  const gap = opts?.gap ?? SLOT_GAP;
  const y = opts?.y ?? 0;
  const z = opts?.z ?? 0;
  const total = gap; // gap per slot
  // center array at 0
  return new THREE.Vector3(index * total + SLOT_ORIGIN, y, z);
}

export function getSlotX(index: number, count: number, gap = SLOT_GAP): number {
  const totalWidth = (count - 1) * gap;
  return index * gap - totalWidth / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
