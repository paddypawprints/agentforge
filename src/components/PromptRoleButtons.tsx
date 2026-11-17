import { PROMPT_BLOCKS } from "../services/promptStructure";

/** Inserts a JSON role, with a blank line around it. */
export function PromptRoleButtons({ onInsert }: { onInsert: (snippet: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
      {PROMPT_BLOCKS.map((block) => (
        <button
          key={block.id}
          type="button"
          onClick={() => onInsert(block.template)}
          className="pkd-button pkd-button-secondary text-xs px-3 py-1"
        >
          {block.label}
        </button>
      ))}
    </div>
  );
}
