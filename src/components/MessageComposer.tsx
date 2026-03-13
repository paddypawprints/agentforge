"use client";

import { useState } from "react";
import { orchestrate, sendMessage } from "../services/orchestrator";
import { Tool, Exchange } from "../types/agent";

interface MessageComposerProps {
  tools: Tool[];
  agentMode: boolean;
  isLoading: boolean;
  onExchange: (exchange: Exchange) => void;
  onLoadingChange: (loading: boolean) => void;
  gatewayUrl?: string;
}

export function MessageComposer({ tools, agentMode, isLoading, onExchange, onLoadingChange, gatewayUrl }: MessageComposerProps) {
  const [input, setInput] = useState("");

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    onLoadingChange(true);
    try {
      const result = agentMode
        ? await orchestrate(trimmed, tools, gatewayUrl)
        : await sendMessage(trimmed, gatewayUrl);
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
            ? agentMode ? "Agent is thinking..." : "Waiting for response..."
            : agentMode
            ? "Ask the agent something... (Enter to send, Shift+Enter for newline)"
            : "Send a message to the LLM... (Enter to send, Shift+Enter for newline)"
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
            ? agentMode ? "[ AGENT THINKING... ]" : "[ WAITING... ]"
            : agentMode ? "[ SEND → AGENT ]" : "[ SEND → LLM ]"}
        </button>
        {isLoading && (
          <span className="pkd-text-mono" style={{ fontSize: "var(--pkd-text-xs)", color: 'var(--pkd-primary)', whiteSpace: "nowrap" }}>
            ● ACTIVE
          </span>
        )}
      </div>
      <div className="pkd-text-mono" style={{ fontSize: "var(--pkd-text-xs)", color: 'var(--pkd-foreground-muted)' }}>
        {agentMode
          ? tools.length > 0 ? `TOOLS AVAILABLE: ${tools.map(t => t.name).join(" · ")}` : "AGENT MODE — system prompt + memory, no tools"
          : "DIRECT MODE — user message only, no system prompt, no memory"}
      </div>
    </div>
  );
}

