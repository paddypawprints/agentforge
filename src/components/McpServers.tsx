import { useState } from "react";
import { mcpTransport, McpEndpoint } from "../services/mcp";

const fieldStyle = {
  flex: 1,
  minWidth: "8rem",
  padding: "0.2rem 0.4rem",
};

export function McpServers({
  enabled,
  servers,
  included,
  onIncluded,
  onAdd,
  onRemove,
  onHelper,
}: {
  enabled: boolean;
  servers: McpEndpoint[];
  included: Record<string, boolean>;
  onIncluded: (id: string, value: boolean) => void;
  onAdd: (server: McpEndpoint) => void;
  onRemove: (id: string) => void;
  onHelper: (id: string, value: string) => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const builtin = new Set(["salary", "retirement"]);

  function add() {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    if (!trimmedName || !trimmedUrl) return;
    onAdd({
      id: crypto.randomUUID(),
      name: trimmedName,
      url: trimmedUrl,
      token,
      helper: "",
    });
    setName("");
    setUrl("");
    setToken("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p className="pkd-text-mono" style={{ margin: 0, fontSize: "var(--pkd-text-xs)", color: "var(--pkd-foreground-muted)" }}>
        {enabled
          ? "On. The harness queries the selected servers at session start. {{mcp}} is each tool's name, description, and parameters. {{mcp-helper}} is the note on each selected server."
          : "Off. The harness does not query MCP."}
      </p>
      {servers.map((server) => (
        <div key={server.id} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <label
              className="pkd-text-mono"
              style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "var(--pkd-text-xs)", color: "var(--pkd-foreground)", minWidth: 0 }}
            >
              <input
                type="checkbox"
                checked={!!included[server.id]}
                onChange={(event) => onIncluded(server.id, event.target.checked)}
                aria-label={server.name}
                style={{ accentColor: "var(--pkd-primary)", marginTop: "0.15rem" }}
              />
              <span style={{ display: "flex", flexDirection: "column", gap: "0.15rem", minWidth: 0 }}>
                <span style={{ letterSpacing: "0.06em", fontWeight: 700 }}>{server.name.toUpperCase()}</span>
                <span style={{ color: "var(--pkd-foreground-muted)" }}>{mcpTransport(server.url)} · {server.url}</span>
              </span>
            </label>
            {!builtin.has(server.id) && (
              <button
                type="button"
                onClick={() => onRemove(server.id)}
                className="pkd-button pkd-button-secondary text-xs"
                style={{ marginLeft: "auto" }}
              >
                REMOVE
              </button>
            )}
          </div>
          <label className="pkd-text-mono" style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "var(--pkd-text-xs)", color: "var(--pkd-foreground-muted)" }}>
            HELPER
            <textarea
              value={server.helper}
              onChange={(event) => onHelper(server.id, event.target.value)}
              className="pkd-input"
              aria-label={`Helper for ${server.name}`}
              spellCheck={false}
              rows={3}
              placeholder="How this server's tools map onto the company data."
              style={{ width: "100%", resize: "vertical", lineHeight: 1.45 }}
            />
          </label>
        </div>
      ))}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
        <span className="pkd-text-mono" style={{ fontSize: "var(--pkd-text-xs)", letterSpacing: "0.06em", color: "var(--pkd-foreground-muted)" }}>
          ADD SERVER
        </span>
        <label className="flex items-center gap-1.5 pkd-text-mono text-xs" style={{ color: "var(--pkd-foreground-muted)" }}>
          NAME
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="pkd-input"
            aria-label="MCP server name"
            spellCheck={false}
            style={fieldStyle}
          />
        </label>
        <label className="flex items-center gap-1.5 pkd-text-mono text-xs" style={{ color: "var(--pkd-foreground-muted)" }}>
          URL
          <input
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="pkd-input"
            aria-label="MCP server URL"
            spellCheck={false}
            placeholder="https://example.com/mcp"
            style={fieldStyle}
          />
        </label>
        <label className="flex items-center gap-1.5 pkd-text-mono text-xs" style={{ color: "var(--pkd-foreground-muted)" }}>
          TOKEN
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="pkd-input"
            aria-label="MCP token"
            autoComplete="off"
            spellCheck={false}
            placeholder="optional"
            style={fieldStyle}
          />
        </label>
        <button type="button" onClick={add} className="pkd-button pkd-button-secondary text-xs" style={{ alignSelf: "flex-start" }}>
          ADD
        </button>
      </div>
    </div>
  );
}
