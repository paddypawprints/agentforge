"use client";

import { useState } from "react";
import { orchestrate, isPassthrough, RunControls } from "../services/orchestrator";
import { Tool, Exchange } from "../types/agent";

interface MessageComposerProps {
  tools: Tool[];
  controls: RunControls;
  mcp: boolean;
  isLoading: boolean;
  onExchange: (exchange: Exchange) => void;
  onLoadingChange: (loading: boolean) => void;
}

function activeConcepts(controls: RunControls, tools: Tool[], mcp: boolean): string {
  if (isPassthrough(controls)) return "PASSTHROUGH — the message is sent to the model as typed";
  const on = [
    controls.memory && "memory",
    controls.chatbot && "chatbot",
    controls.loop && "agent loop",
    controls.grounding && "grounding",
    controls.embeddedTool && (tools.length > 0 ? `embedded tool: ${tools.map((t) => t.name).join(", ")}` : "embedded tool"),
    mcp && "MCP",
  ].filter(Boolean);
  return on.length ? `ON — ${on.join(" · ")}` : "PASSTHROUGH — the message is sent to the model as typed";
}

export function MessageComposer({ tools, controls, mcp, isLoading, onExchange, onLoadingChange }: MessageComposerProps) {
  const [input, setInput] = useState("");

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    onLoadingChange(true);
    try {
      const result = await orchestrate(trimmed, tools, controls);
      onExchange(result);
    } catch (error) {
      onExchange({
        userQuery: trimmed,
        rounds: [{ request: [], finish_reason: 'stop', text: `⚠ Error: ${error instanceof Error ? error.message : String(error)}` }],
        finalAnswer: `⚠ Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      onLoadingChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isLoading
            ? controls.loop ? "Agent is thinking..." : "Waiting for response..."
            : "Send a message... (Enter to send, Shift+Enter for newline)"
        }
        disabled={isLoading}
        rows={3}
        className="pkd-input"
        style={{
          width: "100%",
          boxSizing: "border-box",
          resize: "vertical",
          fontFamily: "var(--pkd-font-mono)",
          fontSize: "var(--pkd-text-sm)",
          opacity: isLoading ? 0.6 : 1,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="pkd-button pkd-button-primary"
          style={{ flex: 1, opacity: isLoading ? 0.5 : 1 }}
        >
          {isLoading
            ? controls.loop ? "[ AGENT THINKING... ]" : "[ WAITING... ]"
            : controls.loop ? "[ SEND → AGENT ]" : "[ SEND → MODEL ]"}
        </button>
        {isLoading && (
          <span className="pkd-text-mono" style={{ fontSize: "var(--pkd-text-xs)", color: 'var(--pkd-primary)', whiteSpace: "nowrap" }}>
            ● ACTIVE
          </span>
        )}
      </div>
      <div className="pkd-text-mono" style={{ fontSize: "var(--pkd-text-xs)", color: 'var(--pkd-foreground-muted)' }}>
        {activeConcepts(controls, tools, mcp)}
      </div>
    </div>
  );
}

