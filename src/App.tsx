'use client';

import { useEffect, useRef, useState } from 'react';
import { Exchange } from './types/agent';
import { HopInspector, HopList, buildHops, mcpHops, sessionExtract } from './components/MessageHistory';
import { ToolDispatcher } from './components/ToolDispatcher';
import { MessageComposer } from './components/MessageComposer';
import { ConceptCard } from './components/ConceptCard';
import { Copy, PanelLeftClose, PanelLeftOpen, RotateCcw } from 'lucide-react';
import { RunControls, setTemperature, setModelChoice, setReasoningEffort, setMcpCatalog, setMcpHelper, ModelProvider, ReasoningEffort } from './services/orchestrator';
import { McpEndpoint, McpQuery, discoverMcp, retireMcp } from './services/mcp';
import { llmConfig } from './config';
import { clearMemory } from './services/memory';
import { MemoryStore } from './components/MemoryStore';
import { ChatbotPromptEditor } from './components/ChatbotPromptEditor';
import { TemplateGuide } from './components/TemplateGuide';
import { PlannerPromptEditor } from './components/PlannerPromptEditor';
import { WorkerPromptEditor } from './components/WorkerPromptEditor';
import { SummarizerPromptEditor } from './components/SummarizerPromptEditor';
import { EmbeddedToolDescription } from './components/EmbeddedToolDescription';
import { GroundingEditor } from './components/GroundingEditor';
import { McpServers } from './components/McpServers';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { DataTables } from './components/DataTables';
import { SystemPromptEditor } from './components/SystemPromptEditor';
import { benefitsLookupTool } from './services/tools';
const agentTools = [benefitsLookupTool];

type PromptMode = 'none' | 'chatbot' | 'agentloop';

const PROMPT_MODES: { id: PromptMode; label: string }[] = [
  { id: 'none', label: 'NONE' },
  { id: 'chatbot', label: 'CHATBOT' },
  { id: 'agentloop', label: 'AGENT LOOP' },
];

