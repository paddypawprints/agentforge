import { useState } from 'react';
import { setSystemPrompt, getSystemPrompt, HR_CHATBOT_PROMPT, HR_AGENT_PROMPT } from '../services/orchestrator';
import BENEFITS_DOC from '../data/Employee Benefits 2026.md?raw';

const HR_BENEFITS_PROMPT =
`You are an HR assistant. The employee benefits policy document for 2026 is included below for reference.
Answer questions based solely on this document. If a question cannot be answered from the document, say so clearly.
Do not answer questions unrelated to HR or the benefits policy.

--- BENEFITS POLICY ---
${BENEFITS_DOC}
--- END OF POLICY ---`;

const PRESETS = [
  {
    id: 'chatbot',
    label: 'HR CHATBOT',
    description: 'No tools — HR Q&A only',
    prompt: HR_CHATBOT_PROMPT,
    color: 'var(--pkd-secondary)',
  },
  {
    id: 'agent',
    label: 'HR AGENT',
    description: 'With tools',
    prompt: HR_AGENT_PROMPT,
    color: 'var(--pkd-primary)',
  },
  {
    id: 'benefits',
    label: 'BENEFITS DOC',
    description: '2026 policy inline',
    prompt: HR_BENEFITS_PROMPT,
    color: '#ffe600',
  },
];

interface SystemPromptEditorProps {
  variant?: 'default' | 'pkd';
}

export function SystemPromptEditor({ variant = 'default' }: SystemPromptEditorProps) {
  const [prompt, setPromptState] = useState(() => getSystemPrompt());
  const [saved, setSaved] = useState(true);
  const [open, setOpen] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>('chatbot');

  function handleChange(value: string) {
    setPromptState(value);
    setSaved(false);
    setActivePreset(null);
  }

  function handleApply() {
    setSystemPrompt(prompt);
    setSaved(true);
  }

  function handleLoadPreset(preset: typeof PRESETS[0]) {
    setPromptState(preset.prompt);
    setSystemPrompt(preset.prompt);
    setSaved(true);
    setActivePreset(preset.id);
  }

  function handleReset() {
    setPromptState(HR_CHATBOT_PROMPT);
    setSystemPrompt(HR_CHATBOT_PROMPT);
    setSaved(true);
    setActivePreset('chatbot');
  }

  if (variant === 'pkd') {
    return (
      <div className="mb-8">
        {/* Collapse toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="pkd-button pkd-button-secondary text-xs flex items-center gap-2 w-full"
        >
          <span className={`inline-block w-2 h-2 rounded-full ${open ? 'bg-current' : 'border border-current'}`} />
          SYSTEM PROMPT {open ? '▲ COLLAPSE' : '▼ EXPAND'}
          {!saved && <span className="pkd-badge ml-auto" style={{ color: 'var(--pkd-warning, #fde047)' }}>UNSAVED</span>}
        </button>

        {open && (
          <div className="pkd-card mt-2">

            {/* Preset buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.85rem' }}>
              {PRESETS.map((preset) => {
                const isActive = activePreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleLoadPreset(preset)}
                    className="pkd-button text-xs"
                    style={{
                      flex: 1,
                      borderColor: isActive ? preset.color : 'var(--pkd-border-color)',
                      color: isActive ? preset.color : 'var(--pkd-foreground-muted)',
                      background: isActive ? `color-mix(in srgb, ${preset.color} 10%, transparent)` : 'transparent',
                      fontWeight: isActive ? '600' : '400',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isActive ? '● ' : '○ '}{preset.label}
                    <span style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7, marginTop: '0.1rem' }}>
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <textarea
              value={prompt}
              onChange={(e) => handleChange(e.target.value)}
              rows={6}
              className="pkd-input pkd-text-mono resize-y"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                backgroundColor: 'var(--pkd-background-secondary)',
                borderColor: saved ? 'var(--pkd-border-color)' : 'var(--pkd-primary)',
                color: '#dce8d4',
                fontFamily: 'var(--pkd-font-mono)',
                fontSize: '0.875rem',
              }}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleApply}
                disabled={saved}
                className="pkd-button pkd-button-primary text-xs px-3 py-1 disabled:opacity-50"
              >
                {saved ? '✓ APPLIED' : 'APPLY'}
              </button>
              <button
                onClick={handleReset}
                className="pkd-button pkd-button-secondary text-xs px-3 py-1"
              >
                RESET
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg border border-border bg-card p-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-lg font-semibold text-foreground">System Prompt</h2>
        <span className="flex items-center gap-3 text-sm text-muted-foreground">
          {!saved && <span className="text-yellow-500 font-medium">Unsaved changes</span>}
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <div className="mt-4">
          <textarea
            value={prompt}
            onChange={(e) => handleChange(e.target.value)}
            rows={6}
            className="w-full rounded border border-border bg-background px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
            style={{ borderColor: saved ? undefined : 'hsl(48 96% 53%)' }}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleApply}
              disabled={saved}
              className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50"
            >
              {saved ? '✓ Applied' : 'Apply'}
            </button>
            <button
              onClick={handleReset}
              className="rounded border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Reset to Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
