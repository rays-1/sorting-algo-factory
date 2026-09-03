import gsap from "gsap";
import * as THREE from "three";
import type { FactoryAction } from "@/types/sorting";
import * as audio from "@/utils/audio";

// Reusable material/color maps are in Crate.tsx; executor only drives tweens via registry.
export type ExecutorContext = {
  getCrateMesh: (index: number) => THREE.Mesh | null;
  getSlotX: (index: number) => number;
  getGantry: () => { carriage: THREE.Group; head: THREE.Group } | null;
  speed: number;
  signal: AbortSignal;
  muted: boolean;
};

function abortError(): DOMException {
  return new DOMException("aborted", "AbortError");
}

function wait(duration: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(abortError());
    const onAbort = () => {
      clearTimeout(id);
      reject(abortError());
    };
    const id = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, duration);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function tweenTo(
  target: object,
  vars: gsap.TweenVars,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(abortError());
    const onAbort = () => {
      t.kill();
      reject(abortError());
    };
    const t = gsap.to(target, {
      ...vars,
      onComplete: () => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      },
    });
    signal.addEventListener("abort", onAbort, { once: true });
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
      // gantry tracks the primary inspected slot (not mid for distant pivot pairs)
      if (gantry) {
        const targetX = ctx.getSlotX(a);
        await tweenTo(gantry.carriage.position, { x: targetX, duration: dur(220) / 1000, ease: "power2.inOut" }, signal);
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

      // lift — relative to current base height (fixes absolute 0 bug that sank crates through conveyor)
      const yi = mi.position.y;
      const yj = mj.position.y;
      const lift = 1.05;
      await Promise.all([
        tweenTo(mi.position, { y: yi + lift, z: 0.36, duration: dur(160) / 1000, ease: "power2.out" }, signal),
        tweenTo(mj.position, { y: yj + lift, z: -0.36, duration: dur(160) / 1000, ease: "power2.out" }, signal),
      ]);
      // translate (x to target slots)
      await Promise.all([
        tweenTo(mi.position, { x: xj, duration: dur(base * 0.9) / 1000, ease: "power2.inOut" }, signal),
        tweenTo(mj.position, { x: xi, duration: dur(base * 0.9) / 1000, ease: "power2.inOut" }, signal),
      ]);
      // drop back to original base heights
      await Promise.all([
        tweenTo(mi.position, { y: yi, z: 0, duration: dur(140) / 1000, ease: "power2.in" }, signal),
        tweenTo(mj.position, { y: yj, z: 0, duration: dur(140) / 1000, ease: "power2.in" }, signal),
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
