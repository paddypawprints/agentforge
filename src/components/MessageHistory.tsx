import { useEffect } from "react";
import { McpQuery } from "../services/mcp";
import { Exchange, PromptMessage, Round } from "../types/agent";

export interface Hop {
  id: string;
  turn: number;
  from: string;
  to: string;
  summary: string;
  /** The whole payload. A model call is the JSON body that was posted. A model reply is the choice object. */
  body: string;
}

function pretty(value: unknown): string {
  try { return JSON.stringify(value, null, 2); }
  catch { return String(value); }
}

function prettyText(text: string): string {
  try { return JSON.stringify(JSON.parse(text), null, 2); }
  catch { return text; }
}

function formatMessage(msg: PromptMessage): string {
  switch (msg.source) {
    case "system": return `SYSTEM\n${msg.text}`;
    case "chatbot": return `CHATBOT\n${msg.text}`;
    case "worker": return `WORKER\n${msg.text}`;
    case "task": return `TASK\n${msg.text}`;
    case "summary": return `SUMMARIZER\n${msg.text}`;
    case "memory_user": return `MEMORY · USER\n${msg.text}`;
    case "memory_assistant": return `MEMORY · ASSISTANT\n${msg.text}`;
    case "user": return `USER\n${msg.text}`;
    case "assistant": return `ASSISTANT\n${msg.text}`;
    case "tool_call": return `TOOL CALL ${msg.toolName ?? ""}\n${pretty(msg.toolInput)}`;
    case "tool_response": return `TOOL RESULT\n${prettyText(msg.text)}`;
    case "plan": return `PLAN\n${msg.text}`;
    case "embedded_tool": return `TOOL\n${msg.text}`;
    default: return msg.text;
  }
}

function formatRequest(msgs: PromptMessage[]): string {
  return msgs.map(formatMessage).join("\n\n");
}

function oneLine(text: string, max = 72): string {
  const line = text.split("\n").find((l) => l.trim()) ?? "";
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
}

/** The session-start MCP query, drawn before any employee message. */
export function mcpHops(queries: McpQuery[], stamp: number): Hop[] {
  const hops: Hop[] = [];
  queries.forEach((query) => {
    hops.push({
      id: `mcp-${stamp}-${query.id}-out`,
      turn: 0,
      from: "Harness",
      to: "MCP",
      summary: `initialize then tools/list · ${query.server} · ${query.transport}`,
      body: query.request || "(no request)",
    });
    hops.push({
      id: `mcp-${stamp}-${query.id}-in`,
      turn: 0,
      from: "MCP",
      to: "Harness",
      summary: `initialize then tools/list · ${query.server} · ${query.transport}`,
      body: pretty(query.result),
    });
  });
  return hops;
}

function pushToolPath(hops: Hop[], id: () => string, turn: number, speaker: string, round: Round) {
  const args = pretty(round.toolInput);
  if (round.mcp) {
    hops.push({
      id: id(),
      turn,
      from: "Harness",
      to: "MCP",
      summary: `tools/call · ${round.mcp.server} · ${round.mcp.transport}`,
      body: pretty(round.mcp.request),
    });
    hops.push({
      id: id(),
      turn,
      from: "MCP",
      to: "Harness",
      summary: `tools/call · ${round.mcp.server} · ${round.mcp.transport}`,
      body: pretty(round.mcp.response),
    });
  } else {
    hops.push({
      id: id(),
      turn,
      from: "Harness",
      to: "Tool",
      summary: round.toolName ?? "tool",
      body: `${round.toolName}(${args})`,
    });
    hops.push({
      id: id(),
      turn,
      from: "Tool",
      to: "Harness",
      summary: round.toolName ?? "tool",
      body: round.toolResult ? prettyText(round.toolResult) : "(no result)",
    });
  }
  hops.push({
    id: id(),
    turn,
    from: "Harness",
    to: speaker,
    summary: `tool result · ${round.toolName ?? "tool"}`,
    body: round.toolResult ? prettyText(round.toolResult) : "(no result)",
  });
}

/** Walk every turn into the arrows the session diagram draws. */
export function buildHops(exchanges: Exchange[]): Hop[] {
  const hops: Hop[] = [];

  exchanges.forEach((exchange, turnIdx) => {
    const turn = turnIdx + 1;
    const first = exchange.rounds[0]?.request ?? [];
    let n = 0;
    const id = () => `t${turn}-h${n++}`;

    hops.push({
      id: id(),
      turn,
      from: "User",
      to: "Harness",
      summary: oneLine(exchange.userQuery) || "(empty)",
      body: exchange.userQuery,
    });

    const memory = first.filter((m) => m.source === "memory_user" || m.source === "memory_assistant");
    if (memory.length > 0) {
      const pairs = memory.filter((m) => m.source === "memory_user").length;
      hops.push({
        id: id(),
        turn,
        from: "Memory",
        to: "Harness",
        summary: `${pairs} prior turn${pairs === 1 ? "" : "s"}`,
        body: formatRequest(memory),
      });
    }

    exchange.rounds.forEach((round) => {
      const speaker =
        round.step === "agent" ? "LLM(Agent)" :
        round.step === "plan" ? "LLM(Planner)" :
        round.step === "task" ? "LLM(Worker)" :
        round.step === "summary" ? "LLM(Summarizer)" :
        "Model";
      const promptRole =
        round.step === "agent" ? "agent" :
        round.step === "plan" ? "planner" :
        round.step === "task" ? "worker" :
        round.step === "summary" ? "summarizer" :
        "model";
      const passthrough = !round.step
        && round.request.length === 1
        && round.request[0]?.source === "user";
      const reply = round.response != null ? pretty(round.response) : (round.text || "(no response)");

      hops.push({
        id: id(),
        turn,
        from: "Harness",
        to: speaker,
        summary: round.step
          ? `${promptRole} prompt`
          : passthrough
          ? "passthrough"
          : `${round.request.length} messages`,
        body: round.sent != null ? pretty(round.sent) : formatRequest(round.request),
      });
      if (round.finish_reason === "tool_calls" && round.toolName) {
        hops.push({
          id: id(),
          turn,
          from: speaker,
          to: "Harness",
          summary: `tool_calls · ${round.toolName}`,
          body: reply,
        });
        pushToolPath(hops, id, turn, speaker, round);
      } else {
        hops.push({
          id: id(),
          turn,
          from: speaker,
          to: "Harness",
          summary: oneLine(round.text || "(no response)"),
          body: reply,
        });
      }
    });

    const reply = exchange.finalAnswer || "(no response)";
    hops.push({
      id: id(),
      turn,
      from: "Harness",
      to: "User",
      summary: oneLine(reply) || "(no response)",
      body: reply,
    });
  });

  return hops;
}

