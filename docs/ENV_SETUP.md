# Environment Setup Guide

This guide explains how to configure environment variables for the AI Agents Workshop StackBlitz template across different deployment scenarios.

## Overview

The workshop uses three external services:
1. **Groq API** - LLM inference (Session 2: State & Orchestration)
2. **Portkey Gateway** - Security & cost monitoring (Session 3: Governance & FinOps)
3. **Analytics Service** - Instructor dashboard (optional)

## StackBlitz Secrets (Recommended for Workshop)

StackBlitz provides a secure secrets manager for sensitive API keys. This is the **recommended approach** for the workshop environment.

### Adding Secrets to StackBlitz

1. **Open the Secrets Panel**
   - In StackBlitz editor, click the **lock icon** (🔒) in the left sidebar
   - This opens the Secrets Manager

2. **Add GROQ_API_KEY**
   - Key: `VITE_GROQ_API_KEY`
   - Value: Your Groq API key from [console.groq.com](https://console.groq.com)
   - Click "Add Secret"

3. **Add PORTKEY_API_KEY** (for Session 3)
   - Key: `VITE_PORTKEY_API_KEY`
   - Value: Your Portkey API key from [portkey.ai](https://portkey.ai)
   - Click "Add Secret"

4. **Verify in Code**
   ```typescript
   // Secrets are automatically available as environment variables
   const groqKey = import.meta.env.VITE_GROQ_API_KEY;
   const portkeyKey = import.meta.env.VITE_PORTKEY_API_KEY;
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
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_PORTKEY_API_KEY=your_portkey_api_key_here
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
| `VITE_GROQ_API_KEY` | Yes | [console.groq.com](https://console.groq.com) | LLM inference (Session 2) |
| `VITE_PORTKEY_API_KEY` | No | [portkey.ai](https://portkey.ai) | Gateway & cost monitoring (Session 3) |
| `VITE_API_BASE_URL` | No | Local/deployed API | Backend API endpoint (default: localhost:3000) |

## Getting API Keys

### Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the key and add to StackBlitz Secrets or `.env`

**Free tier includes:**
- 30 requests per minute
- Unlimited monthly requests (rate-limited)
- Access to Mixtral 8x7B, LLaMA 2 70B, and other models

### Portkey API Key

1. Go to [portkey.ai](https://portkey.ai)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the key and add to StackBlitz Secrets or `.env`

**Portkey features:**
- PII masking (SSN, email, credit card detection)
- Rate limiting and cost tracking
- Request/response logging
- Multi-provider routing

## Security Best Practices

### ✅ DO

- ✅ Use StackBlitz Secrets for workshop/demo environments
- ✅ Use `.env` file for local development (never commit it)
- ✅ Rotate API keys regularly
- ✅ Use separate keys for development and production
- ✅ Monitor API usage in provider dashboards
- ✅ Set rate limits in Portkey to prevent runaway costs

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
2. Check Groq dashboard for usage stats
3. For Portkey: Set rate limits in gateway config
4. Consider upgrading API plan if consistently hitting limits

### "Portkey gateway not responding" Error

**Symptom:** `Error: Failed to connect to Portkey`

**Solutions:**
1. Verify `VITE_PORTKEY_API_KEY` is correct
2. Check Portkey service status at [status.portkey.ai](https://status.portkey.ai)
3. Verify network connectivity
4. Try disabling Portkey (Session 2 works without it)

## Session-Specific Configuration

### Session 2: State & Orchestration

**Required:**
- `VITE_GROQ_API_KEY` ✅

**Optional:**
- `VITE_API_BASE_URL` (for custom backend)

**Configuration:**
```typescript
// src/services/orchestrator.ts
const groqClient = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // StackBlitz only
});
```

### Session 3: Governance & FinOps

**Required:**
- `VITE_GROQ_API_KEY` ✅
- `VITE_PORTKEY_API_KEY` ✅

**Configuration:**
```typescript
// src/services/portkey.ts
const portkeyClient = createPortkeyClient({
  groqApiKey: import.meta.env.VITE_GROQ_API_KEY,
  portkeyApiKey: import.meta.env.VITE_PORTKEY_API_KEY,
});
```

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
   - [Groq Docs](https://console.groq.com/docs)
   - [Portkey Docs](https://docs.portkey.ai)
4. Contact workshop organizers for assistance

---

**Last Updated:** 2024
**Workshop Version:** Session 2 & 3 (State & Orchestration, Governance & FinOps)
