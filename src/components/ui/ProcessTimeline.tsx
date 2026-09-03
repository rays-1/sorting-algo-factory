import { useFactoryStore } from "@/store/useFactoryStore";

const colorFor = (t: string) => {
  switch (t) {
    case "COMPARE": return "#36C7D9";
    case "SWAP": return "#F5A623";
    case "OVERWRITE": return "#67E3F2";
    case "SET_PIVOT": return "#E04B4B";
    case "CLEAR_PIVOT": return "#647780";
    case "MARK_SORTED": return "#42C6A5";
    case "BATCH_SORTED": return "#42C6A5";
    default: return "#3A4E57";
  }
};

export function ProcessTimeline() {
  const actions = useFactoryStore((s) => s.actions);
  const idx = useFactoryStore((s) => s.actionIndex);
  // show window around cursor
  const windowSize = 18;
  const start = Math.max(0, Math.min(actions.length - windowSize, idx - Math.floor(windowSize / 2)));
  const slice = actions.slice(start, start + windowSize);
  const cur = useFactoryStore((s) => s.currentAction);

  return (
    <div style={{
      borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
      background: "linear-gradient(180deg, #081017, #05090C)",
      padding: "6px 10px", display: "flex", alignItems: "center", gap: 8,
      fontFamily: "var(--mono)", fontSize: 8, overflow: "hidden",
    }}>
      <span style={{ letterSpacing: "0.14em", color: "var(--muted)", whiteSpace: "nowrap" }}>TIMELINE</span>
      <span style={{ color: "var(--muted2)" }}>│</span>
      <div style={{ display: "flex", gap: 4, overflow: "hidden", flex: 1 }}>
        {slice.length === 0 && <span style={{ color: "var(--muted2)", letterSpacing: "0.12em" }}>NO ACTIONS — GENERATE DATASET</span>}
        {slice.map((a, i) => {
          const global = start + i;
          const active = global === idx && cur;
          const isPast = global < idx;
          return (
            <div
              key={global}
              title={`${a.type} #${global}`}
              style={{
                minWidth: 56, height: 28, border: `1px solid ${active ? colorFor(a.type) : isPast ? "#1E333C" : "#16252E"}`,
                background: active ? `${colorFor(a.type)}18` : isPast ? "rgba(22,37,46,0.5)" : "#0A1318",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                boxShadow: active ? `0 0 8px ${colorFor(a.type)}55` : "none",
                opacity: isPast ? 0.85 : active ? 1 : 0.62,
              }}
            >
              <span style={{ fontSize: 7, letterSpacing: "0.1em", color: active ? colorFor(a.type) : isPast ? "var(--text-dim)" : "var(--muted)" }}>{a.type.slice(0, 6)}</span>
              <span style={{ fontSize: 7, color: "var(--muted2)" }}>{String(global).padStart(2, "0")}</span>
            </div>
          );
        })}
      </div>
      <span style={{ color: "var(--muted2)" }}>│</span>
      <span style={{ fontSize: 7, letterSpacing: "0.12em", color: "var(--muted)", whiteSpace: "nowrap" }}>
        {String(idx).padStart(3, "0")} / {String(actions.length).padStart(3, "0")}
      </span>
    </div>
  );
}
