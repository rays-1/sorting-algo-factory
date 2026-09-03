import { useFactoryStore } from "@/store/useFactoryStore";
import { algorithmList } from "@/algorithms";

export function TelemetryPanel() {
  const cmp = useFactoryStore((s) => s.comparisons);
  const swp = useFactoryStore((s) => s.swaps);
  const wrt = useFactoryStore((s) => s.overwrites);
  const cur = useFactoryStore((s) => s.currentAction);
  const idx = useFactoryStore((s) => s.actionIndex);
  const total = useFactoryStore((s) => s.actions.length);
  const pivot = useFactoryStore((s) => s.pivotIndex);
  const algo = useFactoryStore((s) => algorithmList.find((a) => a.id === s.algorithmId)!);
  const playback = useFactoryStore((s) => s.playbackState);

  const activeType = cur?.type ?? "IDLE";
  const range = cur && ("indices" in cur && cur.indices) ? `${String(cur.indices[0]).padStart(2, "0")}—${String(cur.indices[1]).padStart(2, "0")}` :
    cur && "index" in cur && typeof (cur as { index?: number }).index === "number" ? `IDX ${(cur as { index: number }).index}` :
    cur && cur.type === "BATCH_SORTED" ? `${String(cur.start).padStart(2, "0")}—${String(cur.end).padStart(2, "0")}` : "—";

  return (
    <div className="panel">
      <div className="panel-head"><span><b>TELEMETRY</b> / PROCESS</span><span style={{ color: playback === "playing" ? "var(--amber)" : "var(--muted2)" }}>{playback.toUpperCase()}</span></div>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* three counters */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {[
            ["CMP", cmp, "#36C7D9"],
            ["SWP", swp, "#F5A623"],
            ["WRT", wrt, "#67E3F2"],
          ].map(([label, val, color]) => (
            <div key={label as string} style={{ border: "1px solid var(--border)", background: "rgba(10,18,23,0.85)", padding: "7px 6px", textAlign: "center" }}>
              <div className="telemetry-label" style={{ fontSize: 7 }}>{label as string}</div>
              <div className="telemetry-value" style={{ fontSize: 16, color: color as string }}>{String(val as number).padStart(4, "0")}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <div style={{ border: "1px solid var(--border)", padding: "7px", background: "#080D10" }}>
            <div className="telemetry-label">ACTIVE PROCESS</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text)", letterSpacing: "0.08em", marginTop: 4 }}>{algo.name}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--muted2)", letterSpacing: "0.12em" }}>{activeType}</div>
          </div>
          <div style={{ border: "1px solid var(--border)", padding: "7px", background: "#080D10" }}>
            <div className="telemetry-label">RANGE / PIVOT</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: pivot !== null ? "var(--red)" : "var(--text)", marginTop: 4 }}>{range}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 8, color: "var(--muted2)" }}>{pivot !== null ? `PIVOT ${String(pivot).padStart(2, "0")}` : "NO PIVOT"}</div>
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", background: "#080D10", padding: 7 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="telemetry-label">STEP</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)" }}>{String(idx).padStart(3, "0")} / {String(total).padStart(3, "0")}</span>
          </div>
          <div style={{ height: 4, background: "#0F1E25", border: "1px solid var(--border)", marginTop: 6, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, width: `${total ? (idx / total) * 100 : 0}%`, background: "var(--cyan)", transition: "width 0.2s linear" }} />
            {/* tick marks */}
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, transparent 0 14px, rgba(255,255,255,0.06) 14px 15px)", opacity: 0.5 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontFamily: "var(--mono)", fontSize: 6, letterSpacing: "0.12em", color: "var(--muted2)" }}>
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>

        {/* waveform */}
        <div style={{ border: "1px solid var(--border)", background: "#080D10", padding: 6, height: 48, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 4, left: 6, fontFamily: "var(--mono)", fontSize: 6, letterSpacing: "0.14em", color: "var(--muted2)" }}>OSCILLOSCOPE</div>
          <svg viewBox="0 0 120 28" style={{ width: "100%", height: "100%", display: "block", marginTop: 8 }}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(54,199,217,0.35)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            {/* fake waveform derived from cmp/swp counts */}
            <path
              d={`M 0,14 ${Array.from({ length: 20 }).map((_, i) => {
                const v = Math.sin((cmp * 0.13 + i) * 0.9) * 6 + Math.cos((swp * 0.2 + i) * 1.1) * 3;
                return `L ${i * 6},${14 + v}`;
              }).join(" ")}`}
              fill="none" stroke="var(--cyan)" strokeWidth="1.1" opacity={0.9}
            />
            <line x1="0" y1="14" x2="120" y2="14" stroke="#18242A" strokeWidth="0.6" strokeDasharray="3 3" />
          </svg>
        </div>
      </div>
    </div>
  );
}
