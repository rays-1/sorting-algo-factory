import type { SortingGenerator } from "@/types/sorting";

export const insertionSort: SortingGenerator = function* (array: number[]) {
  const a = [...array];
  const n = a.length;
  if (n <= 1) {
    if (n === 1) yield { type: "BATCH_SORTED", start: 0, end: 0 };
    return;
  }
  for (let i = 1; i < n; i++) {
    for (let j = i; j > 0; j--) {
      yield { type: "COMPARE", indices: [j, j - 1] };
      if (a[j] < a[j - 1]) {
        [a[j], a[j - 1]] = [a[j - 1], a[j]];
        yield { type: "SWAP", indices: [j, j - 1] };
      } else break;
    }
  }
  yield { type: "BATCH_SORTED", start: 0, end: n - 1 };
};
