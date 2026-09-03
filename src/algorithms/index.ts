import type { AlgorithmMeta } from "@/types/sorting";
import { bubbleSort } from "./bubbleSort";
import { insertionSort } from "./insertionSort";
import { mergeSort } from "./mergeSort";
import { quickSort } from "./quickSort";

export const registry: Record<string, AlgorithmMeta> = {
  bubble: {
    id: "bubble",
    name: "BUBBLE SORT",
    longName: "Bubble Sort",
    generator: bubbleSort,
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: true,
    description: "Repeated adjacent swaps. Large elements bubble to the end.",
    method: "EXCHANGE / BRUTE",
  },
  quick: {
    id: "quick",
    name: "QUICK SORT",
    longName: "Quick Sort",
    generator: quickSort,
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    stable: false,
    description: "Lomuto partition, divide and conquer.",
    method: "PARTITION / DIVIDE",
  },
  merge: {
    id: "merge",
    name: "MERGE SORT",
    longName: "Merge Sort",
    generator: mergeSort,
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    stable: true,
    description: "Stable divide and conquer with overwrite merging.",
    method: "MERGE / DIVIDE",
  },
  insertion: {
    id: "insertion",
    name: "INSERTION SORT",
    longName: "Insertion Sort",
    generator: insertionSort,
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: true,
    description: "Builds sorted prefix one element at a time.",
    method: "INCREMENTAL",
  },
};

export const algorithmList = Object.values(registry);
export const defaultAlgorithmId = "quick" as const;