function PromptModePicker({ mode, onChange }: { mode: PromptMode; onChange: (mode: PromptMode) => void }) {
  return (
    <div role="radiogroup" aria-label="Prompt mode" style={{ display: 'flex', gap: '0.4rem' }}>
      {PROMPT_MODES.map((option) => {
        const selected = mode === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className="pkd-text-mono"
            style={{
              flex: 1,
              padding: '0.45rem 0.4rem',
              borderRadius: '6px',
              border: `1px solid ${selected ? 'var(--pkd-primary)' : 'var(--pkd-border-color)'}`,
              background: selected ? 'var(--pkd-primary-bg)' : 'transparent',
              color: selected ? 'var(--pkd-primary)' : 'var(--pkd-foreground-muted)',
              fontSize: 'var(--pkd-text-xs)',
              fontWeight: selected ? 700 : 500,
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default function App() {
  const [temperature, setTemperatureState] = useState(1.0);
  const [reasoningEffort, setReasoningEffortState] = useState<ReasoningEffort>('none');
  const [provider, setProvider] = useState<ModelProvider>('ollama');
  const [ollamaModel, setOllamaModel] = useState(llmConfig.model);
  const [ollamaBase, setOllamaBase] = useState(`${llmConfig.host}/v1`);
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
  const [openaiBase, setOpenaiBase] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [memoryOn, setMemoryOn] = useState(true);
  const [mode, setMode] = useState<PromptMode>('agentloop');
  const [groundingOn, setGroundingOn] = useState(false);
  const [toolsOn, setToolsOn] = useState(false);
  const [mcpOn, setMcpOn] = useState(false);
  const [mcpServers, setMcpServers] = useState<McpEndpoint[]>([
    { id: 'salary', name: 'salary', url: '/mcp/salary', token: '', helper: '' },
    { id: 'retirement', name: 'retirement', url: '/mcp/retirement', token: '', helper: '' },
  ]);
  const [mcpIncluded, setMcpIncluded] = useState<Record<string, boolean>>({ salary: true, retirement: true });
  const [mcpQueries, setMcpQueries] = useState<McpQuery[]>([]);
  const [mcpTools, setMcpTools] = useState<typeof agentTools>([]);
  const [mcpStamp, setMcpStamp] = useState(0);
  const [sessionTick, setSessionTick] = useState(0);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [selectedHopId, setSelectedHopId] = useState<string | null>(null);
  const [followHopId, setFollowHopId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conceptsOpen, setConceptsOpen] = useState(true);
  const [maxTasks, setMaxTasks] = useState(8);
  const [maxToolRounds, setMaxToolRounds] = useState(5);
  const [maxRetries, setMaxRetries] = useState(1);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    setModelChoice({ provider, ollamaModel, ollamaBase, openaiModel, baseUrl: openaiBase, apiKey });
  }, [provider, ollamaModel, ollamaBase, openaiModel, openaiBase, apiKey]);

  const mcpKey = mcpServers
    .filter((server) => mcpIncluded[server.id])
    .map((server) => `${server.id}\n${server.name}\n${server.url}\n${server.token}`)
    .join("\n---\n");

  useEffect(() => {
    if (!mcpOn) {
      setMcpQueries([]);
      setMcpTools([]);
      setMcpCatalog("");
      return;
    }
    const chosen = mcpServers.filter((server) => mcpIncluded[server.id]);
    if (!chosen.length) {
      setMcpQueries([]);
      setMcpTools([]);
      setMcpCatalog("");
      return;
    }
    let cancel = false;
    discoverMcp(chosen).then((found) => {
      if (cancel) return;
      setMcpQueries(found.queries);
      setMcpTools(found.tools);
      setMcpCatalog(found.catalog);
      setMcpStamp(sessionTick);
      const discovered = mcpHops(found.queries, sessionTick);
      const last = discovered[discovered.length - 1];
      if (last) {
        setSelectedHopId(last.id);
        setFollowHopId(last.id);
      }
    });
    return () => {
      cancel = true;
      retireMcp();
    };
  }, [mcpOn, mcpKey, sessionTick]);

  useEffect(() => {
    if (!mcpOn) {
      setMcpHelper("");
      return;
    }
    const notes: Record<string, string> = {};
    for (const server of mcpServers) {
      if (!mcpIncluded[server.id]) continue;
      const helper = server.helper.trim();
      if (!helper) continue;
      const key = server.name.trim() || server.id;
      notes[key] = helper;
    }
    setMcpHelper(Object.keys(notes).length ? JSON.stringify(notes, null, 2) : "");
  }, [mcpOn, mcpServers, mcpIncluded]);

  const agentLoop = mode === 'agentloop';
  const controls: RunControls = {
    memory: memoryOn,
    chatbot: mode === 'chatbot',
    systemPrompt: agentLoop,
    loop: agentLoop,
    embeddedTool: toolsOn,
    mcp: mcpOn,
    grounding: groundingOn,
    maxTasks,
    maxToolRounds,
    maxRetries,
  };
  const liveTools = [
    ...(toolsOn && agentLoop ? agentTools : []),
    ...(mcpOn && agentLoop ? mcpTools : []),
  ];
  const sessionHops = mcpHops(mcpQueries, mcpStamp);
  const hops = [...sessionHops, ...buildHops(exchanges)];
  const selectedHop = hops.find((hop) => hop.id === selectedHopId) ?? null;

  function handleExchange(exchange: Exchange) {
    const next = [...exchanges, exchange];
    const nextHops = buildHops(next);
    const last = nextHops[nextHops.length - 1];
    setExchanges(next);
    setSelectedHopId(last?.id ?? null);
    setFollowHopId(last?.id ?? null);
  }

  function exportSession() {
    const text = sessionExtract(hops, exchanges.length);
    if (copyTimer.current != null) window.clearTimeout(copyTimer.current);
    navigator.clipboard.writeText(text).then(() => {
      setCopyState('copied');
      copyTimer.current = window.setTimeout(() => setCopyState('idle'), 1600);
    }, () => {
      setCopyState('failed');
      copyTimer.current = window.setTimeout(() => setCopyState('idle'), 1600);
    });
  }

  return (
    <div className="pkd-scan-lines min-h-screen" style={{ backgroundColor: 'var(--pkd-background)' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--pkd-border-color)' }}>
        <div style={{ width: '100%', minHeight: '80px', padding: '14px 1.5rem', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <a href="https://rx-m.com/" style={{ display: 'block', flex: '0 0 auto', lineHeight: 0 }}>
            <img
              src={`${import.meta.env.BASE_URL}rx-m-cnaitc-lockup.webp`}
              alt="RX-M, cloud native and AI training and consulting"
              style={{ height: '52px', width: 'auto', display: 'block' }}
            />
          </a>
          <div className="min-w-0" style={{ textAlign: 'right' }}>
            <h1 className="pkd-heading pkd-heading-2 pkd-text-primary truncate">
              AI AGENTS
            </h1>
            <p className="pkd-text-mono mt-1 text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
              Concepts
            </p>
          </div>
        </div>
      </header>

      <main style={{ width: '100%', padding: '2rem 1.5rem', boxSizing: 'border-box' }}>
        <div style={{ display: 'grid', gridTemplateColumns: conceptsOpen ? '1fr 1fr' : '2.75rem 1fr', gap: '1.5rem', alignItems: 'start' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
            {conceptsOpen ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setConceptsOpen(false)}
                  className="pkd-button pkd-button-secondary text-xs"
                  aria-expanded={true}
                  title="Hide concepts"
                >
                  <PanelLeftClose className="inline h-3 w-3 mr-1" />
                  HIDE
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConceptsOpen(true)}
                className="pkd-button pkd-button-secondary text-xs"
                aria-expanded={false}
                title="Show concepts"
                style={{ writingMode: 'vertical-rl', height: '8rem', letterSpacing: '0.08em' }}
              >
                <PanelLeftOpen className="inline h-3 w-3" style={{ marginBottom: '0.4rem' }} />
                CONCEPTS
              </button>
            )}
            {conceptsOpen && <>
            <ConceptCard
              title="ARCHITECTURE"
              definition="The user sends a message and reads the answer. Memory sends the stored turns and keeps this one. Grounding is the document the harness inserts. The harness calls the model, an embedded tool in the page, and MCP in the page."
            >
              <ArchitectureDiagram />
            </ConceptCard>
            <ConceptCard
              title="DATA"
              definition="These are the records the tools read. The field names are the names in the tool result."
            >
              <DataTables />
            </ConceptCard>
            <ConceptCard
              title="MODEL"
              definition="A model receives text and returns text. It does not remember the last call. Ollama and OpenAI both take a base URL. Ollama also takes a reasoning effort. None turns thinking off. OpenAI adds an optional API key."
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div role="radiogroup" aria-label="Model provider" style={{ display: 'flex', gap: '0.4rem' }}>
                  {(['ollama', 'openai'] as const).map((option) => {
                    const selected = provider === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setProvider(option)}
                        className="pkd-text-mono"
                        style={{
                          flex: 1,
                          padding: '0.45rem 0.4rem',
                          borderRadius: '6px',
                          border: `1px solid ${selected ? 'var(--pkd-primary)' : 'var(--pkd-border-color)'}`,
                          background: selected ? 'var(--pkd-primary-bg)' : 'transparent',
                          color: selected ? 'var(--pkd-primary)' : 'var(--pkd-foreground-muted)',
                          fontSize: 'var(--pkd-text-xs)',
                          fontWeight: selected ? 700 : 500,
                          letterSpacing: '0.06em',
                          cursor: 'pointer',
                        }}
                      >
                        {option === 'ollama' ? 'OLLAMA' : 'OPENAI'}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
                  <label className="flex items-center gap-1.5 pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                    MODEL
                    <input
                      type="text"
                      value={provider === 'ollama' ? ollamaModel : openaiModel}
                      onChange={(event) => {
                        if (provider === 'ollama') setOllamaModel(event.target.value);
                        else setOpenaiModel(event.target.value);
                      }}
                      className="pkd-input"
                      aria-label="Model"
                      spellCheck={false}
                      style={{ width: '12rem', padding: '0.2rem 0.4rem' }}
                    />
                  </label>
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
                  {provider === 'ollama' && (
                    <div role="radiogroup" aria-label="Reasoning effort" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)', letterSpacing: '0.06em' }}>REASONING</span>
                      {(['none', 'low', 'medium', 'high'] as const).map((level) => {
                        const selected = reasoningEffort === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => { setReasoningEffortState(level); setReasoningEffort(level); }}
                            className="pkd-text-mono"
                            style={{
                              padding: '0.2rem 0.45rem',
                              borderRadius: '6px',
                              border: `1px solid ${selected ? 'var(--pkd-primary)' : 'var(--pkd-border-color)'}`,
                              background: selected ? 'var(--pkd-primary-bg)' : 'transparent',
                              color: selected ? 'var(--pkd-primary)' : 'var(--pkd-foreground-muted)',
                              fontSize: 'var(--pkd-text-xs)',
                              fontWeight: selected ? 700 : 500,
                              letterSpacing: '0.06em',
                              cursor: 'pointer',
                            }}
                          >
                            {level.toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                  <label className="flex items-center gap-1.5 pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                    BASE URL
                    <input
                      type="text"
                      value={provider === 'ollama' ? ollamaBase : openaiBase}
                      onChange={(event) => {
                        if (provider === 'ollama') setOllamaBase(event.target.value);
                        else setOpenaiBase(event.target.value);
                      }}
                      className="pkd-input"
                      aria-label="Base URL"
                      spellCheck={false}
                      style={{ flex: 1, minWidth: '16rem', padding: '0.2rem 0.4rem' }}
                    />
                  </label>
                  {provider === 'openai' && (
                    <label className="flex items-center gap-1.5 pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                      API KEY
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(event) => setApiKey(event.target.value)}
                        className="pkd-input"
                        aria-label="API key"
                        autoComplete="off"
                        spellCheck={false}
                        placeholder="optional"
                        style={{ flex: 1, minWidth: '16rem', padding: '0.2rem 0.4rem' }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </ConceptCard>

            <ConceptCard
              title="MODE"
              definition="The harness adds one prompt. None sends the message as typed. Chatbot adds the chatbot prompt. AgentLoop sends the agent prompt. A chat reply is the answer. A workflow runs the planner, then the worker on each task, then the summarizer."
            >
              <PromptModePicker mode={mode} onChange={setMode} />
              {mode === 'none' && (
                <p className="pkd-text-mono" style={{ margin: '0.75rem 0 0', fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-foreground-muted)' }}>
                  No prompt is added.
                </p>
              )}
              {mode === 'chatbot' && (
                <div style={{ marginTop: '0.9rem' }}>
                  <p className="pkd-text-mono" style={{ margin: '0 0 0.75rem', fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-foreground-muted)' }}>
                    SYSTEM, USER, ASSISTANT, MEMORY, and TOOL insert a JSON role, with a blank line around it. {'{{memory}}'} is the stored turns as JSON. {'{{tool}}'} is the tool prompt as JSON.
                  </p>
                  <ChatbotPromptEditor />
                </div>
              )}
              {mode === 'agentloop' && (
                <div style={{ marginTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <p className="pkd-text-mono" style={{ margin: 0, fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-foreground-muted)' }}>
                    SYSTEM, USER, ASSISTANT, MEMORY, and TOOL insert a JSON role, with a blank line around it. The agent chooses chat or a workflow. A workflow asks the planner for tasks, the worker carries out each task, and the summarizer writes the reply. The summarizer can send the planner, worker, and summarizer around again when the tasks did not achieve the request.
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                    {([
                      ['TASKS', maxTasks, setMaxTasks],
                      ['TOOL ROUNDS', maxToolRounds, setMaxToolRounds],
                      ['RETRIES', maxRetries, setMaxRetries],
                    ] as const).map(([label, value, setValue]) => (
                      <label key={label} className="pkd-text-mono" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-foreground-muted)' }}>
                        {label}
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={value}
                          onChange={(event) => {
                            const next = Number.parseInt(event.target.value, 10);
                            if (!Number.isNaN(next)) setValue(Math.max(0, next));
                          }}
                          className="pkd-input"
                          style={{ width: '4.5rem', padding: '0.2rem 0.4rem' }}
                          aria-label={label}
                        />
                      </label>
                    ))}
                    <span className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-foreground-muted)' }}>
                      0 does not stop.
                    </span>
                  </div>
                  <div>
                    <p className="pkd-text-mono" style={{ margin: '0 0 0.45rem', fontSize: 'var(--pkd-text-xs)', letterSpacing: '0.06em', color: 'var(--pkd-primary)', fontWeight: 700 }}>
                      AGENT
                    </p>
                    <SystemPromptEditor variant="pkd" showPresets={false} bare />
                  </div>
                  <div>
                    <p className="pkd-text-mono" style={{ margin: '0 0 0.45rem', fontSize: 'var(--pkd-text-xs)', letterSpacing: '0.06em', color: 'var(--pkd-primary)', fontWeight: 700 }}>
                      PLANNER
                    </p>
                    <PlannerPromptEditor />
                  </div>
                  <div>
                    <p className="pkd-text-mono" style={{ margin: '0 0 0.45rem', fontSize: 'var(--pkd-text-xs)', letterSpacing: '0.06em', color: 'var(--pkd-primary)', fontWeight: 700 }}>
                      WORKER
                    </p>
                    <WorkerPromptEditor />
                  </div>
                  <div>
                    <p className="pkd-text-mono" style={{ margin: '0 0 0.45rem', fontSize: 'var(--pkd-text-xs)', letterSpacing: '0.06em', color: 'var(--pkd-primary)', fontWeight: 700 }}>
                      SUMMARIZER
                    </p>
                    <SummarizerPromptEditor />
                  </div>
                </div>
              )}
            </ConceptCard>

            <ConceptCard
              title="MEMORY"
              definition="Memory is a store the app keeps. The model does not remember the last call. Finished turns are written here as JSON and sent back on the next call."
              enabled={memoryOn}
              onToggle={setMemoryOn}
              keepBody
            >
              <MemoryStore enabled={memoryOn} />
            </ConceptCard>

            <ConceptCard
              title="GROUNDING"
              definition="Grounding is a document you give the model. {{grounding}} inserts this text while the switch is on. It starts as the 2026 benefits policy."
              enabled={groundingOn}
              onToggle={setGroundingOn}
              keepBody
            >
              <p className="pkd-text-mono" style={{ margin: '0 0 0.75rem', fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-foreground-muted)' }}>
                {groundingOn
                  ? '{{grounding}} inserts this text.'
                  : 'Off. This stays here and is not inserted.'}
              </p>
              <GroundingEditor />
            </ConceptCard>

            <ConceptCard
              title="EMBEDDED TOOL"
              definition="An embedded tool is a function written in this app. The model never calls it. This JSON prompt is included in the message. The model asks, and the result is sent back as text."
              enabled={toolsOn}
              onToggle={setToolsOn}
              keepBody
            >
              <EmbeddedToolDescription />
              <p className="pkd-text-mono" style={{ margin: '0 0 0.75rem', fontSize: 'var(--pkd-text-xs)', color: toolsOn && !agentLoop ? 'var(--pkd-warning)' : 'var(--pkd-foreground-muted)' }}>
                {toolsOn && agentLoop
                  ? 'This JSON is included in the message, and benefits_lookup is offered. The sandbox below runs it by hand and does not enter the chat.'
                  : toolsOn
                  ? 'This JSON is included in the message. Choose AgentLoop to let the model request this tool. The sandbox still runs it by hand.'
                  : 'Off for the model. This JSON is not sent. The sandbox below still runs the tool by hand and does not enter the chat.'}
              </p>
              <ToolDispatcher embedded />
            </ConceptCard>

            <ConceptCard
              title="MCP"
              definition="MCP is how an agent reaches tools on a server. Salary and retirement run in this page. A public server uses Streamable HTTP. Stdio needs a process, which the browser cannot start."
              enabled={mcpOn}
              onToggle={setMcpOn}
              keepBody
            >
              <McpServers
                enabled={mcpOn}
                servers={mcpServers}
                included={mcpIncluded}
                onIncluded={(id, value) => setMcpIncluded((current) => ({ ...current, [id]: value }))}
                onAdd={(server) => {
                  setMcpServers((current) => [...current, server]);
                  setMcpIncluded((current) => ({ ...current, [server.id]: true }));
                }}
                onRemove={(id) => {
                  setMcpServers((current) => current.filter((server) => server.id !== id));
                  setMcpIncluded((current) => {
                    const next = { ...current };
                    delete next[id];
                    return next;
                  });
                }}
                onHelper={(id, value) => {
                  setMcpServers((current) => current.map((server) => server.id === id ? { ...server, helper: value } : server));
                }}
              />
            </ConceptCard>

            <ConceptCard
              title="TEMPLATES"
              definition="A prompt can include the other parts of the system by name. The tag is replaced with that text when the message is built."
            >
              <TemplateGuide />
            </ConceptCard>
            </>}
          </div>

          <div style={{ position: 'sticky', top: '0.75rem', maxHeight: 'calc(100vh - 6rem)', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => {
                  setExchanges([]);
                  setSelectedHopId(null);
                  setFollowHopId(null);
                  setMcpQueries([]);
                  clearMemory();
                  setSessionTick((tick) => tick + 1);
                }}
                className="pkd-button pkd-button-secondary text-xs"
                title="Start a new session. The trace and memory are wiped. Concepts stay as they are."
              >
                <RotateCcw className="inline h-3 w-3 mr-1" />
                NEW SESSION
              </button>
            </div>
            <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ flexShrink: 0 }}>
              <div className="pkd-card">
                <div style={{ padding: '1.25rem' }}>
                  <MessageComposer
                    tools={liveTools}
                    controls={controls}
                    mcp={mcpOn}
                    isLoading={isLoading}
                    onLoadingChange={setIsLoading}
                    onExchange={handleExchange}
                  />
                </div>
              </div>
            </div>
            <div style={{ flexShrink: 0 }}>
              <HopInspector hop={selectedHop} />
            </div>

            <div style={{ flex: '1 1 auto', minHeight: '8rem', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexShrink: 0 }} className="mb-4">
                <div className="pkd-heading pkd-heading-3 pkd-text-primary flex items-center gap-2">
                  <span className="inline-block w-3 h-3 bg-current animate-pulse"></span>
                  SESSION
                </div>
                <button
                  type="button"
                  onClick={exportSession}
                  className="pkd-button pkd-button-secondary text-xs"
                  title="Copy the session trace as JSON."
                >
                  <Copy className="inline h-3 w-3 mr-1" />
                  {copyState === 'copied' ? 'COPIED' : copyState === 'failed' ? 'COPY FAILED' : 'EXPORT SESSION'}
                </button>
              </div>
              <div data-hop-scroll style={{ flex: '1 1 auto', minHeight: 0, overflow: 'auto' }}>
                <HopList
                  exchanges={exchanges}
                  leading={sessionHops}
                  selectedId={selectedHopId}
                  onSelect={setSelectedHopId}
                  followId={followHopId}
                />
                <div className="pkd-text-mono mt-3 text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
                  <span className="pkd-badge">TURNS: {exchanges.length}</span>
                </div>
              </div>
            </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 pkd-border-top" style={{ borderColor: 'var(--pkd-border-color)' }}>
          <p className="pkd-text-mono text-xs" style={{ color: 'var(--pkd-foreground-muted)' }}>
            RX-M
          </p>
        </div>
      </main>
    </div>
  );
}
