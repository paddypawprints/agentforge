/*
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  orchestrator.ts  —  THE AGENT LOOP                             ║
 * ║                                                                  ║
 * ║  This file is the brain of the workshop app.  It contains the   ║
 * ║  agentic loop: call the LLM → check if it wants a tool → run    ║
 * ║  the tool → feed the result back → repeat until "stop".         ║
 * ║                                                                  ║
 * ║  The two files students need to read are:                        ║
 * ║    1. orchestrator.ts  (this file)  — the loop                  ║
 * ║    2. tools.ts                      — the tools                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import { Tool, PromptMessage, Round, Exchange } from "../types/agent";
import BENEFITS_DOC from "../data/Employee Benefits 2026.md?raw";
import { addMemoryEntry, getMemory } from "./memory";

// Initialize Groq client (lazy loaded to avoid issues with missing API key at startup)
let groq: any = null;
let runtimeApiKey: string | null = null;
let runtimeModel: string = "llama-3.3-70b-versatile";
let runtimeTemperature: number = 1.0;
let runtimePortkeyKey: string | null = null;
let runtimePortkeyVirtualKey: string = "aidaysf"; // virtual key slug configured in Portkey dashboard

/* ═══════════════════════════════════════════════════════════════════
 * EXERCISE STEP 1 — SYSTEM PROMPT (chatbot, no tools)
 *
 * HR_CHATBOT_PROMPT tells the LLM to act as a general HR chatbot.
 * It explicitly says "do NOT use any tools", so the LLM will always
 * reply with finish_reason === "stop" — no tool calls, no loop.
 *
 * Workshop step 4 uses this prompt to show pure LLM answering.
 * Try asking "What are Alice's benefits?" — the LLM will make up an
 * answer from training data instead of looking up the real data.
 * ═══════════════════════════════════════════════════════════════════ */
export const HR_CHATBOT_PROMPT =
`You are an HR department chatbot. You answer employee questions about HR policies, benefits, time off, compensation structure, company culture, and workplace procedures.

You do NOT use any tools — you answer from general HR knowledge only.
If a question is not HR-related, politely decline and redirect the user.
Be concise, professional, and friendly.`;

/* ═══════════════════════════════════════════════════════════════════
 * EXERCISE STEP 2 — SYSTEM PROMPT (agent, with tools + grounding)
 *
 * HR_AGENT_PROMPT tells the LLM two things:
 *   1. Use the benefits_lookup tool whenever someone asks about a
 *      specific employee's benefits (triggers the tool-use loop).
 *   2. The full 2026 benefits policy document is embedded directly
 *      in the prompt (RAG-style grounding) so the LLM can answer
 *      policy questions without needing a tool call at all.
 *
 * Workshop step 6 uses this prompt to trigger the full agent loop.
 * ═══════════════════════════════════════════════════════════════════ */
export const HR_AGENT_PROMPT =
`You are an HR assistant agent with access to live HR data tools and the 2026 benefits policy document.

Available tools:
- benefits_lookup: Retrieves the full benefits package for a specific employee by their ID (EMP001–EMP004). Use this whenever someone asks about a specific employee's benefits.
Always use the appropriate tool when the user asks for specific employee data or compensation figures.
After calling a tool, summarise the result clearly for the user.
Only answer HR-related questions — politely redirect off-topic requests.

--- 2026 BENEFITS POLICY REFERENCE ---
${BENEFITS_DOC}
--- END OF POLICY ---`;

/** @deprecated use HR_CHATBOT_PROMPT or HR_AGENT_PROMPT */
const DEFAULT_SYSTEM_PROMPT = HR_CHATBOT_PROMPT;

let runtimeSystemPrompt: string = DEFAULT_SYSTEM_PROMPT;

/** Set the Groq API key at runtime (e.g. from user input). Resets the cached client. */
export function setGroqApiKey(key: string) {
  runtimeApiKey = key.trim();
  groq = null; // force re-initialization with new key
}

/** Set (or clear) the Portkey API key. When set, all traffic is routed via api.portkey.ai. */
export function setPortkeyApiKey(key: string | null) {
  runtimePortkeyKey = key ? key.trim() : null;
  groq = null; // force re-initialization so direct-fetch path is picked up
}

/** Override the Portkey virtual key slug (default: "aidaysf"). */
export function setPortkeyVirtualKey(slug: string) {
  runtimePortkeyVirtualKey = slug;
}

/** Returns true if Portkey routing is active. */
export function isPortkeyActive(): boolean {
  return !!runtimePortkeyKey;
}

/** Set the Groq model to use at runtime. */
export function setGroqModel(model: string) {
  runtimeModel = model;
}

