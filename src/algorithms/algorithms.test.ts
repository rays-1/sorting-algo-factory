import { describe, expect, it } from "vitest";
import type { FactoryAction, SortingGenerator } from "@/types/sorting";
import { registry } from "./index";

const FIXTURES: { name: string; input: number[] }[] = [
  { name: "empty", input: [] },
  { name: "single", input: [42] },
  { name: "two sorted", input: [1, 2] },
  { name: "two reversed", input: [2, 1] },
  { name: "random", input: [5, 3, 8, 1, 9, 2, 7, 4, 6] },
  { name: "reversed", input: [9, 8, 7, 6, 5, 4, 3, 2, 1] },
  { name: "sorted", input: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
  { name: "duplicates", input: [5, 5, 2, 8, 2, 5, 1, 8, 1] },
  { name: "all equal", input: [7, 7, 7, 7, 7] },
  { name: "larger", input: [64, 25, 12, 22, 11, 90, 33, 47, 58, 71, 3, 19, 84, 55, 41] },
];

// Replay a generator's actions against a copy, like the store does.
function applyActions(input: number[], actions: FactoryAction[]): number[] {
  const a = [...input];
  for (const act of actions) {
    if (act.type === "SWAP") {
      const [i, j] = act.indices;
      expect(i).toBeGreaterThanOrEqual(0);
      expect(j).toBeLessThan(a.length);
      [a[i], a[j]] = [a[j], a[i]];
    } else if (act.type === "OVERWRITE") {
      expect(act.index).toBeGreaterThanOrEqual(0);
      expect(act.index).toBeLessThan(a.length);
      a[act.index] = act.value;
    } else if (act.type === "COMPARE") {
      const [i, j] = act.indices;
      expect(i).toBeGreaterThanOrEqual(0);
      expect(j).toBeLessThan(a.length);
    }
  }
  return a;
}

for (const [id, meta] of Object.entries(registry)) {
  describe(meta.longName, () => {
    const gen = meta.generator as SortingGenerator;
    for (const { name, input } of FIXTURES) {
      it(`sorts ${name}`, () => {
        const snapshot = [...input];
        const actions = [...gen(input)];
        // generator must not mutate its input
        expect(input).toEqual(snapshot);
        // replay must terminate with a bounded action count
        expect(actions.length).toBeLessThan(20_000);
        expect(applyActions(input, actions)).toEqual([...input].sort((x, y) => x - y));
      });
    }

    it("marks every index sorted on completion", () => {
      const input = [4, 2, 5, 1, 3];
      const actions = [...gen(input)];
      const marked = new Set<number>();
      for (const a of actions) {
        if (a.type === "MARK_SORTED") marked.add(a.index);
        else if (a.type === "BATCH_SORTED") {
          for (let i = a.start; i <= a.end; i++) marked.add(i);
        }
      }
      for (let i = 0; i < input.length; i++) {
        expect(marked.has(i), `index ${i} never marked sorted by ${id}`).toBe(true);
      }
    });
  });
}
