import { llmConfig } from "../config";

/** Read-only label for the model in src/config.ts. */
export function ModelBadge() {
  return (
    <span
      className="pkd-text-mono text-xs"
      title="Change the model in src/config.ts"
      style={{
        color: "var(--pkd-foreground)",
        border: "1px solid var(--pkd-primary-border, var(--pkd-border-color))",
        background: "var(--pkd-background-secondary)",
        padding: "0.35rem 0.6rem",
        whiteSpace: "nowrap",
      }}
    >
      MODEL {llmConfig.model}
    </span>
  );
}