/** Set the sampling temperature (0.0 – 2.0). */
export function setTemperature(value: number) {
  runtimeTemperature = Math.max(0, Math.min(2, value));
}

/** Set the system prompt at runtime. */
export function setSystemPrompt(prompt: string) {
  runtimeSystemPrompt = prompt;
}

/** Get the current system prompt. */
export function getSystemPrompt(): string {
  return runtimeSystemPrompt;
}

/** Get the default system prompt. */
export function getDefaultSystemPrompt(): string {
  return HR_CHATBOT_PROMPT;
}

/** Fetch available models from Groq. Requires the API key to be set first. */
export async function fetchGroqModels(): Promise<string[]> {
  try {
    const client = await getGroqClient();
    const list = await client.models.list();
    return (list.data as any[])
      .map((m: any) => m.id as string)
      .sort();
  } catch {
    return [];
  }
}

async function getGroqClient() {
  if (!groq) {
    const apiKey = runtimeApiKey || (import.meta as any).env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("No Groq API key set. Please enter your API key.");
    }
    const { Groq } = await import("groq-sdk");
    groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
  }
  return groq;
}

/**
 * Call the LLM — either direct Groq SDK or via Portkey gateway using raw fetch.
 *
 * WHY raw fetch for Portkey?
 * The Groq SDK hardcodes its own base path, which doubles up when you point it
 * at Portkey (resulting in /openai/v1/openai/v1/...). Using fetch directly lets
 * us POST to https://api.portkey.ai/v1/chat/completions with exactly the headers
 * Portkey expects, with no path mangling.
 *
 * Portkey virtual key: the slug ("aidaysf") maps to the real Groq API key stored
 * securely in the Portkey dashboard — we never send the Groq key over the wire.
 */
