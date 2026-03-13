'use client';

import { useEffect, useState } from 'react';
import { Exchange } from './types/agent';
import { MessageHistory } from './components/MessageHistory';
import { ToolDispatcher } from './components/ToolDispatcher';
import { MessageComposer } from './components/MessageComposer';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { RotateCcw } from 'lucide-react';
import { setPortkeyApiKey, isPortkeyActive, setTemperature } from './services/orchestrator';
import { clearMemory } from './services/memory';
import { ApiKeyInput } from './components/ApiKeyInput';
import { SystemPromptEditor } from './components/SystemPromptEditor';
import { benefitsLookupTool } from './services/tools';
import predevBadge from '../public/predev.jpg';

const agentTools = [benefitsLookupTool];

export default function App() {
  const [portkeyEnabled, setPortkeyEnabled] = useState(false);
  const [portkeyKey, setPortkeyKey] = useState('');
  const [temperature, setTemperatureState] = useState(1.0);
  const [agentMode, setAgentMode] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>('chatbot');
  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [turnCount, setTurnCount] = useState(0);

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
              <ApiKeyInput variant="pkd" />
              <button
                onClick={() => { setExchange(null); setTurnCount(0); clearMemory(); }}
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
            <div>
              <div className="pkd-heading pkd-heading-3 pkd-text-primary mb-4 flex items-center gap-2">
                <span className="inline-block w-3 h-3 bg-current animate-pulse"></span>
                WORKSHOP EXERCISE
              </div>
            <div className="pkd-card">
              {/* Prerequisite */}
              <div style={{ marginBottom: '1rem', padding: '0.6rem 0.75rem', background: 'rgba(192,57,43,0.07)', border: '1px solid var(--pkd-accent-border, #c0392b55)', borderRadius: '2px' }}>
                <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: 0 }}>
                  <span style={{ color: 'var(--pkd-accent, #c0392b)', fontWeight: 700 }}>PREREQUISITE —</span> Get a free API key at <em>console.groq.com</em> and enter it in the API KEY box in the header above.
                </p>
              </div>

              {/* Key takeaways */}
              <div style={{ marginBottom: '1.25rem', padding: '0.6rem 0.75rem', background: 'var(--pkd-primary-bg)', border: '1px solid var(--pkd-primary-border)', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-primary)', fontWeight: 700, letterSpacing: '0.08em' }}>KEY TAKEAWAYS</span>
                <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: 0 }}>
                  <span style={{ color: 'var(--pkd-foreground)', fontWeight: 600 }}>Model —</span> receives text, outputs text. That's it.
                </p>
                <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: 0 }}>
                  <span style={{ color: 'var(--pkd-foreground)', fontWeight: 600 }}>Chatbot —</span> software that saves past interactions and feeds them back to the model each turn.
                </p>
                <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: 0 }}>
                  <span style={{ color: 'var(--pkd-foreground)', fontWeight: 600 }}>Agent —</span> a chatbot that is told it has access to tools, with software that can actually call them.
                </p>
                <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: 0 }}>
                  <span style={{ color: 'var(--pkd-foreground)', fontWeight: 600 }}>Tool —</span> a piece of software that performs a function (read a file, make a payment). The result is fed back to the model so it can act on it.
                </p>
              </div>

              {/* Architecture diagram */}
              <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--pkd-primary-border)', borderRadius: '2px' }}>
                <ArchitectureDiagram />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

                <div style={{ borderLeft: '2px solid var(--pkd-primary)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: '0 0 0.15rem 0' }}>
                    <span style={{ color: 'var(--pkd-primary)', fontWeight: 700 }}>1. RAW MODEL —</span> Agent mode <strong>OFF</strong>. Send <em>"My name is [your name]."</em> Then send <em>"What is my name?"</em> The model has no memory — each request is stateless. You are talking directly to the LLM.
                  </p>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-primary)', margin: 0, opacity: 0.75 }}>↳ The model is not magic — it only knows what you put in the prompt.</p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-primary)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: '0 0 0.15rem 0' }}>
                    <span style={{ color: 'var(--pkd-primary)', fontWeight: 700 }}>2. MEMORY —</span> Agent mode <strong>ON</strong>, select <em>CHAT BOT</em>. Repeat the same two messages. It now remembers — the Orchestrator injects previous turns into every prompt automatically. Hit CLEAR to reset memory and try again.
                  </p>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-primary)', margin: 0, opacity: 0.75 }}>↳ "Memory" is just your app re-sending the conversation history every time.</p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-primary)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: '0 0 0.15rem 0' }}>
                    <span style={{ color: 'var(--pkd-primary)', fontWeight: 700 }}>3. SYSTEM PROMPT —</span> Select <em>HR CHATBOT</em>. The system prompt restricts the model to HR topics. Try <em>"What is the PTO policy?"</em> (on-topic), then <em>"Write me a poem."</em> (off-topic). Edit the prompt live and observe how behaviour shifts.
                  </p>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-primary)', margin: 0, opacity: 0.75 }}>↳ The system prompt is your product — it's how you turn a general model into a specific assistant.</p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-primary)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: '0 0 0.15rem 0' }}>
                    <span style={{ color: 'var(--pkd-primary)', fontWeight: 700 }}>4. GROUNDING —</span> Select <em>BENEFITS DOC</em>. The full HR policy document is injected into the system prompt. Ask <em>"What is the parental leave policy?"</em> — the model answers from the text. Ask something not in the doc and notice the difference.
                  </p>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-primary)', margin: 0, opacity: 0.75 }}>↳ LLMs don't need to be fine-tuned on your data — just put it in the prompt.</p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-warning)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: '0 0 0.15rem 0' }}>
                    <span style={{ color: 'var(--pkd-warning)', fontWeight: 700 }}>5. TOOL SANDBOX —</span> Use the Tool Sandbox below. Enter <em>EMP001</em> and click LOOKUP BENEFITS. Examine the raw JSON returned — this is live employee data the LLM has no access to on its own.
                  </p>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-warning)', margin: 0, opacity: 0.85 }}>↳ A tool is just a function that returns data — nothing AI-specific about it.</p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-warning)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: '0 0 0.15rem 0' }}>
                    <span style={{ color: 'var(--pkd-warning)', fontWeight: 700 }}>6. MANUAL GROUNDING —</span> Switch to <em>HR CHATBOT</em> (no tools). Ask <em>"What are EMP001's benefits?"</em> — the model can't answer accurately. Now paste the JSON from step 5 into the chat and ask again. It answers perfectly.
                  </p>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-warning)', margin: 0, opacity: 0.85 }}>↳ You just played the role of the agent — the orchestrator automates exactly this.</p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-warning)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: '0 0 0.15rem 0' }}>
                    <span style={{ color: 'var(--pkd-warning)', fontWeight: 700 }}>7. AGENT + TOOLS —</span> Select <em>HR AGENT</em>. Ask <em>"What are the benefits for EMP001?"</em> Watch the trace panel: the Orchestrator detects a tool call, fetches live data, injects the result, then re-submits to the LLM for a final answer. Try EMP002–EMP004.
                  </p>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-warning)', margin: 0, opacity: 0.85 }}>↳ An agent is just a loop: LLM decides → tool runs → result fed back → LLM answers.</p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-secondary-border)', paddingLeft: '0.75rem', marginTop: '0.25rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-secondary)', margin: '0 0 0.4rem 0', letterSpacing: '0.08em' }}>BONUS: OBSERVABILITY WITH PORTKEY</p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-secondary)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: '0 0 0.15rem 0' }}>
                    <span style={{ color: 'var(--pkd-secondary)', fontWeight: 700 }}>8. SETUP PORTKEY —</span> Go to <em>app.portkey.ai</em>, sign in, and create a Virtual Key. Select <strong>Groq</strong> as the provider, enter <strong>aidaysf</strong> as the slug, and paste your Groq API key. Copy the Portkey API key shown at the top.
                  </p>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-secondary)', margin: 0, opacity: 0.75 }}>↳ Portkey sits between your app and the LLM provider — you only change the URL.</p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-secondary)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: '0 0 0.15rem 0' }}>
                    <span style={{ color: 'var(--pkd-secondary)', fontWeight: 700 }}>9. ENABLE IN UI —</span> Check the <strong>PORTKEY</strong> box in the header and paste your Portkey API key into the field that appears. All LLM traffic now routes through Portkey.
                  </p>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-secondary)', margin: 0, opacity: 0.75 }}>↳ Zero code changes needed — observability is a deployment decision, not a code one.</p>
                </div>

                <div style={{ borderLeft: '2px solid var(--pkd-secondary)', paddingLeft: '0.75rem' }}>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-sm)', color: 'var(--pkd-foreground-muted)', margin: '0 0 0.15rem 0' }}>
                    <span style={{ color: 'var(--pkd-secondary)', fontWeight: 700 }}>10. OBSERVE —</span> Run the HR Agent again (step 7). Switch to the Portkey dashboard and inspect the request log — see the full prompt, token counts, latency, and the tool result injected between the two LLM calls.
                  </p>
                  <p className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-secondary)', margin: 0, opacity: 0.75 }}>↳ You can't debug what you can't see — logs are non-negotiable in production agents.</p>
                </div>

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
                    agentMode={agentMode}
                    isLoading={isLoading}
                    onLoadingChange={setIsLoading}
                    onExchange={(e) => { setExchange(e); setTurnCount(c => c + 1); }}
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
              <div className="pkd-card" style={{ height: '42rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <MessageHistory exchange={exchange} turnCount={turnCount} />
              </div>
              <div className="pkd-text-mono mt-3 text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                <span className="pkd-badge">TURNS: {turnCount}</span>
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
