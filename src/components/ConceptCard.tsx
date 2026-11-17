import { ReactNode, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ConceptCardProps {
  title: string;
  definition: string;
  enabled?: boolean;
  onToggle?: (enabled: boolean) => void;
  /** Keep the controls visible when the concept is off. */
  keepBody?: boolean;
  children?: ReactNode;
}

/** A concept: what it is, and the control that turns it on. The card folds on its own. */
export function ConceptCard({ title, definition, enabled, onToggle, keepBody, children }: ConceptCardProps) {
  const [open, setOpen] = useState(true);
  const showBody = open && children && (keepBody || !onToggle || enabled);

  return (
    <section className="pkd-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
        <h2 style={{ margin: 0, flex: 1, minWidth: 0 }}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="pkd-text-mono"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.45rem",
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              textAlign: "left",
              color: "inherit",
            }}
          >
            {open ? (
              <ChevronDown aria-hidden className="h-4 w-4" style={{ flexShrink: 0, marginTop: "0.05rem", color: "var(--pkd-primary)" }} />
            ) : (
              <ChevronRight aria-hidden className="h-4 w-4" style={{ flexShrink: 0, marginTop: "0.05rem", color: "var(--pkd-primary)" }} />
            )}
            <span
              style={{
                color: "var(--pkd-primary)",
                fontWeight: 700,
                letterSpacing: "0.06em",
                fontSize: "var(--pkd-text-sm)",
              }}
            >
              {title}
            </span>
          </button>
        </h2>
        {onToggle && (
          <label
            className="pkd-text-mono"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: enabled ? "var(--pkd-primary)" : "var(--pkd-foreground-muted)",
              fontSize: "var(--pkd-text-xs)",
              letterSpacing: "0.06em",
              cursor: "pointer",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            <input
              type="checkbox"
              checked={!!enabled}
              onChange={(e) => onToggle(e.target.checked)}
              style={{ accentColor: "var(--pkd-primary)", width: "1rem", height: "1rem", cursor: "pointer" }}
            />
            {enabled ? "ON" : "OFF"}
          </label>
        )}
      </div>
      {open && (
        <p
          className="pkd-text-mono"
          style={{
            margin: "0.4rem 0 0",
            color: "var(--pkd-foreground-muted)",
            fontSize: "var(--pkd-text-sm)",
            lineHeight: 1.45,
          }}
        >
          {definition}
        </p>
      )}
      {showBody && <div style={{ marginTop: "0.9rem" }}>{children}</div>}
    </section>
  );
}
