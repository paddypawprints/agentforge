'use client';

import { useEffect, useState } from 'react';
import { useAgentStore } from './store/agentStore';
import { MessageHistory } from './components/MessageHistory';
import { ToolDispatcher } from './components/ToolDispatcher';
import { CostMonitor } from './components/CostMonitor';
import { Tool } from './types/agent';
import { Button } from './components/ui/button';
import { RotateCcw } from 'lucide-react';
import { togglePortkey } from './services/portkey';

// Neo Philip K Dick Paranoid Future Design System
// This app is styled with the PKD design system for a dystopian, surveillance-state aesthetic

/**
 * Mock tools for demonstration
 * These tools show how the agent can invoke external functions
 */
const mockTools: Tool[] = [
  {
    name: 'benefits_lookup',
    description: 'Look up employee benefits information from the 2026 benefits guide',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The benefits question or topic to look up',
        },
      },
      required: ['query'],
    },
    execute: async (input: Record<string, unknown>) => {
      const query = (input.query as string) || '';
      // Simulate API call with grounded data
      await new Promise((resolve) => setTimeout(resolve, 500));
      return `Benefits lookup result for "${query}": Health insurance, 401(k) matching, PTO policy, and wellness programs are available. See Employee_Benefits_2026.md for details.`;
    },
  },
  {
    name: 'salary_calculator',
    description: 'Calculate salary information based on role and level',
    inputSchema: {
      type: 'object',
      properties: {
        role: {
          type: 'string',
          description: 'The job role',
        },
        level: {
          type: 'string',
          description: 'The seniority level (junior, mid, senior)',
        },
      },
      required: ['role', 'level'],
    },
    execute: async (input: Record<string, unknown>) => {
      const role = (input.role as string) || 'unknown';
      const level = (input.level as string) || 'mid';
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      return `Salary calculation for ${level} ${role}: Estimated range $80k-$150k depending on experience and location.`;
    },
  },
];

