import type { SortingGenerator } from "@/types/sorting";

export const bubbleSort: SortingGenerator = function* (array: number[]) {
  const a = [...array];
  const n = a.length;
  if (n <= 1) {
    if (n === 1) yield { type: "BATCH_SORTED", start: 0, end: 0 };
    return;
  }
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      yield { type: "COMPARE", indices: [j, j + 1] };
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield { type: "SWAP", indices: [j, j + 1] };
        swapped = true;
      }
    }
    yield { type: "MARK_SORTED", index: n - 1 - i };
    if (!swapped) {
      // mark remaining as sorted
      if (n - 1 - i > 0) yield { type: "BATCH_SORTED", start: 0, end: n - 2 - i };
      return;
    }
  }
  yield { type: "MARK_SORTED", index: 0 };
};
