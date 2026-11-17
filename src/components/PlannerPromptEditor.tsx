import { useRef, useState } from "react";
import { getDefaultPlannerPrompt, getPlannerPrompt, setPlannerPrompt } from "../services/orchestrator";
import { JsonCodeEditor, JsonCodeEditorHandle } from "./JsonCodeEditor";
import { PromptRoleButtons } from "./PromptRoleButtons";

/** The prompt used only for the planning step. */
export function PlannerPromptEditor() {
  const [prompt, setPromptState] = useState(() => getPlannerPrompt());
  const [saved, setSaved] = useState(true);
  const box = useRef<JsonCodeEditorHandle>(null);

  function insert(snippet: string) {
    if (box.current) {
      box.current.insert(snippet);
      return;
    }
    setPromptState(prompt.trim() ? `${prompt.replace(/\s*$/, "\n")}${snippet}` : snippet.trim());
    setSaved(false);
  }

  return (
    <div>
      {!saved && (
        <span className="pkd-badge" style={{ color: "var(--pkd-warning)", float: "right", fontSize: "var(--pkd-text-xs)" }}>
          UNSAVED
        </span>
      )}
      <PromptRoleButtons onInsert={insert} />
      <JsonCodeEditor
        ref={box}
        value={prompt}
        onChange={(value) => {
          setPromptState(value);
          setSaved(false);
        }}
        label="Planner prompt"
        height="16rem"
      />
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => {
            setPlannerPrompt(prompt);
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
            const next = getDefaultPlannerPrompt();
            setPromptState(next);
            setPlannerPrompt(next);
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
