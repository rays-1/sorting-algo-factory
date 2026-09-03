import type { FactoryAction, SortingGenerator } from "@/types/sorting";

export const mergeSort: SortingGenerator = function* (array: number[]) {
  const a = [...array];
  const n = a.length;
  if (n <= 1) {
    if (n === 1) yield { type: "BATCH_SORTED", start: 0, end: 0 };
    return;
  }
  const aux = [...a];

  function* merge(lo: number, mid: number, hi: number): Generator<FactoryAction> {
    let i = lo;
    let j = mid + 1;
    let k = lo;
    // copy to aux before merge step is needed for overwrite visualization
    // we keep aux as snapshot of current merged state.
    while (i <= mid && j <= hi) {
      yield { type: "COMPARE", indices: [i, j] };
      if (aux[i] <= aux[j]) {
        a[k] = aux[i];
        yield { type: "OVERWRITE", index: k, value: aux[i] };
        i++;
      } else {
        a[k] = aux[j];
        yield { type: "OVERWRITE", index: k, value: aux[j] };
        j++;
      }
      k++;
    }
    while (i <= mid) {
      a[k] = aux[i];
      yield { type: "OVERWRITE", index: k, value: aux[i] };
      i++; k++;
    }
    while (j <= hi) {
      a[k] = aux[j];
      yield { type: "OVERWRITE", index: k, value: aux[j] };
      j++; k++;
    }
    for (let x = lo; x <= hi; x++) aux[x] = a[x];
  }

  function* ms(lo: number, hi: number): Generator<FactoryAction> {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    yield* ms(lo, mid);
    yield* ms(mid + 1, hi);
    yield* merge(lo, mid, hi);
  }

  yield* ms(0, n - 1);
  yield { type: "BATCH_SORTED", start: 0, end: n - 1 };
};
