import { create } from "zustand";
import type {
  AlgorithmId,
  CameraPreset,
  DatasetType,
  FactoryAction,
  PlaybackState,
} from "@/types/sorting";
import { generateDataset } from "@/utils/dataset";
import { defaultAlgorithmId, registry } from "@/algorithms";

const _initDs = generateDataset("random", 18);

type FactoryStore = {
  // data
  dataset: number[];
  workingArray: number[];
  datasetType: DatasetType;
  arraySize: number;

  // algo
  algorithmId: AlgorithmId;
  actions: FactoryAction[];
  actionIndex: number; // next action to execute
  currentAction: FactoryAction | null;

  // playback
  playbackState: PlaybackState;
  speed: number; // 0.25 - 3
  isMuted: boolean;
  generation: number;

  // telemetry
  comparisons: number;
  swaps: number;
  overwrites: number;
  pivotIndex: number | null;
  sortedIndices: Set<number>;
  compareIndices: [number, number] | null;
  swapIndices: [number, number] | null;

  // view
  cameraPreset: CameraPreset;
  progress: number;

  // derived
  isFinished: boolean;

  // actions
  setAlgorithm: (id: AlgorithmId) => void;
  setDatasetType: (t: DatasetType) => void;
  setArraySize: (n: number) => void;
  setSpeed: (s: number) => void;
  setMuted: (m: boolean) => void;
  setCameraPreset: (p: CameraPreset) => void;
  regenerate: () => void;
  buildActions: () => void;
  setPlaybackState: (s: PlaybackState) => void;
  incrementGeneration: () => void;

  // per-action reducers
  applyAction: (a: FactoryAction) => void;
  resetTelemetryAndArray: () => void;
  markProgress: () => void;
};

export const useFactoryStore = create<FactoryStore>((set, get) => ({
  dataset: [..._initDs],
  workingArray: [..._initDs],
  datasetType: "random",
  arraySize: 18,

  algorithmId: defaultAlgorithmId,
  actions: [],
  actionIndex: 0,
  currentAction: null,

  playbackState: "idle",
  speed: 1,
  isMuted: false,
  generation: 0,

  comparisons: 0,
  swaps: 0,
  overwrites: 0,
  pivotIndex: null,
  sortedIndices: new Set<number>(),
  compareIndices: null,
  swapIndices: null,

  cameraPreset: "overview",
  progress: 0,
  isFinished: false,

  setAlgorithm: (id) =>
    set({ algorithmId: id, generation: get().generation + 1 }),

  setDatasetType: (t) => set({ datasetType: t }),
  setArraySize: (n) => set({ arraySize: Math.max(5, Math.min(60, Math.round(n))) }),
  setSpeed: (s) => set({ speed: Math.max(0.25, Math.min(3, s)) }),
  setMuted: (m) => set({ isMuted: m }),
  setCameraPreset: (p) => set({ cameraPreset: p }),

  buildActions: () => {
    const { dataset, algorithmId } = get();
    const gen = registry[algorithmId].generator([...dataset]);
    const actions = [...gen];
    set({ actions, actionIndex: 0, currentAction: null });
  },

  regenerate: () => {
    const { datasetType, arraySize } = get();
    const ds = generateDataset(datasetType, arraySize);
    set({
      dataset: ds,
      workingArray: [...ds],
      actions: [],
      actionIndex: 0,
      currentAction: null,
      playbackState: "idle",
      progress: 0,
      comparisons: 0,
      swaps: 0,
      overwrites: 0,
      pivotIndex: null,
      sortedIndices: new Set(),
      compareIndices: null,
      swapIndices: null,
      isFinished: false,
      generation: get().generation + 1,
    });
    get().buildActions();
  },

  setPlaybackState: (s) => set({ playbackState: s }),
  incrementGeneration: () => set({ generation: get().generation + 1 }),

  applyAction: (a) =>
    set((s) => {
      const next: Partial<FactoryStore> = { currentAction: a };
      // update workingArray optimistically (swap/overwrite)
      let wa = s.workingArray;
      if (a.type === "SWAP") {
        wa = [...wa];
        const [i, j] = a.indices;
        [wa[i], wa[j]] = [wa[j], wa[i]];
        next.workingArray = wa;
        next.swaps = s.swaps + 1;
        next.swapIndices = a.indices;
        next.compareIndices = null;
      } else if (a.type === "OVERWRITE") {
        wa = [...wa];
        wa[a.index] = a.value;
        next.workingArray = wa;
        next.overwrites = s.overwrites + 1;
      } else if (a.type === "COMPARE") {
        next.comparisons = s.comparisons + 1;
        next.compareIndices = a.indices;
        next.swapIndices = null;
      } else if (a.type === "SET_PIVOT") {
        next.pivotIndex = a.index;
      } else if (a.type === "CLEAR_PIVOT") {
        next.pivotIndex = null;
      } else if (a.type === "MARK_SORTED") {
        const ns = new Set(s.sortedIndices);
        ns.add(a.index);
        next.sortedIndices = ns;
      } else if (a.type === "BATCH_SORTED") {
        const ns = new Set(s.sortedIndices);
        for (let i = a.start; i <= a.end; i++) ns.add(i);
        next.sortedIndices = ns;
      }
      const idx = s.actionIndex + 1;
      next.actionIndex = idx;
      next.progress = s.actions.length ? Math.min(100, Math.round((idx / s.actions.length) * 100)) : 0;
      if (idx >= s.actions.length) {
        next.playbackState = "finished";
        next.isFinished = true;
      }
      return next as FactoryStore;
    }),

  resetTelemetryAndArray: () =>
    set((s) => ({
      workingArray: [...s.dataset],
      actionIndex: 0,
      currentAction: null,
      playbackState: "idle",
      progress: 0,
      comparisons: 0,
      swaps: 0,
      overwrites: 0,
      pivotIndex: null,
      sortedIndices: new Set(),
      compareIndices: null,
      swapIndices: null,
      isFinished: false,
      generation: s.generation + 1,
    })),

  markProgress: () => {
    const s = get();
    set({ progress: s.actions.length ? Math.round((s.actionIndex / s.actions.length) * 100) : 0 });
  },
}));

// initialize actions on load (defer to avoid circular)
setTimeout(() => {
  try {
    useFactoryStore.getState().buildActions();
    // ensure workingArray matches dataset
    const s = useFactoryStore.getState();
    if (s.workingArray.length !== s.dataset.length) {
      useFactoryStore.setState({ workingArray: [...s.dataset] });
    }
  } catch { /* ignore */ }
}, 0);
