'use client';

import { useEffect, useState } from 'react';
import { useAgentStore } from './store/agentStore';
import { HopList } from './components/MessageHistory';
import { ToolDispatcher } from './components/ToolDispatcher';
import { MessageComposer } from './components/MessageComposer';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { RotateCcw } from 'lucide-react';
import { setTemperature } from './services/orchestrator';
import { clearMemory } from './services/memory';
import { ModelBadge } from './components/ModelBadge';
import { SystemPromptEditor } from './components/SystemPromptEditor';
import { benefitsLookupTool } from './services/tools';
import predevBadge from '../public/predev.jpg';

const agentTools = [benefitsLookupTool];

export default function App() {
  const { messages, clearMessages } = useAgentStore();
  const [temperature, setTemperatureState] = useState(1.0);
  const [agentMode, setAgentMode] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>('chatbot');

  useEffect(() => {
    console.log('App mounted. Tools:', agentTools.map((t) => t.name));
  }, []);

  return (
    <div className="pkd-scan-lines min-h-screen" style={{ backgroundColor: 'var(--pkd-background)' }}>
      {/* HEADER */}
      <header className="pkd-border-bottom" style={{ borderColor: 'var(--pkd-border-color)' }}>
        <div style={{ width: '100%', padding: '1rem 1.5rem', boxSizing: 'border-box' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="pkd-heading pkd-heading-2 pkd-text-primary truncate">
                AI AGENTS
              </h1>
              <p className="pkd-text-mono mt-1 text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                State &amp; Orchestration
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Temperature */}
              <label className="flex items-center gap-1.5 pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                TEMP
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) { setTemperatureState(v); setTemperature(v); }
                  }}
                  style={{ width: '80px', accentColor: 'var(--pkd-primary)', cursor: 'pointer' }}
                />
                <span style={{ color: 'var(--pkd-foreground)', minWidth: '2.5ch', textAlign: 'right' }}>
                  {temperature.toFixed(1)}
                </span>
              </label>
              <ModelBadge />
              <button
                onClick={() => { clearMessages(); clearMemory(); }}
                className="pkd-button pkd-button-secondary text-xs"
                title="Clear all messages and reset the session"
              >
                <RotateCcw className="inline h-3 w-3 mr-1" />
                CLEAR
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - 2 Column Layout */}
      <main style={{ width: '100%', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* LEFT COLUMN: Instructions + Tool Dispatcher */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* INSTRUCTIONS CARD */}
            <div className="pkd-card">
              <h2 className="pkd-heading pkd-heading-3 pkd-text-primary mb-4">
                ⚡ WORKSHOP EXERCISE
              </h2>
              {/* Architecture diagram */}
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--pkd-primary-border)', borderRadius: '2px' }}>
                <ArchitectureDiagram />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

                <div style={{ borderLeft: '2px solid var(--pkd-primary)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: 0 }}>
                    <span style={{ color: 'var(--pkd-primary)', fontWeight: 700 }}>1. SYSTEM PROMPT —</span> Select <em>HR CHATBOT</em>. Try on-topic questions (<em>"What is the PTO policy?"</em>) and off-topic ones (<em>"Write me a poem."</em>). Edit the prompt and see how the behaviour changes.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-primary)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: 0 }}>
                    <span style={{ color: 'var(--pkd-primary)', fontWeight: 700 }}>2. GROUNDING —</span> Switch to <em>BENEFITS DOC</em>. Scroll the prompt to see the policy text injected inline. Ask questions that are in the document, then ask something not covered — notice the difference.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-secondary)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: 0 }}>
                    <span style={{ color: 'var(--pkd-secondary)', fontWeight: 700 }}>3. TOOLS —</span> Use the Tool Sandbox below. Enter <em>EMP001</em> and click LOOKUP BENEFITS. This is the raw JSON the tool returns — examine the structure.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-warning)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: 0 }}>
                    <span style={{ color: 'var(--pkd-warning)', fontWeight: 700 }}>4. ASK WITHOUT TOOLS —</span> Switch back to <em>HR CHATBOT</em> (no tools). Ask: <em>"What are the benefits for EMP001?"</em> The model has no data — observe what it says.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-warning)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: 0 }}>
                    <span style={{ color: 'var(--pkd-warning)', fontWeight: 700 }}>5. PASTE THE DATA —</span> Copy the tool output from step 3 and paste it into the chat as a follow-up message. Ask the same question. The model can now answer — this is manual grounding.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-primary)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: 0 }}>
                    <span style={{ color: 'var(--pkd-primary)', fontWeight: 700 }}>6. USE THE AGENT —</span> Switch to <em>HR AGENT</em>. Ask the same question. Watch the trace: the Harness calls the tool automatically, injects the result, and re-submits to the LLM — exactly what you did manually in step 5.
                  </p>
                </div>

              </div>
            </div>

            {/* TOOL DISPATCHER */}
            <div className="flex flex-col">
              <div className="pkd-heading pkd-heading-3 pkd-text-secondary mb-4 flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-current animate-pulse"></span>
                TOOL SANDBOX — MANUAL INVOCATION
              </div>
              <div className="pkd-card flex-1 overflow-hidden">
                <ToolDispatcher />
              </div>
              <div className="pkd-text-mono mt-3 text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                <span className="pkd-badge pkd-badge-secondary">Results shown inline — NOT sent to LLM history</span>
              </div>
            </div>


          </div>

          {/* RIGHT COLUMN: System Prompt + Message Composer + Message History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* AGENT MODE TOGGLE + SYSTEM PROMPT */}
            <div>
              <label
                className="flex items-center gap-2 pkd-text-mono"
                style={{
                  fontSize: 'var(--pkd-text-sm)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: agentMode ? 'var(--pkd-primary)' : 'var(--pkd-foreground-muted)',
                  cursor: 'pointer',
                  userSelect: 'none',
                  marginBottom: agentMode ? '0.75rem' : 0,
                }}
              >
                <input
                  type="checkbox"
                  checked={agentMode}
                  onChange={(e) => setAgentMode(e.target.checked)}
                  style={{ accentColor: 'var(--pkd-primary)', width: '1rem', height: '1rem', cursor: 'pointer' }}
                />
                AGENT MODE
                {!agentMode && (
                  <span style={{ fontWeight: 400, color: 'var(--pkd-foreground-muted)', marginLeft: '0.5rem' }}>
                    — direct LLM, no system prompt, no tools, no memory
                  </span>
                )}
              </label>
              {agentMode && <SystemPromptEditor variant="pkd" onPresetChange={setActivePreset} />}
            </div>

            {/* MESSAGE COMPOSER */}
            <div>
              <div className="pkd-heading pkd-heading-3 pkd-text-accent mb-4 flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-current animate-pulse"></span>
                {agentMode ? 'SEND MESSAGE TO AGENT' : 'SEND MESSAGE TO LLM'}
              </div>
              <div className="pkd-card">
                <div style={{ padding: '1.25rem' }}>
                  <MessageComposer
                    tools={activePreset === 'agent' ? agentTools : []}
                    controls={{ memory: agentMode, chatbot: false, systemPrompt: agentMode, loop: agentMode, embeddedTool: false, mcp: false, grounding: false, maxTasks: 8, maxToolRounds: 5, maxRetries: 1 }}
                    mcp={false}
                    isLoading={false}
                    onExchange={() => {}}
                    onLoadingChange={() => {}}
                  />
                </div>
              </div>
            </div>

            {/* LAST EXCHANGE TRACE */}
            <div className="flex flex-col">
              <div className="pkd-heading pkd-heading-3 pkd-text-primary mb-4 flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-current animate-pulse"></span>
                LAST EXCHANGE TRACE
              </div>
              <div className="pkd-card flex-1 overflow-hidden">
                <HopList exchanges={[]} selectedId={null} onSelect={() => {}} followId={null} />
              </div>
              <div className="pkd-text-mono mt-3 text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                <span className="pkd-badge">TURNS: {messages.filter(m => m.role === 'user').length}</span>
              </div>
            </div>
          </div>

        </div>

        {/* FOOTER - System Status */}
        <div className="pkd-alert mt-8 pkd-text-mono text-center text-xs">
          <p style={{ color: 'var(--pkd-foreground)' }}>
            <span className="pkd-text-primary">System Status:</span> Left: Tool Sandbox (direct invocation, result inline only). Right: Agent chat (LLM-driven, agentic loop visible). Tools: <strong>benefits_lookup</strong>
          </p>
        </div>

        {/* GRID REFERENCE + PRE.DEV BADGE */}
        <div className="mt-12 pt-8 pkd-border-top flex items-center justify-between" style={{ borderColor: 'var(--pkd-border-color)' }}>
          <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
            Alpine Spring Design System | AI Agents Workshop
          </p>
          <a href="https://pre.dev" target="_blank" rel="noopener noreferrer">
            <img
              src={predevBadge}
              alt="Designed by pre.dev"
              style={{ height: '32px', width: 'auto', display: 'block', borderRadius: '4px' }}
            />
          </a>
        </div>
      </main>
    </div>
  );
}
