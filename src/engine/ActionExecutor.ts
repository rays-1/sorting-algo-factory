import gsap from "gsap";
import * as THREE from "three";
import type { FactoryAction } from "@/types/sorting";
import * as audio from "@/utils/audio";

// Reusable material/color maps are in Crate.tsx; executor only drives tweens via registry.
export type CrateHandle = {
  mesh: THREE.Mesh;
  label: THREE.Mesh | null;
};

export type ExecutorContext = {
  getCrateMesh: (index: number) => THREE.Mesh | null;
  getSlotX: (index: number) => number;
  getGantry: () => { carriage: THREE.Group; head: THREE.Group } | null;
  speed: number;
  signal: AbortSignal;
  muted: boolean;
};

function wait(duration: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("aborted", "AbortError"));
    const id = window.setTimeout(() => resolve(), duration);
    signal.addEventListener("abort", () => {
      clearTimeout(id);
      reject(new DOMException("aborted", "AbortError"));
    }, { once: true });
  });
}

function tweenTo(
  target: object,
  vars: gsap.TweenVars,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new DOMException("aborted", "AbortError"));
    const t = gsap.to(target, {
      ...vars,
      onComplete: () => resolve(),
    });
    signal.addEventListener("abort", () => {
      t.kill();
      reject(new DOMException("aborted", "AbortError"));
    }, { once: true });
  });
}

export async function executeAction(
  action: FactoryAction,
  ctx: ExecutorContext,
): Promise<void> {
  const base = 360; // ms at 1x
  const dur = (ms: number) => (ms / ctx.speed);
  const signal = ctx.signal;

  switch (action.type) {
    case "COMPARE": {
      const [a, b] = action.indices;
      const am = ctx.getCrateMesh(a);
      const bm = ctx.getCrateMesh(b);
      const gantry = ctx.getGantry();
      // gantry moves to midpoint
      if (gantry) {
        const mid = (ctx.getSlotX(a) + ctx.getSlotX(b)) / 2;
        await tweenTo(gantry.carriage.position, { x: mid, duration: dur(220) / 1000, ease: "power2.inOut" }, signal);
        // head descend
        await tweenTo(gantry.head.position, { y: -0.25, duration: dur(120) / 1000, ease: "power2.out" }, signal);
      }
      // subtle scale pulse on crates
      if (am) gsap.to(am.scale, { y: 1.04, duration: dur(80) / 1000, yoyo: true, repeat: 1, overwrite: "auto" });
      if (bm) gsap.to(bm.scale, { y: 1.04, duration: dur(80) / 1000, yoyo: true, repeat: 1, overwrite: "auto" });
      if (!ctx.muted) audio.playInspectionPulse();
      await wait(dur(140), signal);
      if (gantry) await tweenTo(gantry.head.position, { y: 0, duration: dur(100) / 1000, ease: "power2.in" }, signal);
      break;
    }
    case "SWAP": {
      const [i, j] = action.indices;
      const mi = ctx.getCrateMesh(i);
      const mj = ctx.getCrateMesh(j);
      if (!mi || !mj) {
        await wait(dur(220), signal);
        break;
      }
      const xi = ctx.getSlotX(i);
      const xj = ctx.getSlotX(j);
      const gantry = ctx.getGantry();
      if (gantry) {
        await tweenTo(gantry.carriage.position, { x: (xi + xj) / 2, duration: dur(180) / 1000, ease: "power2.inOut" }, signal);
      }
      if (!ctx.muted) audio.playPistonClank();

      // lift both slightly with Z stagger to avoid intersection
      const lift = 0.9;
      await Promise.all([
        tweenTo(mi.position, { y: lift, z: 0.35, duration: dur(160) / 1000, ease: "power2.out" }, signal),
        tweenTo(mj.position, { y: lift, z: -0.35, duration: dur(160) / 1000, ease: "power2.out" }, signal),
      ]);
      // translate
      await Promise.all([
        tweenTo(mi.position, { x: xj, duration: dur(base * 0.9) / 1000, ease: "power2.inOut" }, signal),
        tweenTo(mj.position, { x: xi, duration: dur(base * 0.9) / 1000, ease: "power2.inOut" }, signal),
      ]);
      // drop
      await Promise.all([
        tweenTo(mi.position, { y: 0, z: 0, duration: dur(140) / 1000, ease: "power2.in" }, signal),
        tweenTo(mj.position, { y: 0, z: 0, duration: dur(140) / 1000, ease: "power2.in" }, signal),
      ]);
      // slight impact
      gsap.to(mi.scale, { y: 0.96, duration: dur(60) / 1000, yoyo: true, repeat: 1 });
      gsap.to(mj.scale, { y: 0.96, duration: dur(60) / 1000, yoyo: true, repeat: 1 });
      break;
    }
    case "OVERWRITE": {
      const m = ctx.getCrateMesh(action.index);
      if (m) {
        // squish and scale according to new value (height adjusted by caller via workingArray/watch)
        gsap.to(m.scale, { y: 0.88, duration: dur(80) / 1000, yoyo: true, repeat: 1 });
        if (!ctx.muted) audio.playOverwrite();
        await wait(dur(180), signal);
      } else {
        await wait(dur(180), signal);
      }
      break;
    }
    case "SET_PIVOT":
    case "CLEAR_PIVOT":
    case "MARK_SORTED":
    case "BATCH_SORTED": {
      if (action.type === "MARK_SORTED" || action.type === "BATCH_SORTED") {
        if (!ctx.muted && action.type === "BATCH_SORTED") {
          // only chime on final batches; throttle via timeout in playback
        }
      }
      await wait(dur(110), signal);
      break;
    }
  }
}
