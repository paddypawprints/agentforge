import { useState, useEffect } from 'react';
import { setGroqApiKey, setGroqModel, fetchGroqModels } from '../services/orchestrator';

interface ApiKeyInputProps {
  variant?: 'default' | 'pkd';
}

const KEY_STORAGE = 'groq_api_key';
const MODEL_STORAGE = 'groq_model';

const FALLBACK_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'llama3-70b-8192',
  'llama3-8b-8192',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];

export function ApiKeyInput({ variant = 'default' }: ApiKeyInputProps) {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [models, setModels] = useState<string[]>(FALLBACK_MODELS);
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem(MODEL_STORAGE) || FALLBACK_MODELS[0]
  );

  // Load persisted key on mount and apply stored model
  useEffect(() => {
    const storedModel = localStorage.getItem(MODEL_STORAGE) || FALLBACK_MODELS[0];
    setGroqModel(storedModel);

    const storedKey = localStorage.getItem(KEY_STORAGE);
    if (storedKey) {
      setKey(storedKey);
      setGroqApiKey(storedKey);
      setSaved(true);
      // Fetch live model list in background
      fetchGroqModels().then((live) => { if (live.length) setModels(live); });
    }
  }, []);

  async function handleSave() {
    const trimmed = key.trim();
    if (!trimmed) return;
    localStorage.setItem(KEY_STORAGE, trimmed);
    setGroqApiKey(trimmed);
    setSaved(true);
    // Fetch live models after key is set
    const live = await fetchGroqModels();
    if (live.length) setModels(live);
  }

  function handleKeyChange(value: string) {
    setKey(value);
    setSaved(false);
  }

  function handleModelChange(model: string) {
    setSelectedModel(model);
    localStorage.setItem(MODEL_STORAGE, model);
    setGroqModel(model);
  }

  if (variant === 'pkd') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <label className="flex items-center gap-1.5">
          <span className="pkd-text-mono" style={{ fontSize: 'var(--pkd-text-xs)', color: 'var(--pkd-foreground-muted)', whiteSpace: 'nowrap' }}>GROQ KEY</span>
          <input
            type="password"
            value={key}
            onChange={(e) => { handleKeyChange(e.target.value); }}
            onBlur={() => { if (key.trim()) handleSave(); }}
            placeholder="gsk_..."
            className="pkd-input text-xs w-44"
            style={{
              backgroundColor: 'var(--pkd-background-secondary)',
              borderColor: saved ? 'var(--pkd-primary)' : 'var(--pkd-border-color)',
              color: 'var(--pkd-foreground)',
            }}
          />
        </label>
        <select
          value={selectedModel}
          onChange={(e) => handleModelChange(e.target.value)}
          className="pkd-input text-xs"
          style={{
            backgroundColor: 'var(--pkd-background-secondary)',
            borderColor: 'var(--pkd-border-color)',
            color: 'var(--pkd-foreground)',
          }}
        >
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="password"
        value={key}
        onChange={(e) => handleKeyChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        placeholder="Groq API Key"
        className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground w-44 focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ borderColor: saved ? 'hsl(142 71.8% 29.2%)' : undefined }}
      />
      <button
        onClick={handleSave}
        disabled={!key.trim() || saved}
        className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50"
      >
        {saved ? '✓ Saved' : 'Set Key'}
      </button>
      <select
        value={selectedModel}
        onChange={(e) => handleModelChange(e.target.value)}
        className="rounded border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        {models.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}
