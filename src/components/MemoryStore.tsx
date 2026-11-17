import { useEffect, useState } from "react";
import { getMemory, MemoryEntry, subscribeMemory, formatMemoryText } from "../services/memory";

function formatMemory(entries: MemoryEntry[]): string {
  return formatMemoryText(entries);
}

/** The turns currently stored, shown as the text memory contributes. */
export function MemoryStore({ enabled }: { enabled: boolean }) {
  const [entries, setEntries] = useState<MemoryEntry[]>(() => getMemory());

  useEffect(() => subscribeMemory(() => setEntries(getMemory())), []);

  return (
    <div>
      <p className="pkd-text-mono" style={{ margin: "0 0 0.45rem", fontSize: "var(--pkd-text-xs)", color: "var(--pkd-foreground-muted)" }}>
        {enabled
          ? "This is included on the next call."
          : "Off. This stays here and is not sent. New turns are not recorded."}
      </p>
      <pre
        className="pkd-text-mono"
        style={{
          margin: 0,
          maxHeight: "18rem",
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: "var(--pkd-text-sm)",
          color: entries.length ? "var(--pkd-foreground)" : "var(--pkd-warning)",
        }}
      >
        {entries.length ? formatMemory(entries) : "No turns stored."}
      </pre>
    </div>
  );
}