async function callGroqAPI(
  groqHistory: any[],
  tools: Tool[],
  gatewayUrl?: string
) {
  const groqTools = tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));

  // ── EXERCISE STEP 9: PORTKEY PATH ────────────────────────────────────────
  // When a Portkey API key is entered in the header checkbox, all traffic is
  // routed through api.portkey.ai instead of Groq directly.  Portkey logs
  // every request and response — you can inspect token counts, latency, and
  // PII detection (watch for the SSNs in the tool output!) in the dashboard.
  //
  // We use raw fetch() instead of the Groq SDK here because the SDK hardcodes
  // its own base path (/openai/v1), which doubles up when pointed at Portkey,
  // resulting in /openai/v1/openai/v1/chat/completions (404).
  if (runtimePortkeyKey) {
    console.log(`[Orchestrator] Calling via Portkey (virtual key: ${runtimePortkeyVirtualKey}, model: ${runtimeModel})`);
    const body = JSON.stringify({
      model: runtimeModel,
      messages: groqHistory,
      tools: groqTools,
      temperature: runtimeTemperature,
    });
    const res = await fetch("https://api.portkey.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-portkey-api-key": runtimePortkeyKey,
        "x-portkey-virtual-key": runtimePortkeyVirtualKey,
      },
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${text}`);
    }
    const data = await res.json();
    return data.choices[0];
  }

  // ── DEFAULT PATH: DIRECT GROQ SDK ─────────────────────────────────────────
  // No Portkey key set — call Groq directly using the SDK.
  // This is the default path for exercises 1–6.
  const client = await getGroqClient();
  console.log(`[Orchestrator] Calling Groq API with ${groqHistory.length} messages and ${tools.length} tools`);
  const response = await client.chat.completions.create({
    model: runtimeModel,
    messages: groqHistory,
    tools: groqTools,
    temperature: runtimeTemperature,
  });
  return response.choices[0];
}

/**
 * Convert a PromptMessage[] to the Groq wire format (raw role/content objects).
 * This is the only place where PromptMessage is translated — all other code
 * works with the higher-level typed representation.
 */
function toGroqWire(msgs: PromptMessage[]): any[] {
  return msgs.map(m => {
    switch (m.source) {
      case 'system':           return { role: 'system', content: m.text };
      case 'memory_user':      return { role: 'user', content: m.text };
      case 'memory_assistant': return { role: 'assistant', content: m.text };
      case 'user':             return { role: 'user', content: m.text };
      case 'assistant':        return { role: 'assistant', content: m.text };
      case 'tool_call':        return { role: 'assistant', content: m.text || null, tool_calls: m.toolCalls };
      case 'tool_response':    return { role: 'tool', tool_call_id: m.toolCallId, content: m.text };
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════
 * EXERCISE STEPS 4, 5, 6 — THE ORCHESTRATION ENTRY POINT
 *
 * `orchestrate()` runs the full agent loop and returns an Exchange
 * describing every round: what was compiled and sent, what came back,
 * and any tool calls with their results.
 *
 * No event bus, no store writes — just an async function that returns
 * a value.  The component awaits it and renders the result.
 * ═══════════════════════════════════════════════════════════════════ */
export async function orchestrate(
  userQuery: string,
  tools: Tool[],
  gatewayUrl?: string
): Promise<Exchange> {
  // ── BUILD THE INITIAL PROMPT ────────────────────────────────────────────
  // System prompt (if set) + memory turns + user query, each tagged with a
  // source label so the trace UI can colour-code without index arithmetic.
  const memory = getMemory();
  const prompt: PromptMessage[] = [
    ...(runtimeSystemPrompt ? [{ source: 'system' as const, text: runtimeSystemPrompt }] : []),
    ...memory.flatMap(m => [
      { source: 'memory_user' as const, text: m.user },
      { source: 'memory_assistant' as const, text: m.assistant },
    ]),
    { source: 'user' as const, text: userQuery },
  ];

  const rounds: Round[] = [];

  // ── AGENT LOOP ──────────────────────────────────────────────────────────
  // Snapshot the current prompt, call the LLM, record the round.
  // If finish_reason === "tool_calls": run the tool, extend the prompt, loop.
  // If finish_reason === "stop": record final round and return.
  let loopCount = 0;
  while (loopCount <= 5) {
    const requestSnapshot: PromptMessage[] = [...prompt];
    console.log(`[Orchestrator] LLM call ${loopCount + 1}, prompt length: ${prompt.length}`);

    const choice = await callGroqAPI(toGroqWire(prompt), tools, gatewayUrl);
    console.log(`[Orchestrator] finish_reason=${choice.finish_reason}`);

    // ── STOP: final answer ─────────────────────────────────────────────────
    if (choice.finish_reason !== 'tool_calls' || loopCount >= 5) {
      const finalAnswer = choice.message.content || '(no response)';
      rounds.push({ request: requestSnapshot, finish_reason: 'stop', text: finalAnswer });
      addMemoryEntry(userQuery, finalAnswer);
      return { userQuery, rounds, finalAnswer };
    }

    // ── TOOL CALL ──────────────────────────────────────────────────────────
    // The LLM wants to call a tool.  Parse the request, execute the tool,
    // record the round, then inject the result back into the prompt so the
    // LLM has full context on the next call.  This is what the student did
    // manually in exercise step 5 — paste result back and re-submit.
    const toolCalls = choice.message.tool_calls || [];
    const tc = toolCalls[0];
    if (!tc) break;

    const toolName = tc.function.name;
    let toolInput: Record<string, unknown>;
    try { toolInput = JSON.parse(tc.function.arguments); }
    catch { toolInput = { raw: tc.function.arguments }; }

    console.log(`[Orchestrator] Tool request: ${toolName}`, toolInput);

    const tool = tools.find(t => t.name === toolName);
    let toolResult: string;
    if (tool) {
      try { toolResult = await tool.execute(toolInput); }
      catch (err) { toolResult = JSON.stringify({ error: err instanceof Error ? err.message : String(err) }); }
    } else {
      toolResult = JSON.stringify({ error: `Tool "${toolName}" not found` });
    }

    console.log(`[Orchestrator] Tool result:`, toolResult);

    rounds.push({
      request: requestSnapshot,
      finish_reason: 'tool_calls',
      text: choice.message.content || null,
      toolName,
      toolInput,
      toolResult,
    });

    // Extend prompt with the tool call + result for the next LLM call
    prompt.push({ source: 'tool_call', text: choice.message.content || '', toolName, toolInput, toolCalls });
    prompt.push({ source: 'tool_response', text: toolResult, toolCallId: tc.id });

    loopCount++;
  }

  return { userQuery, rounds, finalAnswer: '(no response)' };
}

/**
 * Direct, stateless single-turn LLM call — no system prompt, no tools, no memory.
 * Used when Agent Mode is OFF. The user message is sent exactly as typed.
 */
export async function sendMessage(userMessage: string, gatewayUrl?: string): Promise<Exchange> {
  const prompt: PromptMessage[] = [{ source: 'user', text: userMessage }];
  const choice = await callGroqAPI(toGroqWire(prompt), [], gatewayUrl);
  const finalAnswer = choice.message.content || '(no response)';
  return {
    userQuery: userMessage,
    rounds: [{ request: prompt, finish_reason: 'stop', text: finalAnswer }],
    finalAnswer,
  };
}

/**
 * Export for testing/debugging
 */
export { callGroqAPI };
