/**
 * Local model defaults. The model card starts from these and can be edited.
 * Calls go through the dev server, which forwards to the base URL on the card.
 * That URL starts as `host` plus `/v1`.
 */
export const llmConfig = {
  model: "qwen3.5:9b",
  /** Daemon address. The Ollama base URL starts as this plus /v1. */
  host: "http://127.0.0.1:11434",
  baseUrl: "/ollama",
} as const;
