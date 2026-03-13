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
    id: 'bare',
    label: 'CHAT BOT',
    description: 'No system prompt',
    prompt: '',
    color: 'var(--pkd-foreground-muted)',
  },
  {
    id: 'chatbot',
    label: 'HR CHATBOT',
    description: 'No tools — HR Q&A only',
    prompt: HR_CHATBOT_PROMPT,
    color: 'var(--pkd-secondary)',
  },
  {
    id: 'benefits',
    label: 'BENEFITS DOC',
    description: '2026 policy inline',
    prompt: HR_BENEFITS_PROMPT,
    color: 'var(--pkd-warning)',
  },
  {
    id: 'agent',
    label: 'HR AGENT',
    description: 'With tools',
    prompt: HR_AGENT_PROMPT,
    color: 'var(--pkd-primary)',
  },
];

interface SystemPromptEditorProps {
  variant?: 'default' | 'pkd';
  onPresetChange?: (presetId: string | null) => void;
}

export function SystemPromptEditor({ variant = 'default', onPresetChange }: SystemPromptEditorProps) {
  const [prompt, setPromptState] = useState(() => getSystemPrompt());
  const [saved, setSaved] = useState(true);
  const [activePreset, setActivePreset] = useState<string | null>('chatbot');
  // collapse state for the non-pkd (default) variant only
  const [open, setOpen] = useState(true);

  function handleChange(value: string) {
    setPromptState(value);
    setSaved(false);
    setActivePreset(null);
    onPresetChange?.(null);
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
    onPresetChange?.(preset.id);
  }

  function handleReset() {
    setPromptState(HR_CHATBOT_PROMPT);
    setSystemPrompt(HR_CHATBOT_PROMPT);
    setSaved(true);
    setActivePreset('chatbot');
    onPresetChange?.('chatbot');
  }

  if (variant === 'pkd') {
    return (
      <div className="pkd-card">
        {!saved && (
          <span className="pkd-badge" style={{ color: 'var(--pkd-warning)', float: 'right', fontSize: 'var(--pkd-text-xs)' }}>
            UNSAVED
          </span>
        )}

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
                    <span style={{ display: 'block', fontSize: 'var(--pkd-text-xs)', opacity: 0.7, marginTop: '0.1rem' }}>
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
                color: 'var(--pkd-foreground-muted)',
                fontFamily: 'var(--pkd-font-mono)',
                fontSize: 'var(--pkd-text-sm)',
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
