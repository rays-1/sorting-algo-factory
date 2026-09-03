// Strict slot → world position mapping. Centralized — never scatter
// slot calculations throughout individual components.
export const SLOT_GAP = 1.6;

export function getSlotX(index: number, count: number, gap = SLOT_GAP): number {
  const totalWidth = (count - 1) * gap;
  return index * gap - totalWidth / 2;
}
