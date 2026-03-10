"use client";

import { useState } from "react";
import { useAgentStore } from "../store/agentStore";
import { orchestrate } from "../services/orchestrator";
import { Tool } from "../types/agent";

interface MessageComposerProps {
  tools: Tool[];
  gatewayUrl?: string;
}

export function MessageComposer({ tools, gatewayUrl }: MessageComposerProps) {
  const { isLoading } = useAgentStore();
  const [input, setInput] = useState("");

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    await orchestrate(trimmed, tools, gatewayUrl);
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
        placeholder={isLoading ? "Agent is thinking..." : "Ask the agent something... (Enter to send, Shift+Enter for newline)"}
        disabled={isLoading}
        rows={3}
        className="pkd-input"
        style={{
          width: "100%",
          boxSizing: "border-box",
          resize: "vertical",
          fontFamily: "var(--pkd-font-mono)",
          fontSize: "0.875rem",
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
          {isLoading ? "[ AGENT THINKING... ]" : "[ SEND → AGENT ]"}
        </button>
        {isLoading && (
          <span className="pkd-text-mono" style={{ fontSize: "0.75rem", color: '#00ff41', whiteSpace: "nowrap" }}>
            ● ACTIVE
          </span>
        )}
      </div>
      <div className="pkd-text-mono" style={{ fontSize: "0.75rem", color: '#dce8d4' }}>
        TOOLS AVAILABLE: {tools.map((t) => t.name).join(" · ")}
      </div>
    </div>
  );
}
