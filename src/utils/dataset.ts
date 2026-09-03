import type { DatasetType } from "@/types/sorting";

export function generateDataset(
  type: DatasetType,
  size: number,
  maxValue: number = 100,
): number[] {
  const clamp = (n: number) => Math.max(5, Math.min(maxValue, Math.round(n)));
  switch (type) {
    case "random":
      return Array.from({ length: size }, () => clamp(Math.random() * maxValue));
    case "reversed":
      return Array.from({ length: size }, (_, i) =>
        clamp(((size - i) / size) * maxValue),
      );
    case "sorted":
      return Array.from({ length: size }, (_, i) =>
        clamp(((i + 1) / size) * maxValue),
      );
    case "nearly": {
      const arr = Array.from({ length: size }, (_, i) =>
        clamp(((i + 1) / size) * maxValue),
      );
      // swap ~15%
      const swaps = Math.max(1, Math.floor(size * 0.15));
      for (let k = 0; k < swaps; k++) {
        const a = Math.floor(Math.random() * size);
        const b = Math.floor(Math.random() * size);
        [arr[a], arr[b]] = [arr[b], arr[a]];
      }
      return arr;
    }
    case "duplicates": {
      // only 4 distinct values
      const pool = [12, 34, 56, 82];
      return Array.from(
        { length: size },
        () => pool[Math.floor(Math.random() * pool.length)],
      );
    }
    default:
      return Array.from({ length: size }, () => clamp(Math.random() * maxValue));
  }
}

export const DATASET_LABELS: Record<DatasetType, string> = {
  random: "RANDOM",
  reversed: "REVERSED",
  nearly: "NEARLY SORTED",
  sorted: "SORTED",
  duplicates: "DUPLICATES",
};
