import type { FactoryAction, SortingGenerator } from "@/types/sorting";

function* partition(a: number[], lo: number, hi: number): Generator<FactoryAction, number> {
  const pivot = a[hi];
  yield { type: "SET_PIVOT", index: hi };
  let i = lo;
  for (let j = lo; j < hi; j++) {
    yield { type: "COMPARE", indices: [j, hi] };
    // show comparison against pivot value via highlight
    if (a[j] < pivot) {
      if (i !== j) {
        [a[i], a[j]] = [a[j], a[i]];
        yield { type: "SWAP", indices: [i, j] };
      }
      i++;
    }
  }
  if (i !== hi) {
    [a[i], a[hi]] = [a[hi], a[i]];
    yield { type: "SWAP", indices: [i, hi] };
  }
  yield { type: "CLEAR_PIVOT" };
  return i;
}

export const quickSort: SortingGenerator = function* (array: number[]) {
  const a = [...array];
  const n = a.length;
  if (n <= 1) {
    if (n === 1) yield { type: "BATCH_SORTED", start: 0, end: 0 };
    return;
  }

  function* qs(lo: number, hi: number): Generator<FactoryAction> {
    if (lo >= hi) {
      if (lo === hi) yield { type: "MARK_SORTED", index: lo };
      return;
    }
    const p: number = yield* partition(a, lo, hi);
    yield { type: "MARK_SORTED", index: p };
    yield* qs(lo, p - 1);
    yield* qs(p + 1, hi);
  }

  yield* qs(0, n - 1);
  // safety batch for any unmarked (already marked partitions cover all)
};
