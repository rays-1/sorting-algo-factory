import { useFactoryStore } from "@/store/useFactoryStore";
import type { DatasetType } from "@/types/sorting";
import { DATASET_LABELS } from "@/utils/dataset";
import { useEffect, useRef } from "react";
import { playback } from "@/engine/SortingPlayback";
import { getSlotX } from "@/utils/math";
import * as audio from "@/utils/audio";
import type { GantryHandle } from "@/components/canvas/GantryCrane";
import * as THREE from "three";

export function PlaybackControls({
  gantryRef,
  meshMap,
}: {
  gantryRef: React.RefObject<GantryHandle | null>;
  meshMap: React.MutableRefObject<Map<number, THREE.Mesh>>;
}) {
  const datasetType = useFactoryStore((s) => s.datasetType);
  const arraySize = useFactoryStore((s) => s.arraySize);
  const speed = useFactoryStore((s) => s.speed);
  const isMuted = useFactoryStore((s) => s.isMuted);
  const playbackState = useFactoryStore((s) => s.playbackState);
  const actions = useFactoryStore((s) => s.actions);
  const generation = useFactoryStore((s) => s.generation);
  const setDatasetType = useFactoryStore((s) => s.setDatasetType);
  const setArraySize = useFactoryStore((s) => s.setArraySize);
  const setSpeed = useFactoryStore((s) => s.setSpeed);
  const setMuted = useFactoryStore((s) => s.setMuted);

  const workingLen = useFactoryStore((s) => s.workingArray.length);
  const abortRef = useRef<AbortController | null>(null);

  // keep audio mute in sync
  useEffect(() => { audio.setMuted(isMuted); }, [isMuted]);

  // cancel on generation change / unmount / dataset change
  useEffect(() => {
    return () => { playback.cancel(); abortRef.current?.abort(); };
  }, [generation]);

  const getContext = () => {
    const count = useFactoryStore.getState().workingArray.length;
    return {
      getCrateMesh: (idx: number) => meshMap.current.get(idx) ?? null,
      getSlotX: (idx: number) => getSlotX(idx, count),
      getGantry: () => gantryRef.current ? { carriage: gantryRef.current.carriage, head: gantryRef.current.head } : null,
      speed: useFactoryStore.getState().speed,
      signal: abortRef.current?.signal ?? new AbortController().signal,
      muted: useFactoryStore.getState().isMuted,
    };
  };

  const handleRun = async () => {
    if (playbackState === "playing") return;
    if (playbackState === "paused") {
      useFactoryStore.getState().setPlaybackState("playing");
      playback.resume();
      if (!isMuted) audio.playConveyorHum();
      return;
    }
    // playing from idle/finished -> reset then play
    if (playbackState === "finished") {
      useFactoryStore.getState().resetTelemetryAndArray();
      // clear mesh positions back to slot
      const wa = useFactoryStore.getState().workingArray;
      wa.forEach((_, i) => {
        const m = meshMap.current.get(i);
        if (m) {
          m.position.x = getSlotX(i, wa.length);
          m.position.y = 0;
          m.position.z = 0;
        }
      });
    }
    await audio.ensureAudio();
    if (!isMuted) audio.playConveyorHum();
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    useFactoryStore.getState().setPlaybackState("playing");

    const curActions = useFactoryStore.getState().actions;
    if (curActions.length === 0) {
      useFactoryStore.getState().buildActions();
    }

    playback.play({
      getActions: () => useFactoryStore.getState().actions,
      getContext,
      onActionStart: (a) => {
        useFactoryStore.getState().applyAction(a);
      },
      onComplete: () => {
        useFactoryStore.getState().setPlaybackState("finished");
        audio.stopConveyorHum();
        if (!useFactoryStore.getState().isMuted) audio.playCompletionChime();
      },
    }).catch(() => { /* aborted */ });
  };

  const handleHold = () => {
    if (playbackState !== "playing") return;
    playback.pause();
    useFactoryStore.getState().setPlaybackState("paused");
    audio.stopConveyorHum();
  };

  const handleStep = async () => {
    if (playbackState === "playing") return;
    const curActions = useFactoryStore.getState().actions;
    const idx = useFactoryStore.getState().actionIndex;
    if (idx >= curActions.length) return;
    if (!abortRef.current || abortRef.current.signal.aborted) abortRef.current = new AbortController();
    await audio.ensureAudio();
    const action = curActions[idx];
    useFactoryStore.getState().applyAction(action);
    // animate single action
    const { executeAction } = await import("@/engine/ActionExecutor");
    try {
      await executeAction(action, getContext());
    } catch { /* abort */ }
    if (useFactoryStore.getState().actionIndex >= curActions.length) {
      useFactoryStore.setState({ playbackState: "finished" });
      if (!isMuted) audio.playCompletionChime();
    }
  };

  const handleReset = () => {
    playback.cancel();
    abortRef.current?.abort();
    audio.stopConveyorHum();
    useFactoryStore.getState().resetTelemetryAndArray();
    // snap meshes back
    const wa = useFactoryStore.getState().workingArray;
    wa.forEach((_, i) => {
      const m = meshMap.current.get(i);
      if (m) {
        m.position.set(getSlotX(i, wa.length), 0, 0);
        m.scale.set(1, 1, 1);
      }
    });
    if (gantryRef.current) {
      gantryRef.current.carriage.position.x = 0;
      gantryRef.current.head.position.y = 0;
    }
  };

  const handleRegenerate = () => {
    playback.cancel();
    abortRef.current?.abort();
    audio.stopConveyorHum();
    useFactoryStore.getState().regenerate();
    // mesh positions will be recreated via key change + register
  };

  const handleEstop = () => {
    playback.cancel();
    abortRef.current?.abort();
    audio.stopConveyorHum();
    useFactoryStore.setState({ playbackState: "idle" });
  };

  return (
    <div className="panel">
      <div className="panel-head"><span><b>CONTROL</b> / OPERATIONS</span><span style={{ color: playbackState === "playing" ? "var(--amber)" : "var(--muted2)" }}>{playbackState.toUpperCase()}</span></div>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* primary machine controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6 }}>
          <button className={`btn ${playbackState === "playing" ? "" : "btn-primary"}`} onClick={handleRun} disabled={playbackState === "playing"}>
            <span style={{ width: 6, height: 6, background: playbackState === "playing" ? "var(--amber)" : "var(--green)", borderRadius: "50%", boxShadow: playbackState !== "playing" ? "0 0 6px var(--green)" : "none" }} /> {playbackState === "paused" ? "RESUME" : "RUN"}
          </button>
          <button className="btn" onClick={handleHold} disabled={playbackState !== "playing"}>HOLD</button>
          <button className="btn" onClick={handleStep} disabled={playbackState === "playing"}>STEP</button>
          <button className="btn" onClick={handleReset}>RESET</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6 }}>
          <button className="btn" onClick={handleRegenerate} style={{ justifyContent: "center" }}>↻ REGENERATE DATASET</button>
          <button className="btn btn-danger" onClick={handleEstop} title="Emergency stop — cancel all timelines">ESTOP</button>
        </div>

        {/* dataset + size */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 72px", gap: 6, alignItems: "end" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="telemetry-label">DATASET</span>
            <select
              value={datasetType}
              onChange={(e) => { setDatasetType(e.target.value as DatasetType); setTimeout(handleRegenerate, 0); }}
              style={{ background: "#080D10", border: "1px solid var(--border2)", color: "var(--text)", fontFamily: "var(--mono)", fontSize: 9, letterSpacing: "0.1em", padding: "6px 6px", outline: "none" }}
            >
              {(Object.entries(DATASET_LABELS) as [DatasetType, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="telemetry-label">SIZE</span>
            <input
              type="number" min={5} max={60} value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              onBlur={handleRegenerate}
              style={{ background: "#080D10", border: "1px solid var(--border2)", color: "var(--cyan)", fontFamily: "var(--mono)", fontSize: 11, padding: "6px 6px", outline: "none", textAlign: "center" }}
            />
          </label>
        </div>

        {/* throttle */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="telemetry-label">THROTTLE</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--cyan)" }}>{speed.toFixed(2)}×</span>
          </div>
          <input
            className="throttle"
            type="range" min={0.25} max={3} step={0.25} value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: "100%", marginTop: 8 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--mono)", fontSize: 6, letterSpacing: "0.12em", color: "var(--muted2)", marginTop: 4 }}>
            <span>0.25×</span><span>1.0×</span><span>3.0×</span>
          </div>
        </div>

        {/* audio + info */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
          <button className="btn btn-ghost" onClick={() => setMuted(!isMuted)} style={{ fontSize: 9 }}>
            {isMuted ? "🔇 MUTED" : "🔊 AUDIO ON"}
          </button>
          <span style={{ fontFamily: "var(--mono)", fontSize: 7, letterSpacing: "0.12em", color: "var(--muted2)" }}>
            {actions.length} OPS · {workingLen} UNITS
          </span>
        </div>
      </div>
    </div>
  );
}
