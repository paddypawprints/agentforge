'use client';

import { useEffect, useState } from 'react';
import { useAgentStore } from './store/agentStore';
import { MessageHistory } from './components/MessageHistory';
import { ToolDispatcher } from './components/ToolDispatcher';
import { MessageComposer } from './components/MessageComposer';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { RotateCcw } from 'lucide-react';
import { setPortkeyApiKey, isPortkeyActive, setTemperature } from './services/orchestrator';
import { ApiKeyInput } from './components/ApiKeyInput';
import { SystemPromptEditor } from './components/SystemPromptEditor';
import { benefitsLookupTool } from './services/tools';

const agentTools = [benefitsLookupTool];

export default function App() {
  const { messages, clearMessages } = useAgentStore();
  const [portkeyEnabled, setPortkeyEnabled] = useState(false);
  const [portkeyKey, setPortkeyKey] = useState('');
  const [temperature, setTemperatureState] = useState(1.0);

  useEffect(() => {
    console.log('App mounted. Tools:', agentTools.map((t) => t.name));
  }, []);

  function handlePortkeyToggle(enabled: boolean) {
    setPortkeyEnabled(enabled);
    setPortkeyApiKey(enabled && portkeyKey ? portkeyKey : null);
  }

  function handlePortkeyKeyChange(key: string) {
    setPortkeyKey(key);
    if (portkeyEnabled) setPortkeyApiKey(key || null);
  }

  return (
    <div className="pkd-scan-lines min-h-screen" style={{ backgroundColor: 'var(--pkd-background)' }}>
      {/* HEADER - Neo PKD Style */}
      <header className="pkd-border-bottom" style={{ borderColor: 'var(--pkd-border-color)' }}>
        <div style={{ width: '100%', padding: '1rem 1.5rem', boxSizing: 'border-box' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="pkd-heading pkd-heading-2 pkd-text-primary truncate">
                ⚠️ AGENT ORCHESTRATION NEXUS
              </h1>
              <p className="pkd-text-mono mt-1 text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                [ AI AGENTS WORKSHOP ] STATE &amp; ORCHESTRATION
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Portkey toggle */}
              <label className="flex items-center gap-1.5 pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={portkeyEnabled}
                  onChange={(e) => handlePortkeyToggle(e.target.checked)}
                  style={{ accentColor: 'var(--pkd-primary)', cursor: 'pointer' }}
                />
                PORTKEY
              </label>
              {portkeyEnabled && (
                <input
                  type="password"
                  value={portkeyKey}
                  onChange={(e) => handlePortkeyKeyChange(e.target.value)}
                  placeholder="Portkey API key"
                  className="pkd-input text-xs"
                  style={{ width: '160px', backgroundColor: 'var(--pkd-background-secondary)', borderColor: portkeyKey ? 'var(--pkd-primary)' : 'var(--pkd-border-color)', color: 'var(--pkd-foreground)' }}
                />
              )}
              {/* Temperature */}
              <label className="flex items-center gap-1.5 pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                TEMP
                <input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v)) { setTemperatureState(v); setTemperature(v); }
                  }}
                  className="pkd-input text-xs"
                  style={{ width: '56px', backgroundColor: 'var(--pkd-background-secondary)', borderColor: 'var(--pkd-border-color)', color: 'var(--pkd-foreground)', textAlign: 'center' }}
                />
              </label>
              <ApiKeyInput variant="pkd" />
              <button
                onClick={clearMessages}
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
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(0,255,65,0.12)', borderRadius: '2px' }}>
                <ArchitectureDiagram />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

                <div style={{ borderLeft: '2px solid #00ff41', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: '0.875rem', color: '#dce8d4', margin: 0 }}>
                    <span style={{ color: '#00ff41', fontWeight: 700 }}>1. SYSTEM PROMPT —</span> Select <em>HR CHATBOT</em>. Try on-topic questions (<em>"What is the PTO policy?"</em>) and off-topic ones (<em>"Write me a poem."</em>). Edit the prompt and see how the behaviour changes.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid #00ff41', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: '0.875rem', color: '#dce8d4', margin: 0 }}>
                    <span style={{ color: '#00ff41', fontWeight: 700 }}>2. GROUNDING —</span> Switch to <em>BENEFITS DOC</em>. Scroll the prompt to see the policy text injected inline. Ask questions that are in the document, then ask something not covered — notice the difference.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid #00e5ff', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: '0.875rem', color: '#dce8d4', margin: 0 }}>
                    <span style={{ color: '#00e5ff', fontWeight: 700 }}>3. TOOLS —</span> Use the Tool Sandbox below. Enter <em>EMP001</em> and click LOOKUP BENEFITS. This is the raw JSON the tool returns — examine the structure.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid #ffe600', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: '0.875rem', color: '#dce8d4', margin: 0 }}>
                    <span style={{ color: '#ffe600', fontWeight: 700 }}>4. ASK WITHOUT TOOLS —</span> Switch back to <em>HR CHATBOT</em> (no tools). Ask: <em>"What are the benefits for EMP001?"</em> The model has no data — observe what it says.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid #ffe600', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: '0.875rem', color: '#dce8d4', margin: 0 }}>
                    <span style={{ color: '#ffe600', fontWeight: 700 }}>5. PASTE THE DATA —</span> Copy the tool output from step 3 and paste it into the chat as a follow-up message. Ask the same question. The model can now answer — this is manual grounding.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid #00ff41', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: '0.875rem', color: '#dce8d4', margin: 0 }}>
                    <span style={{ color: '#00ff41', fontWeight: 700 }}>6. USE THE AGENT —</span> Switch to <em>HR AGENT</em>. Ask the same question. Watch the trace: the Orchestrator calls the tool automatically, injects the result, and re-submits to the LLM — exactly what you did manually in step 5.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid rgba(0,229,255,0.4)', paddingLeft: '0.75rem', marginTop: '0.25rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: '0.75rem', color: '#00e5ff', margin: '0 0 0.4rem 0', letterSpacing: '0.08em' }}>BONUS: OBSERVABILITY WITH PORTKEY</p>
                </div>

                <div style={{ borderLeft: '2px solid #00e5ff', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: '0.875rem', color: '#dce8d4', margin: 0 }}>
                    <span style={{ color: '#00e5ff', fontWeight: 700 }}>7. SETUP PORTKEY —</span> Go to <em>app.portkey.ai</em>, sign in, and create a Virtual Key. Select <strong>Groq</strong> as the provider, enter <strong>aidaysf</strong> as the slug, and paste your Groq API key. Copy the Portkey API key shown at the top.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid #00e5ff', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: '0.875rem', color: '#dce8d4', margin: 0 }}>
                    <span style={{ color: '#00e5ff', fontWeight: 700 }}>8. ENABLE IN UI —</span> Check the <strong>PORTKEY</strong> box in the header and paste your Portkey API key into the field that appears. All LLM traffic now routes through Portkey.
                  </p>
                </div>

                <div style={{ borderLeft: '2px solid #00e5ff', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: '0.875rem', color: '#dce8d4', margin: 0 }}>
                    <span style={{ color: '#00e5ff', fontWeight: 700 }}>9. OBSERVE —</span> Run the HR Agent again (step 6). Switch to the Portkey dashboard and inspect the request log — see the full prompt, token counts, latency, and any PII flagged in the tool output (the SSN field).
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
            {/* SYSTEM PROMPT EDITOR */}
            <SystemPromptEditor variant="pkd" />

            {/* MESSAGE COMPOSER */}
            <div>
              <div className="pkd-heading pkd-heading-3 pkd-text-accent mb-4 flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-current animate-pulse"></span>
                SEND MESSAGE TO AGENT
              </div>
              <div className="pkd-card">
                <div style={{ padding: '1.25rem' }}>
                  <MessageComposer tools={agentTools} />
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
                <MessageHistory />
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
            <span className="pkd-text-primary">[ SYSTEM STATUS ]</span> Left: Tool Sandbox (direct invocation, result inline only). Right: Agent chat (LLM-driven, agentic loop visible). Tools: <strong>benefits_lookup</strong>
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
