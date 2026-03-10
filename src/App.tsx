'use client';

import { useEffect, useState } from 'react';
import { useAgentStore } from './store/agentStore';
import { MessageHistory } from './components/MessageHistory';
import { ToolDispatcher } from './components/ToolDispatcher';
import { Tool } from './types/agent';
import { Button } from './components/ui/button';
import { RotateCcw } from 'lucide-react';
import { ApiKeyInput } from './components/ApiKeyInput';
import { SystemPromptEditor } from './components/SystemPromptEditor';

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
  }, [session]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Agent Orchestration Demo
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {session === 'session2' 
                  ? 'Session 2: State & Orchestration — Observe stateful message history and tool dispatch'
                  : 'Session 3: Governance & FinOps — Monitor costs and PII masking with Portkey gateway'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as 'session2' | 'session3')}
                className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="session2">Session 2: State & Orchestration</option>
                <option value="session3">Session 3: Governance & FinOps</option>
              </select>
              <ApiKeyInput />
              <Button
                onClick={clearMessages}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                title="Clear all messages and reset the session (demonstrates no state leakage)"
              >
                <RotateCcw className="h-4 w-4" />
                Clear Session
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* LEFT COLUMN: Instructions + Tool Dispatcher */}
          <div className="flex flex-col gap-8">
            {/* Instructions */}
            <div className="rounded-lg border border-border bg-card p-6 text-card-foreground">
              <h2 className="mb-3 text-lg font-semibold">Instructions for Participants</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Observe the Messages Array:</strong> Each message you send and each tool invocation appears in the message history. This demonstrates stateful orchestration.
                </li>
                <li>
                  <strong>Invoke Tools:</strong> Use the Tool Dispatcher to invoke the "benefits_lookup" or "salary_calculator" tools. Watch how the agent handles tool calls and results.
                </li>
                <li>
                  <strong>Clear Session:</strong> Click the "Clear Session" button to reset all messages. This demonstrates that there is no state leakage between sessions — each run starts fresh.
                </li>
                <li>
                  <strong>Key Insight:</strong> Memory and tool use are application-level logic, not model capabilities. The agent orchestrator manages the message history and tool dispatch.
                </li>
              </ul>
            </div>

            {/* Tool Dispatcher */}
            <div className="flex flex-col">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Tool Dispatcher</h2>
              <div className="flex-1 rounded-lg border border-border bg-card">
                <ToolDispatcher />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Available tools: {mockTools.length}
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: System Prompt + Message History */}
          <div className="flex flex-col gap-8">
            {/* System Prompt Editor */}
            <SystemPromptEditor />

            {/* Message History */}
            <div className="flex flex-col">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Message History</h2>
              <div className="flex-1 rounded-lg border border-border bg-card">
                <MessageHistory />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Total messages: {messages.length}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 rounded-lg border border-border bg-muted/50 p-4 text-center text-xs text-muted-foreground">
          <p>
            This demo shows how agents orchestrate state (messages) and tool dispatch separately from the LLM model.
            The message history persists during the session and can be cleared to demonstrate no state leakage.
          </p>
        </div>
      </main>
    </div>
  );
}
