// FactoryAction — strict separation: algorithms know nothing about 3D
export type FactoryAction =
  | { type: "COMPARE"; indices: [number, number] }
  | { type: "SWAP"; indices: [number, number] }
  | { type: "OVERWRITE"; index: number; value: number }
  | { type: "SET_PIVOT"; index: number }
  | { type: "CLEAR_PIVOT" }
  | { type: "MARK_SORTED"; index: number }
  | { type: "BATCH_SORTED"; start: number; end: number };

export type SortingGenerator = (
  array: number[],
) => Generator<FactoryAction, void, unknown>;

export type AlgorithmId = "bubble" | "quick" | "merge" | "insertion";

export type AlgorithmMeta = {
  id: AlgorithmId;
  name: string;
  longName: string;
  generator: SortingGenerator;
  best: string;
  average: string;
  worst: string;
  space: string;
  stable: boolean;
  description: string;
  method: string;
};

export type PlaybackState = "idle" | "playing" | "paused" | "finished";
export type CameraPreset = "overview" | "inspection" | "gantry" | "topo";
export type DatasetType =
  | "random"
  | "reversed"
  | "nearly"
  | "sorted"
  | "duplicates";
