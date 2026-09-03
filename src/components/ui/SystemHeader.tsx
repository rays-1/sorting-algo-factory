import { useFactoryStore } from "@/store/useFactoryStore";

export function SystemHeader() {
  const playback = useFactoryStore((s) => s.playbackState);
  const progress = useFactoryStore((s) => s.progress);

  const stateLabel = playback === "playing" ? "ACTIVE" : playback === "paused" ? "HOLD" : playback === "finished" ? "COMPLETE" : "STANDBY";
  const dot = playback === "playing" ? "dot-busy" : playback === "finished" ? "dot-online" : "dot-online";

  return (
    <header className="app-header" style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 12px", borderBottom: "1px solid var(--border)",
      background: "linear-gradient(180deg, #0A1217, #081017)",
      fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.14em", color: "var(--muted)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: "var(--text)", fontWeight: 600, letterSpacing: "0.18em" }}>SORTING FACTORY</span>
        <span style={{ opacity: 0.45 }}>—</span>
        <span>SYS.04</span>
        <span style={{ opacity: 0.5 }}>REV 2.81</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 8, color: playback === "finished" ? "var(--green)" : "var(--cyan2)", fontSize: 9 }}>
          <span className={`dot ${dot}`} /> {stateLabel}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 8, letterSpacing: "0.16em", color: "var(--muted2)" }}>PROCESS COMPLETION</span>
        <div style={{ width: 160, height: 4, background: "#0F1E25", border: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: playback === "finished" ? "var(--green)" : "var(--cyan)", boxShadow: playback === "finished" ? "0 0 8px var(--green)" : "0 0 8px var(--cyan)", transition: "width 0.25s linear" }} />
        </div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text)", minWidth: 34, textAlign: "right" }}>{String(progress).padStart(2, "0")}%</span>
        <span style={{ width: 1, height: 14, background: "var(--border)", margin: "0 4px" }} />
        <span style={{ fontSize: 8, opacity: 0.7 }}>{new Date().toLocaleTimeString([], { hour12: false })}</span>
      </div>
    </header>
  );
}
