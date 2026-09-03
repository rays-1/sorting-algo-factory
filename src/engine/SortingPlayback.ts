import gsap from "gsap";
import type { FactoryAction } from "@/types/sorting";
import { executeAction, type ExecutorContext } from "./ActionExecutor";

export type PlaybackHandles = {
  getActions: () => FactoryAction[];
  getContext: () => ExecutorContext;
  onActionStart: (a: FactoryAction, idx: number) => void;
  onComplete: () => void;
};

export class SortingPlayback {
  private running = false;
  private paused = false;
  private resumeResolver: (() => void) | null = null;
  private gen = 0;
  private abort: AbortController | null = null;
  private cursor = 0;

  get isRunning() { return this.running; }
  get isPaused() { return this.paused; }

  async play(handles: PlaybackHandles): Promise<void> {
    // cancel prior
    this.cancel();
    this.gen++;
    const curGen = this.gen;
    this.running = true;
    this.paused = false;
    this.abort = new AbortController();
    const signal = this.abort.signal;
    const actions = handles.getActions();
    this.cursor = 0;

    const isStale = () => curGen !== this.gen || signal.aborted;

    for (let i = 0; i < actions.length; i++) {
      if (isStale()) break;
      // handle pause
      while (this.paused) {
        if (isStale()) break;
        await new Promise<void>((res) => {
          this.resumeResolver = res;
          signal.addEventListener("abort", () => res(), { once: true });
        });
        if (isStale()) break;
      }
      if (isStale()) break;
      const action = actions[i];
      this.cursor = i;
      const isMovement = action.type === "SWAP" || action.type === "OVERWRITE";
      if (!isMovement) handles.onActionStart(action, i);
      try {
        const ctx = handles.getContext();
        await executeAction(action, { ...ctx, signal });
        if (isStale()) break;
        if (isMovement) handles.onActionStart(action, i);
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") break;
        // ensure SWAP still applies even if animation aborted mid-way
        if (isMovement && !isStale()) {
          try { handles.onActionStart(action, i); } catch { /* ignore */ }
        } else console.error(e);
      }
    }
    if (!isStale()) handles.onComplete();
    this.running = false;
    this.paused = false;
  }

  pause() {
    if (!this.running || this.paused) return;
    this.paused = true;
  }

  resume() {
    if (!this.paused) return;
    this.paused = false;
    this.resumeResolver?.();
    this.resumeResolver = null;
  }

  async step(handles: PlaybackHandles): Promise<void> {
    const actions = handles.getActions();
    if (this.cursor >= actions.length) return;
    const action = actions[this.cursor];
    const isMovement = action.type === "SWAP" || action.type === "OVERWRITE";
    if (!isMovement) handles.onActionStart(action, this.cursor);
    try {
      const ctx = handles.getContext();
      await executeAction(action, ctx);
      if (isMovement) handles.onActionStart(action, this.cursor);
      this.cursor++;
      if (this.cursor >= actions.length) handles.onComplete();
    } catch (e) {
      if ((e as DOMException)?.name !== "AbortError") console.error(e);
      else if (isMovement) {
        try { handles.onActionStart(action, this.cursor); } catch { /* ignore */ }
        this.cursor++;
      }
    }
  }

  cancel() {
    this.gen++;
    this.running = false;
    this.paused = false;
    this.abort?.abort();
    this.abort = null;
    if (this.resumeResolver) {
      this.resumeResolver();
      this.resumeResolver = null;
    }
    try {
      gsap.killTweensOf("*");
    } catch { /* ignore */ }
    this.cursor = 0;
  }

  resetCursor() { this.cursor = 0; }
  setCursor(n: number) { this.cursor = n; }
}
export const playback = new SortingPlayback();
