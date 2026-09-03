import type { FactoryAction } from "@/types/sorting";

/**
 * TimelineController — thin wrapper around action list & cursor.
 * Keeps playback logic pure; React/Zustand owns rendered state.
 */
export class TimelineController {
  private actions: FactoryAction[] = [];
  private index = 0;

  load(actions: FactoryAction[]) {
    this.actions = actions;
    this.index = 0;
  }
  get length() { return this.actions.length; }
  get cursor() { return this.index; }
  get progress() { return this.actions.length ? this.index / this.actions.length : 0; }
  get isDone() { return this.index >= this.actions.length; }
  peek(): FactoryAction | null { return this.actions[this.index] ?? null; }
  peekNext(n = 6): FactoryAction[] { return this.actions.slice(this.index, this.index + n); }
  advance(): FactoryAction | null {
    const a = this.actions[this.index] ?? null;
    if (a) this.index++;
    return a;
  }
  reset() { this.index = 0; }
  seek(i: number) { this.index = Math.max(0, Math.min(this.actions.length, i)); }
}
