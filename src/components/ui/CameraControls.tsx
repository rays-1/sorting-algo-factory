import { useFactoryStore } from "@/store/useFactoryStore";
import type { CameraPreset } from "@/types/sorting";

const presets: { id: CameraPreset; label: string; desc: string }[] = [
  { id: "overview", label: "OVERVIEW", desc: "WIDE" },
  { id: "inspection", label: "INSPECTION", desc: "CLOSE" },
  { id: "gantry", label: "GANTRY", desc: "MECH" },
  { id: "topo", label: "TOPOGRAPHIC", desc: "TOP" },
];

export function CameraControls() {
  const cur = useFactoryStore((s) => s.cameraPreset);
  const set = useFactoryStore((s) => s.setCameraPreset);
  return (
    <div className="panel">
      <div className="panel-head"><span><b>OPTICS</b> / CAMERA</span><span>04 PRESETS</span></div>
      <div className="panel-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => set(p.id)}
            className={`btn ${cur === p.id ? "btn-primary" : ""}`}
            style={{ justifyContent: "space-between", padding: "7px 8px", fontSize: 8 }}
          >
            <span>{p.label}</span>
            <span style={{ opacity: 0.6, fontSize: 7 }}>{p.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
