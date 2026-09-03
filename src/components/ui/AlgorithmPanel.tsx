import { useFactoryStore } from "@/store/useFactoryStore";
import { algorithmList } from "@/algorithms";
import type { AlgorithmId } from "@/types/sorting";

export function AlgorithmPanel() {
  const id = useFactoryStore((s) => s.algorithmId);
  const set = useFactoryStore((s) => s.setAlgorithm);
  const meta = algorithmList.find((a) => a.id === id)!;

  return (
    <div className="panel">
      <div className="panel-head"><span><b>SORT CORE</b> / ALGORITHM</span><span style={{ fontSize: 7 }}>REV {meta.id.toUpperCase()} · ACTIVE</span></div>
      <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <select
          value={id}
          onChange={(e) => set(e.target.value as AlgorithmId)}
          style={{
            width: "100%", background: "#080D10", border: "1px solid var(--border2)", color: "var(--cyan2)",
            fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.12em", padding: "8px 8px", outline: "none",
          }}
        >
          {algorithmList.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 14, letterSpacing: "0.12em", color: "var(--text)", fontWeight: 600 }}>{meta.name}</div>
          <div style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.08em", marginTop: 2 }}>{meta.method}</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)", lineHeight: 1.45, marginTop: 8 }}>{meta.description}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontFamily: "var(--mono)", fontSize: 9 }}>
          {[
            ["BEST", meta.best],
            ["AVG", meta.average],
            ["WORST", meta.worst],
            ["SPACE", meta.space],
          ].map(([k, v]) => (
            <div key={k} style={{ border: "1px solid var(--border)", background: "rgba(10,18,23,0.75)", padding: "6px 7px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "var(--muted)", letterSpacing: "0.14em" }}>{k}</span>
              <span style={{ color: "var(--cyan)", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 7, letterSpacing: "0.12em", padding: "3px 6px", border: "1px solid var(--border)", color: meta.stable ? "var(--green)" : "var(--muted)", background: meta.stable ? "rgba(66,198,165,0.08)" : "transparent" }}>
            {meta.stable ? "STABLE" : "UNSTABLE"}
          </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 7, letterSpacing: "0.12em", padding: "3px 6px", border: "1px solid var(--border)", color: "var(--muted)" }}>
            IN-PLACE {meta.space === "O(1)" || meta.space === "O(log n)" ? "YES" : "NO"}
          </span>
        </div>

        {/* miniature topology */}
        <div style={{ border: "1px solid var(--border)", background: "#080D10", padding: 8, position: "relative", height: 46, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 4, left: 6, fontFamily: "var(--mono)", fontSize: 6, letterSpacing: "0.14em", color: "var(--muted2)" }}>TOPOLOGY</div>
          <svg viewBox="0 0 100 24" style={{ width: "100%", height: "100%", display: "block", marginTop: 6 }}>
            <polyline fill="none" stroke="rgba(54,199,217,0.55)" strokeWidth="1.2" points={meta.id === "quick" ? "2,18 18,4 34,14 50,2 66,16 82,6 98,18" : meta.id === "merge" ? "2,12 20,12 20,4 40,4 40,12 60,12 60,20 80,20 80,12 98,12" : "2,18 14,12 26,8 38,14 50,6 62,10 76,4 88,12 98,2"} />
            <line x1="2" y1="22" x2="98" y2="22" stroke="#18242A" strokeWidth="0.7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