export default function App() {
  const { messages, clearMessages } = useAgentStore();
  const [session, setSession] = useState<'session2' | 'session3'>('session2');

  // Initialize tools on mount
  useEffect(() => {
    // Tools are available for the ToolDispatcher component to use
    // This demonstrates that tools are initialized at the application level
    console.log('App mounted. Tools initialized:', mockTools.map((t) => t.name));
    
    // Enable/disable Portkey based on session
    togglePortkey(session === 'session3');
  }, [session]);

  return (
    <div className="pkd-scan-lines min-h-screen" style={{ backgroundColor: 'var(--pkd-background)' }}>
      {/* HEADER - Neo PKD Style */}
      <header className="pkd-border-bottom" style={{ borderColor: 'var(--pkd-border-color)' }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="pkd-heading pkd-heading-1 pkd-text-primary">
                ⚠️ AGENT ORCHESTRATION NEXUS
              </h1>
              <p className="pkd-text-mono mt-3 text-sm" style={{ color: 'var(--pkd-foreground-muted)' }}>
                {session === 'session2' 
                  ? '[ SESSION 2 ] STATE & ORCHESTRATION — Observe stateful message history and tool dispatch'
                  : '[ SESSION 3 ] GOVERNANCE & FINOPS — Monitor costs and PII masking with Portkey gateway'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as 'session2' | 'session3')}
                className="pkd-input"
                style={{
                  backgroundColor: 'var(--pkd-background-secondary)',
                  borderColor: 'var(--pkd-border-color)',
                  color: 'var(--pkd-foreground)',
                }}
              >
                <option value="session2">SESSION 2: STATE & ORCHESTRATION</option>
                <option value="session3">SESSION 3: GOVERNANCE & FINOPS</option>
              </select>
              <button
                onClick={clearMessages}
                className="pkd-button pkd-button-secondary"
                title="Clear all messages and reset the session"
              >
                <RotateCcw className="inline h-4 w-4 mr-2" />
                CLEAR SESSION
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - Grid Layout */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* INSTRUCTIONS CARD */}
        <div className="pkd-card mb-8 pkd-paranoid-pulse">
          <h2 className="pkd-heading pkd-heading-3 pkd-text-primary mb-4">
            ⚡ INSTRUCTIONS FOR PARTICIPANTS
          </h2>
          <div className="space-y-3">
            <div className="pkd-border-left pl-4">
              <p className="pkd-text-mono text-sm" style={{ color: 'var(--pkd-foreground)' }}>
                <span className="pkd-text-primary">→</span> <strong>OBSERVE THE MESSAGES ARRAY:</strong> Each message you send and each tool invocation appears in the message history. This demonstrates stateful orchestration.
              </p>
            </div>
            <div className="pkd-border-left pl-4">
              <p className="pkd-text-mono text-sm" style={{ color: 'var(--pkd-foreground)' }}>
                <span className="pkd-text-secondary">→</span> <strong>INVOKE TOOLS:</strong> Use the Tool Dispatcher to invoke the "benefits_lookup" or "salary_calculator" tools. Watch how the agent handles tool calls and results.
              </p>
            </div>
            <div className="pkd-border-left pl-4">
              <p className="pkd-text-mono text-sm" style={{ color: 'var(--pkd-foreground)' }}>
                <span className="pkd-text-accent">→</span> <strong>CLEAR SESSION:</strong> Click the "CLEAR SESSION" button to reset all messages. This demonstrates that there is no state leakage between sessions.
              </p>
            </div>
            <div className="pkd-border-left pl-4">
              <p className="pkd-text-mono text-sm" style={{ color: 'var(--pkd-foreground)' }}>
                <span className="pkd-text-primary">→</span> <strong>KEY INSIGHT:</strong> Memory and tool use are application-level logic, not model capabilities. The agent orchestrator manages the message history and tool dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* GRID LAYOUT - 2 COLUMNS */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* MESSAGE HISTORY SECTION */}
          <div className="flex flex-col">
            <div className="pkd-heading pkd-heading-3 pkd-text-primary mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-current animate-pulse"></span>
              MESSAGE HISTORY
            </div>
            <div className="pkd-card flex-1 overflow-hidden">
              <MessageHistory />
            </div>
            <div className="pkd-text-mono mt-3 text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
              <span className="pkd-badge">TOTAL MESSAGES: {messages.length}</span>
            </div>
          </div>

          {/* TOOL DISPATCHER SECTION */}
          <div className="flex flex-col">
            <div className="pkd-heading pkd-heading-3 pkd-text-secondary mb-4 flex items-center gap-2">
              <span className="inline-block w-3 h-3 bg-current animate-pulse"></span>
              TOOL DISPATCHER
            </div>
            <div className="pkd-card flex-1 overflow-hidden">
              <ToolDispatcher />
            </div>
            <div className="pkd-text-mono mt-3 text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
              <span className="pkd-badge pkd-badge-secondary">AVAILABLE TOOLS: {mockTools.length}</span>
            </div>
          </div>
        </div>

        {/* COST MONITOR - Session 3 Only */}
        {session === 'session3' && (
          <div className="mt-8">
            <div className="pkd-heading pkd-heading-3 pkd-text-accent mb-4">
              💰 COST MONITOR
            </div>
            <div className="pkd-card">
              <CostMonitor />
            </div>
          </div>
        )}

        {/* FOOTER - System Status */}
        <div className="pkd-alert mt-8 pkd-text-mono text-center text-xs">
          <p style={{ color: 'var(--pkd-foreground)' }}>
            <span className="pkd-text-primary">[ SYSTEM STATUS ]</span> This demo shows how agents orchestrate state (messages) and tool dispatch separately from the LLM model. The message history persists during the session and can be cleared to demonstrate no state leakage.
          </p>
        </div>

        {/* GRID REFERENCE */}
        <div className="mt-12 pt-8 pkd-border-top" style={{ borderColor: 'var(--pkd-border-color)' }}>
          <p className="pkd-text-mono text-xs text-center" style={{ color: 'var(--pkd-foreground-muted)' }}>
            Neo Philip K Dick Paranoid Future Design System v1.0 | Grid: 8px | Surveillance Active
          </p>
        </div>
      </main>
    </div>
  );
}
