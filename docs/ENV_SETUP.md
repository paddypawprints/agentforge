# Environment Setup Guide

This guide explains how to configure environment variables for the AI Agents Workshop StackBlitz template across different deployment scenarios.

## Overview

LLM inference is a local Ollama daemon. The model tag is `model` in `src/config.ts`. The Vite dev server proxies `/ollama` to `http://127.0.0.1:11434`. No API key.

An analytics service for an instructor dashboard is optional and not wired into this app.

## StackBlitz Secrets (Recommended for Workshop)

StackBlitz provides a secure secrets manager for sensitive API keys. This is the **recommended approach** for the workshop environment.

### Adding Secrets to StackBlitz

1. **Open the Secrets Panel**
   - In StackBlitz editor, click the **lock icon** (🔒) in the left sidebar
   - This opens the Secrets Manager

2. **Model**
   - Inference does not use a secret. Set `model` in `src/config.ts` and run Ollama locally.

3. **Verify in Code**
   ```typescript
   import { llmConfig } from "./config";
   llmConfig.model
   ```

### Why StackBlitz Secrets?

- ✅ **Secure** - Keys never appear in code or version control
- ✅ **Isolated** - Each fork has its own secrets
- ✅ **Convenient** - No manual .env file management
- ✅ **Workshop-friendly** - Participants can fork and add their own keys

## Local Development (.env File)

For local development outside StackBlitz, use a `.env` file:

### Setup Steps

1. **Create .env file**
   ```bash
   cp .env.example .env
   ```

2. **Add your API keys**
   ```env
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. **Start dev server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

### Important: .env is Git-Ignored

The `.env` file is listed in `.gitignore` and will **never** be committed to version control. This is a safety feature to prevent accidental key leakage.

## Environment Variables Reference

| Variable | Required | Source | Usage |
|----------|----------|--------|-------|
| `model` in `src/config.ts` | Yes | Local Ollama tag | LLM inference |
| `VITE_API_BASE_URL` | No | Local/deployed API | Backend API endpoint (default: localhost:3000) |

## Getting API Keys

### Ollama model

1. Install [Ollama](https://ollama.com) and start `ollama serve`
2. Pull the tag in `src/config.ts` (`ollama pull qwen3.5:9b` by default)
3. Change `model` in that file to switch models

## Security Best Practices

### ✅ DO

- ✅ Use StackBlitz Secrets for workshop/demo environments
- ✅ Use `.env` file for local development (never commit it)
- ✅ Rotate API keys regularly
- ✅ Use separate keys for development and production
- ✅ Monitor API usage in provider dashboards

### ❌ DON'T

- ❌ Commit `.env` file to version control
- ❌ Paste API keys in code comments or documentation
- ❌ Share API keys in Slack, email, or chat
- ❌ Use production keys in development
- ❌ Expose keys in client-side code (use backend proxy instead)

## Troubleshooting

### "API key not found" Error

**Symptom:** `Error: VITE_GROQ_API_KEY is undefined`

**Solutions:**
1. **StackBlitz:** Verify secret is added in Secrets Manager (🔒 icon)
2. **Local:** Check `.env` file exists and has correct key name
3. **Local:** Restart dev server after adding `.env`
4. **Check:** Ensure key name matches exactly (case-sensitive)

### "Invalid API key" Error

**Symptom:** `Error: 401 Unauthorized`

**Solutions:**
1. Verify key is correct (copy from provider dashboard again)
2. Check key hasn't expired or been revoked
3. Verify key has correct permissions/scopes
4. Try creating a new key in provider dashboard

### "Rate limit exceeded" Error

**Symptom:** `Error: 429 Too Many Requests`

**Solutions:**
1. Wait a few minutes before retrying
2. Wait and retry if the local model is busy
3. Use a smaller model tag in `src/config.ts` if responses are too slow

## Session-Specific Configuration

### Session 2: State & Orchestration

**Required:**
- `VITE_GROQ_API_KEY` ✅

**Optional:**
- `VITE_API_BASE_URL` (for custom backend)

## Instructor Setup

For instructors running the workshop:

1. **Create StackBlitz template** with your own API keys in Secrets
2. **Share template link** with participants (they'll fork it)
3. **Participants add their own keys** to their fork's Secrets
4. **Each participant has isolated environment** - no key sharing

This ensures:
- ✅ Keys are never shared
- ✅ Each participant has their own API quota
- ✅ No cost overruns from shared keys
- ✅ Easy to revoke access per participant

## Advanced: Backend Proxy (Production)

For production deployments, use a backend proxy to hide API keys:

```typescript
// Frontend (safe - no keys exposed)
const response = await fetch('/api/agent/orchestrate', {
  method: 'POST',
  body: JSON.stringify({ query: userInput }),
});

// Backend (safe - keys in environment)
app.post('/api/agent/orchestrate', async (req, res) => {
  const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY, // Server-side only
  });
  // ... orchestration logic
});
```

This pattern is recommended for production but not necessary for the workshop demo.

## Support

For issues with API keys or environment setup:

1. Check the troubleshooting section above
2. Verify keys in provider dashboards
3. Review provider documentation:
   - [Ollama](https://ollama.com)
4. Contact workshop organizers for assistance

---

**Last Updated:** 2024
**Workshop Version:** Session 2 & 3 (State & Orchestration, Governance & FinOps)
