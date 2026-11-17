import { useState } from "react";
import { getDefaultGroundingText, getGroundingText, setGroundingText } from "../services/orchestrator";
import { JsonCodeEditor } from "./JsonCodeEditor";

/** The document {{grounding}} inserts while grounding is on. */
export function GroundingEditor() {
  const [text, setText] = useState(() => getGroundingText());
  const [saved, setSaved] = useState(true);

  return (
    <div>
      {!saved && (
        <span className="pkd-badge" style={{ color: "var(--pkd-warning)", float: "right", fontSize: "var(--pkd-text-xs)" }}>
          UNSAVED
        </span>
      )}
      <JsonCodeEditor
        value={text}
        onChange={(value) => {
          setText(value);
          setSaved(false);
        }}
        label="Grounding document"
        height="18rem"
      />
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => {
            setGroundingText(text);
            setSaved(true);
          }}
          disabled={saved}
          className="pkd-button pkd-button-primary text-xs px-3 py-1 disabled:opacity-50"
        >
          {saved ? "✓ APPLIED" : "APPLY"}
        </button>
        <button
          type="button"
          onClick={() => {
            const next = getDefaultGroundingText();
            setText(next);
            setGroundingText(next);
            setSaved(true);
          }}
          className="pkd-button pkd-button-secondary text-xs px-3 py-1"
        >
          RESET
        </button>
      </div>
    </div>
  );
}
