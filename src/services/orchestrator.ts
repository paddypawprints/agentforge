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

import { useAgentStore } from "../store/agentStore";
import { Tool } from "../types/agent";
import BENEFITS_DOC from "../data/Employee Benefits 2026.md?raw";

// Initialize Groq client (lazy loaded to avoid issues with missing API key at startup)
let groq: any = null;
let runtimeApiKey: string | null = null;
let runtimeModel: string = "llama-3.3-70b-versatile";
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
  });
  return response.choices[0];
}

/* ═══════════════════════════════════════════════════════════════════
 * EXERCISE STEPS 4, 5, 6 — THE ORCHESTRATION ENTRY POINT
 *
 * `orchestrate()` is called by the UI (MessageComposer) on every
 * user message.  It runs the full agent loop:
 *
 *   1. Build groqHistory (system prompt + user message)
 *   2. Call the LLM via callGroqAPI()
 *   3. If finish_reason === "tool_calls"  →  run the tool  →  loop
 *   4. If finish_reason === "stop"        →  write final answer to UI
 *
 * The UI also receives "status" messages at each step so the
 * MessageHistory panel can display the complete execution trace.
 * ═══════════════════════════════════════════════════════════════════ */
export async function orchestrate(
  userQuery: string,
  tools: Tool[],
  gatewayUrl?: string
) {
  const { addMessage, setLoading } = useAgentStore.getState();

  setLoading(true);

  // ── STEP 4A: BUILD THE MESSAGES ARRAY ──────────────────────────────────
  // groqHistory is the list of messages we send to the LLM on every call.
  // It always starts with the system prompt + the user's question.
  // As the loop runs, tool calls and tool results are appended here so the
  // LLM has full context when we call it again.
  // This is what the "Orchestrator: sending to LLM" trace card displays.
  // Local Groq-format history — never includes 'status' messages
  const groqHistory: any[] = [
    { role: "system", content: runtimeSystemPrompt },
    { role: "user", content: userQuery },
  ];

  try {
    console.log(`[Orchestrator] Starting orchestration for query: "${userQuery}"`);

    // Add user message to UI
    addMessage({ role: "user", content: userQuery, timestamp: new Date() });

    // ── STEP 4B: FIRST LLM CALL ────────────────────────────────────────────
    // Emit a "status" event so the trace panel shows the outgoing messages,
    // then call the LLM.  Watch MessageHistory to see this happen in real time.
    // Status: first LLM call — include the messages being sent
    addMessage({ role: "status", content: JSON.stringify({ type: "llm_call", callNum: 1, contextMessages: groqHistory.slice(1) }), timestamp: new Date() });

    let choice = await callGroqAPI(groqHistory, tools, gatewayUrl);

    console.log(`[Orchestrator] finish_reason=${choice.finish_reason}, tool_calls=${(choice.message.tool_calls || []).length}`);

    // ── STEP 6: TOOL USE LOOP ──────────────────────────────────────────────
    // finish_reason === "tool_calls" means the LLM wants to call a tool
    // instead of answering directly.  We loop up to 5 times so the agent
    // can chain multiple tool calls if needed.
    //
    // Each iteration:
    //   a) Read the tool name + arguments from the LLM response
    //   b) Execute the tool (same function you called manually in step 3)
    //   c) Inject the result back into groqHistory  (= step 5, automated)
    //   d) Call the LLM again with the updated context
    //
    // With HR_CHATBOT_PROMPT this loop never runs — finish_reason is "stop".
    // With HR_AGENT_PROMPT and a question about a specific employee, it runs once.
    // Tool use loop — Groq signals tool requests with finish_reason === "tool_calls"
    let loopCount = 0;
    while (choice.finish_reason === "tool_calls" && loopCount < 5) {
      loopCount++;
      const toolCalls = choice.message.tool_calls || [];
      const tc = toolCalls[0];
      if (!tc) break;

      const toolName = tc.function.name;
      let toolInput: Record<string, unknown>;
      try {
        toolInput = JSON.parse(tc.function.arguments);
      } catch {
        toolInput = { raw: tc.function.arguments };
      }

      console.log(`[Orchestrator] Tool request (loop ${loopCount}): ${toolName}`, toolInput);

      // Status: LLM responded with a tool call — show raw response + decision
      addMessage({
        role: "status",
        content: JSON.stringify({ type: "llm_response", finish_reason: "tool_calls", responseContent: choice.message.content || null, tool_name: toolName, tool_input: toolInput }),
        timestamp: new Date(),
      });

      // Add assistant message with tool_calls to groqHistory (proper Groq format)
      groqHistory.push({
        role: "assistant",
        content: choice.message.content || null,
        tool_calls: toolCalls,
      });

      // ── STEP 6B: EXECUTE THE TOOL ──────────────────────────────────────────
      // This is the exact same `execute()` function you called manually in the
      // Tool Dispatcher sandbox (exercise step 3).  The difference: the agent
      // calls it automatically with the arguments the LLM chose.
      // Execute the tool
      const tool = tools.find((t) => t.name === toolName);
      let toolResult: string;
      if (tool) {
        try {
          toolResult = await tool.execute(toolInput);
        } catch (err) {
          toolResult = JSON.stringify({ error: err instanceof Error ? err.message : String(err) });
        }
      } else {
        toolResult = JSON.stringify({ error: `Tool "${toolName}" not found` });
      }

      console.log(`[Orchestrator] Tool result:`, toolResult);

      // Add tool result to UI (cyan)
      addMessage({
        role: "tool",
        content: toolResult,
        timestamp: new Date(),
        tool_call_id: tc.id,
      });

      // ── STEP 6C: INJECT RESULT INTO CONTEXT ────────────────────────────────
      // This is the "paste the result back in" step from exercise step 5,
      // done programmatically.  The tool result becomes a "tool" role message
      // in groqHistory, tied to the LLM's request via tool_call_id.
      // The LLM will see: system + user + its own tool request + this result.
      // Add tool result to groqHistory (proper Groq format with tool_call_id)
      groqHistory.push({
        role: "tool",
        tool_call_id: tc.id,
        content: toolResult,
      });

      // ── STEP 6D: CALL LLM AGAIN WITH TOOL RESULT ───────────────────────────
      // The LLM now has full context: system + user + its own tool request +
      // the tool result.  It will either call another tool (loop again) or
      // reply with finish_reason === "stop" (done).
      // Status: re-calling LLM — include full updated context
      addMessage({ role: "status", content: JSON.stringify({ type: "llm_call", callNum: loopCount + 1, contextMessages: groqHistory.slice(1) }), timestamp: new Date() });

      choice = await callGroqAPI(groqHistory, tools, gatewayUrl);
      console.log(`[Orchestrator] finish_reason=${choice.finish_reason}`);
    }

    // Status: LLM responded with final answer — include raw response text
    addMessage({
      role: "status",
      content: JSON.stringify({ type: "llm_response", finish_reason: "stop", responseContent: choice.message.content || null }),
      timestamp: new Date(),
    });

    // ── FINAL: WRITE ANSWER TO UI ─────────────────────────────────────────
    // finish_reason === "stop" → the LLM is done reasoning.  Write the final
    // assistant message to the Zustand store.  MessageHistory reads from the
    // store and renders it as the green ✓ ASSISTANT card.
    // Final assistant response
    addMessage({
      role: "assistant",
      content: choice.message.content || "(no response)",
      timestamp: new Date(),
    });

    console.log(`[Orchestrator] Orchestration complete.`);
  } catch (error) {
    console.error("[Orchestrator] Error:", error);
    addMessage({
      role: "assistant",
      content: `⚠ Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp: new Date(),
    });
  } finally {
    setLoading(false);
  }
}

/**
 * Export for testing/debugging
 */
export { callGroqAPI, createPortkeyClient };
