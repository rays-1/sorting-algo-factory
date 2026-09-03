import { useRef, Suspense, lazy, memo } from "react";
import * as THREE from "three";
import type { GantryHandle } from "@/components/canvas/GantryCrane";
import { SystemHeader } from "@/components/ui/SystemHeader";
import { AlgorithmPanel } from "@/components/ui/AlgorithmPanel";
import { TelemetryPanel } from "@/components/ui/TelemetryPanel";
import { ProcessTimeline } from "@/components/ui/ProcessTimeline";
import { CameraControls } from "@/components/ui/CameraControls";
import { ControlDesk } from "@/components/ui/ControlDesk";
import { useFactoryStore } from "@/store/useFactoryStore";

const FactoryScene = lazy(() =>
  import("@/components/canvas/FactoryScene").then((m) => ({ default: m.FactoryScene })),
);

const SystemStatusPanel = memo(function SystemStatusPanel() {
  const count = useFactoryStore((s) => s.workingArray.length);
  const crates = useFactoryStore((s) => s.workingArray);
  const sorted = useFactoryStore((s) => s.sortedIndices);
  const pivot = useFactoryStore((s) => s.pivotIndex);
  return (
    <div className="panel" style={{ borderColor: "var(--border)" }}>
      <div className="panel-head"><span><b>SYSTEM</b> / STATUS</span><span style={{ color: "var(--green)", letterSpacing: "0.12em" }}>● ONLINE</span></div>
      <div className="panel-body" style={{ padding: 8 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontFamily: "var(--mono)", fontSize: 8 }}>
          <div style={{ border: "1px solid var(--border)", padding: "6px 7px", background: "rgba(10,18,23,0.85)" }}>
            <div style={{ color: "var(--muted)", letterSpacing: "0.14em" }}>UNITS</div>
            <div style={{ color: "var(--text)", fontSize: 13, fontWeight: 500, marginTop: 2 }}>{String(count).padStart(2, "0")}</div>
          </div>
          <div style={{ border: "1px solid var(--border)", padding: "6px 7px", background: "rgba(10,18,23,0.85)" }}>
            <div style={{ color: "var(--muted)", letterSpacing: "0.14em" }}>FACILITY</div>
            <div style={{ color: "var(--cyan)", fontSize: 10, marginTop: 2, letterSpacing: "0.1em" }}>LINE-A</div>
          </div>
        </div>
        <div style={{ marginTop: 8, border: "1px solid var(--border)", background: "#080D10", padding: 6, position: "relative", overflow: "hidden", height: 42 }}>
          <div style={{ position: "absolute", top: 4, left: 6, fontFamily: "var(--mono)", fontSize: 6, letterSpacing: "0.14em", color: "var(--muted2)" }}>ARRAY TOPOLOGY</div>
          <div style={{ display: "flex", gap: 2, alignItems: "end", height: "100%", justifyContent: "center", paddingTop: 8 }}>
            {crates.slice(0, 24).map((c, i) => (
              <div key={c.id} style={{ width: 6, height: `${8 + (c.value / 100) * 18}px`, background: sorted.has(i) ? "var(--green)" : pivot === i ? "var(--red)" : "var(--cyan)", opacity: 0.9, borderTop: "1px solid rgba(255,255,255,0.15)" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

function DiagnosticsPanel() {
  return (
    <div className="panel" style={{ opacity: 0.9 }}>
      <div className="panel-head"><span>DIAGNOSTICS</span><span>SYS.DIAG</span></div>
      <div className="panel-body" style={{ fontFamily: "var(--mono)", fontSize: 7, lineHeight: 1.6, color: "var(--muted)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>CONVEYOR</span><span style={{ color: "var(--green)" }}>NOMINAL</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>GANTRY</span><span style={{ color: "var(--green)" }}>CALIBRATED</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>HYDRAULICS</span><span style={{ color: "var(--green)" }}>42.1 PSI</span></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>THERMAL</span><span style={{ color: "var(--amber)" }}>38°C</span></div>
        <div style={{ marginTop: 6, height: 1, background: "var(--border)" }} />
        <div style={{ marginTop: 6, color: "var(--muted2)", fontSize: 6, letterSpacing: "0.1em" }}>FACILITY ID: SF-04 / LINE-A / REV 2.81</div>
      </div>
    </div>
  );
}

function CenterOverlay() {
  const workingLen = useFactoryStore((s) => s.workingArray.length);
  const datasetLen = useFactoryStore((s) => s.dataset.length);
  return (
    <div style={{ position: "absolute", inset: 8, pointerEvents: "none", border: "1px solid rgba(54,199,217,0.08)" }}>
      <div style={{ position: "absolute", top: -1, left: -1, width: 14, height: 14, borderTop: "1px solid var(--cyan)", borderLeft: "1px solid var(--cyan)", opacity: 0.9 }} />
      <div style={{ position: "absolute", top: -1, right: -1, width: 14, height: 14, borderTop: "1px solid var(--cyan)", borderRight: "1px solid var(--cyan)", opacity: 0.9 }} />
      <div style={{ position: "absolute", bottom: -1, left: -1, width: 14, height: 14, borderBottom: "1px solid var(--cyan)", borderLeft: "1px solid var(--cyan)", opacity: 0.9 }} />
      <div style={{ position: "absolute", bottom: -1, right: -1, width: 14, height: 14, borderBottom: "1px solid var(--cyan)", borderRight: "1px solid var(--cyan)", opacity: 0.9 }} />
      <div style={{ position: "absolute", top: 6, left: 10, fontFamily: "var(--mono)", fontSize: 7, letterSpacing: "0.16em", color: "rgba(184,210,216,0.55)", background: "rgba(5,9,12,0.72)", padding: "2px 6px", border: "1px solid var(--border)" }}>
        SYSTEM / SORTING CORE — ONLINE <span style={{ color: "var(--green)" }}>●</span>
      </div>
      <div style={{ position: "absolute", bottom: 6, left: 10, fontFamily: "var(--mono)", fontSize: 6, letterSpacing: "0.14em", color: "var(--muted2)", background: "rgba(5,9,12,0.72)", padding: "2px 6px", border: "1px solid var(--border)" }}>
        FACILITY LINE-A — {workingLen} UNITS — SLOT COORDINATES 01—{String(workingLen).padStart(2, "0")}
      </div>
      <div style={{ position: "absolute", bottom: 6, right: 10, fontFamily: "var(--mono)", fontSize: 6, letterSpacing: "0.12em", color: "var(--muted2)", background: "rgba(5,9,12,0.72)", padding: "2px 6px", border: "1px solid var(--border)" }}>
        {datasetLen} CRATES · PERSPECTIVE LOCKED
      </div>
    </div>
  );
}

function BottomStatus() {
  const crates = useFactoryStore((s) => s.workingArray);
  const finished = useFactoryStore((s) => s.playbackState === "finished");
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", fontFamily: "var(--mono)", fontSize: 7, letterSpacing: "0.14em", color: "var(--muted2)", background: "linear-gradient(180deg, #0A1217, #070D11)", borderTop: "1px solid var(--border)" }}>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>ARRAY STATE: [{crates.map((c) => String(c.value).padStart(3, "0")).join("  ")}]</span>
      <span style={{ whiteSpace: "nowrap", marginLeft: 12, color: finished ? "var(--green)" : "var(--muted)" }}>
        {finished ? "VERIFIED — PRODUCTION LINE STABLE" : "AWAITING PROCESS — FACILITY IDLE"}
      </span>
    </div>
  );
}

const LEGEND: [string, string, string][] = [
  ["IDLE", "#18242A", "Neutral. Awaiting instruction."],
  ["COMPARE", "#36C7D9", "Inspection head engaged."],
  ["SWAP", "#F5A623", "Mechanical exchange active."],
  ["PIVOT", "#E04B4B", "Partition reference."],
  ["SORTED", "#42C6A5", "Verified & locked."],
];

function LegendPanel() {
  return (
    <div className="panel">
      <div className="panel-head"><span><b>LEGEND</b> / CRATE STATE</span></div>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 5, fontFamily: "var(--mono)", fontSize: 8, letterSpacing: "0.08em" }}>
        {LEGEND.map(([label, col, desc]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)", padding: "5px 7px", background: "rgba(10,18,23,0.6)" }}>
            <span style={{ width: 8, height: 8, background: col, border: "1px solid rgba(255,255,255,0.12)", boxShadow: `0 0 6px ${col}` }} />
            <span style={{ color: "var(--text)", minWidth: 58 }}>{label}</span>
            <span style={{ color: "var(--muted)", fontSize: 7 }}>{desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SceneFallback() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#05090C", fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.2em", color: "var(--muted)" }}>
      INITIALIZING FACTORY…
    </div>
  );
}

export default function App() {
  const gantryRef = useRef<GantryHandle | null>(null);
  const meshMap = useRef<Map<number, THREE.Mesh>>(new Map());

  return (
    <div className="app">
      <SystemHeader />

      <aside className="app-left">
        <SystemStatusPanel />
        <AlgorithmPanel />
        <CameraControls />
        <DiagnosticsPanel />
      </aside>

      <main className="app-center">
        <Suspense fallback={<SceneFallback />}>
          <FactoryScene gantryRef={gantryRef} meshMap={meshMap} />
        </Suspense>
        <CenterOverlay />
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(800px 400px at 50% 45%, transparent 62%, rgba(5,9,12,0.55) 100%)" }} />
      </main>

      <aside className="app-right">
        <TelemetryPanel />
        <ControlDesk gantryRef={gantryRef} meshMap={meshMap} />
        <LegendPanel />
      </aside>

      <footer className="app-bottom">
        <ProcessTimeline />
        <BottomStatus />
      </footer>
    </div>
  );
}