function structured(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) return text;
  try { return JSON.parse(trimmed); } catch { /* several JSON values, or prose */ }
  const parts = trimmed.split(/\n\n+/);
  if (parts.length > 1) {
    try { return parts.map((part) => JSON.parse(part)); } catch { /* keep the text */ }
  }
  return text;
}

/** The whole trace as JSON: one entry per arrow, in the order the column draws them. */
export function sessionExtract(hops: Hop[], turns: number): string {
  return JSON.stringify({
    turns,
    hops: hops.map((hop) => {
      return {
        turn: hop.turn,
        from: hop.from,
        to: hop.to,
        summary: hop.summary,
        body: structured(hop.body),
      };
    }),
  }, null, 2);
}

export function HopInspector({ hop }: { hop: Hop | null }) {
  return (
    <div className="pkd-card" style={{ padding: "0.75rem 0.9rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "baseline", marginBottom: "0.45rem" }}>
        <span className="pkd-text-mono" style={{ fontSize: "var(--pkd-text-xs)", letterSpacing: "0.08em", color: "var(--pkd-primary)", fontWeight: 700 }}>
          {hop ? `${hop.from.toUpperCase()} → ${hop.to.toUpperCase()}` : "SELECT AN ARROW"}
        </span>
      </div>
      <pre
        className="pkd-text-mono"
        style={{
          margin: 0,
          height: "12rem",
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: "var(--pkd-text-sm)",
          color: hop ? "var(--pkd-foreground)" : "var(--pkd-foreground-muted)",
        }}
      >
        {hop ? hop.body : "Send a message, then choose an arrow to read what moved."}
      </pre>
    </div>
  );
}

export function HopList({
  exchanges,
  leading = [],
  selectedId,
  onSelect,
  followId,
}: {
  exchanges: Exchange[];
  /** Hops drawn before the first turn. Session-start MCP queries use turn 0. */
  leading?: Hop[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Scroll this hop into view when it changes, if the reader is still following the session. */
  followId: string | null;
}) {
  const hops = [...leading, ...buildHops(exchanges)];

  useEffect(() => {
    if (!followId) return;
    const el = document.getElementById(followId);
    if (!el) return;
    const scroller = el.closest("[data-hop-scroll]");
    if (scroller instanceof HTMLElement) {
      const distance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
      if (distance > 360) return;
    }
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [followId]);

  if (hops.length === 0) {
    return (
      <p className="pkd-text-mono" style={{ fontSize: "var(--pkd-text-sm)", color: "var(--pkd-warning)", margin: 0 }}>
        [ NO MESSAGES ] — Type a message and press SEND to start.
      </p>
    );
  }

  let lastTurn = -1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {hops.map((hop) => {
        const divider = hop.turn !== lastTurn;
        lastTurn = hop.turn;
        const selected = hop.id === selectedId;
        return (
          <div key={hop.id}>
            {divider && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 0" }}>
                <div style={{ flex: 1, height: "1px", background: "var(--pkd-warning-border)" }} />
                <span className="pkd-text-mono" style={{ fontSize: "var(--pkd-text-xs)", letterSpacing: "0.08em", color: "var(--pkd-warning)", whiteSpace: "nowrap" }}>
                  {hop.turn === 0 ? "SESSION" : `TURN ${hop.turn}`}
                </span>
                <div style={{ flex: 1, height: "1px", background: "var(--pkd-warning-border)" }} />
              </div>
            )}
            <button
              id={hop.id}
              type="button"
              onClick={() => onSelect(hop.id)}
              aria-pressed={selected}
              className="pkd-text-mono"
              style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
                padding: "0.45rem 0.7rem",
                borderRadius: "2px",
                border: `1px solid ${selected ? "var(--pkd-primary)" : "var(--pkd-border-color)"}`,
                background: selected ? "var(--pkd-primary-bg)" : "transparent",
                color: "var(--pkd-foreground)",
              }}
            >
              <span style={{ display: "block", fontSize: "var(--pkd-text-xs)", letterSpacing: "0.06em", color: "var(--pkd-primary)", fontWeight: 700 }}>
                {hop.from} → {hop.to}
              </span>
              <span style={{ display: "block", marginTop: "0.15rem", fontSize: "var(--pkd-text-xs)", color: "var(--pkd-foreground-muted)" }}>
                {hop.summary}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
