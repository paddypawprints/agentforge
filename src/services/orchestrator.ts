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
import { addMemoryEntry, formatMemoryText, getMemory } from "./memory";
import { llmConfig } from "../config";
import { formatToolPrompt, getEmbeddedToolDescription } from "./tools";
import { liftSection, renderTemplate, TemplateContext } from "./templates";
import { compilePromptBlocks, hasPromptStructure, joinPrompt, offeredTools, OfferedTool, optionalRole, promptFromRoles } from "./promptStructure";

let runtimeTemperature: number = 1.0;

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
export const HR_CHATBOT_PROMPT = promptFromRoles([
  {
    role: "system",
    content: "You are an HR department chatbot. You answer employee questions about HR policies, benefits, time off, compensation structure, company culture, and workplace procedures. You do not use any tools. You answer from general HR knowledge only. If a question is not HR-related, politely decline and redirect the user. Be concise, professional, and friendly.",
  },
  { role: "memory", content: "{{memory}}" },
  { role: "user", content: "{{user}}" },
]);

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
export const HR_AGENT_PROMPT = promptFromRoles([
  {
    role: "system",
    content: "You are an HR assistant agent with access to live HR data tools and the 2026 benefits policy document. Use benefits_lookup whenever someone asks about a specific employee's benefits (EMP001–EMP004). After a tool result, summarise it clearly. Only answer HR-related questions. Politely redirect off-topic requests.",
  },
  { role: "system", content: BENEFITS_DOC },
  { role: "tool", content: "{{tool}}" },
  { role: "memory", content: "{{memory}}" },
  { role: "user", content: "{{user}}" },
]);

/** Chat mode. An HR chatbot: instructions, the policy when grounding is on, memory, then the employee. */
export const CHATBOT_PROMPT = joinPrompt([
  promptFromRoles([
    {
      role: "system",
      content: "You are an HR department chatbot for employees. Answer questions about HR policies, benefits, time off, compensation, company culture, and workplace procedures. You do not call tools. Use the policy document when it is included. If a question is not about HR, politely decline and redirect. Be concise, professional, and friendly.",
    },
  ]),
  optionalRole("grounding", "system", "This is the policy. Use it when the question depends on it.\n{{grounding}}"),
  optionalRole("memory", "memory", "{{memory}}"),
  optionalRole("user", "user", "{{user}}"),
]);

const ROUTE_CONTRACT =
`Reply with only this JSON.
{"route":"chat","reply":"the answer"}
or, when the answer needs a tool or more than one step:
{"route":"workflow"}`;

const TASK_CONTRACT =
`Reply with only this JSON.
{"tasks":[{"instruction":"what the worker should do","tools":["tool_name"]}]}
Each task has one instruction and the tool names that task may use. Use an empty tools array when the task needs no tool.`;

const SUMMARY_CONTRACT =
`Reply with only this JSON.
{"status":"done","reply":"the answer"}
or, when the tasks did not achieve the request:
{"status":"retry","reason":"what is still missing"}
When a message says this is the last pass, reply with status done.`;

/** The agent chooses a direct answer or a workflow. It does not call tools. */
export const AGENT_PROMPT = joinPrompt([
  promptFromRoles([
    {
      role: "system",
      content: "You are an HR assistant. Answer the employee directly when the question is general HR knowledge or is covered by the included policy. Choose a workflow when the answer needs a tool listed in this message, or more than one step. Do not call tools yourself. Only answer HR questions. If a question is not about HR, politely decline and redirect.",
    },
  ]),
  optionalRole("grounding", "system", "This is the policy. Answer from it when it covers the question.\n{{grounding}}"),
  optionalRole("mcp", "system", "These are the MCP tools. Choose a workflow when the answer needs one of them.\n{{mcp}}"),
  optionalRole("mcp-helper", "system", "These are local notes for the MCP servers. Choose a workflow when a note says a tool is required.\n{{mcp-helper}}"),
  optionalRole("tool", "tool", "This is the embedded tool. Choose a workflow when the answer needs it.\n{{tool}}"),
  promptFromRoles([{ role: "system", content: ROUTE_CONTRACT }]),
  optionalRole("memory", "memory", "{{memory}}"),
  optionalRole("user", "user", "{{user}}"),
]);

/** @deprecated use AGENT_PROMPT */
const DEFAULT_SYSTEM_PROMPT = AGENT_PROMPT;

/** The planner returns a task list. It does not answer the employee or call tools. */
export const PLANNER_PROMPT = joinPrompt([
  promptFromRoles([
    {
      role: "system",
      content: "You are the planner for an HR assistant. Do not answer the employee. Do not call tools. Break the request into tasks for the worker. Each task is one instruction. Name a tool from the lists in this message when the task needs it. Use an empty tool list when the task needs no tool, including when the included policy already has the answer.",
    },
  ]),
  optionalRole("mcp", "system", "These are the MCP tools. Name one in a task's tools array when that task needs it.\n{{mcp}}"),
  optionalRole("mcp-helper", "system", "These are local notes for the MCP servers. Follow them when you name tools and write task instructions.\n{{mcp-helper}}"),
  optionalRole("tool", "tool", "This is the embedded tool. Name it in a task's tools array when that task needs it.\n{{tool}}"),
  optionalRole("grounding", "system", "This is the policy. Use an empty tools array when the policy already has the answer.\n{{grounding}}"),
  optionalRole("task-history", "system", "These are the finished steps.\n{{task-history}}"),
  optionalRole("retry", "system", "The previous tasks did not achieve the request. Plan only the work that is still missing.\n{{retry}}"),
  promptFromRoles([{ role: "system", content: TASK_CONTRACT }]),
  optionalRole("memory", "memory", "{{memory}}"),
  optionalRole("user", "user", "{{user}}"),
]);

/** The worker carries out one workflow step and may call the tools named on that step. */
export const WORKER_PROMPT = joinPrompt([
  promptFromRoles([
    {
      role: "system",
      content: "You are the worker for an HR assistant. Carry out the current workflow step only. Follow its instruction and no other step. Call a tool only when its name is in that step's tools array. Read that tool's parameters from the MCP list in this message and pass those arguments. Reply with the result of the instruction, including the figures and policy details it asked for. Do not write the message the employee will see.",
    },
  ]),
  optionalRole("mcp", "system", "These are the MCP tools. Call one only when its name is on the assigned task.\n{{mcp}}"),
  optionalRole("mcp-helper", "system", "These are local notes for the MCP servers. Use them to fill arguments for this step.\n{{mcp-helper}}"),
  optionalRole("tool", "tool", "This is the embedded tool.\n{{tool}}"),
  optionalRole("grounding", "system", "This is the policy. Use it when the task depends on it.\n{{grounding}}"),
  optionalRole("task-history", "system", "This is the progress so far.\n{{task-history}}"),
  optionalRole("task", "system", "This is your assigned task.\n{{task}}"),
  "{{#tools}}\n{{mcp}}\n{{tool}}\n{{task}}\n{{/tools}}",
]);

/** The summarizer writes the employee-facing reply from the finished tasks. */
export const SUMMARIZER_PROMPT = joinPrompt([
  promptFromRoles([
    {
      role: "system",
      content: "You are the summarizer for an HR assistant. Write the reply the employee should see from the task results. Be concise, professional, and friendly. Do not mention the tasks, the planner, or the tools. State only benefits and policy facts that the task results or the included policy support. If a question is not about HR, politely decline and redirect.",
    },
  ]),
  optionalRole("grounding", "system", "This is the policy. State only facts it supports.\n{{grounding}}"),
  optionalRole("task-history", "system", "These are the finished steps. Write the reply from their results.\n{{task-history}}"),
  optionalRole("last-pass", "system", "This is the last pass. Reply with only this JSON.\n{\"status\":\"done\",\"reply\":\"the answer\"}"),
  promptFromRoles([{ role: "system", content: SUMMARY_CONTRACT }]),
  optionalRole("memory", "memory", "{{memory}}"),
  optionalRole("user", "user", "{{user}}"),
]);

let runtimeSystemPrompt: string = DEFAULT_SYSTEM_PROMPT;
let runtimePlannerPrompt: string = PLANNER_PROMPT;
let runtimeWorkerPrompt: string = WORKER_PROMPT;
let runtimeSummarizerPrompt: string = SUMMARIZER_PROMPT;
let runtimeChatbotPrompt: string = CHATBOT_PROMPT;

/** Set the sampling temperature (0.0 – 2.0). */
export function setTemperature(value: number) {
  runtimeTemperature = Math.max(0, Math.min(2, value));
}

export type ModelProvider = "ollama" | "openai";

const OPENAI_BASE = "https://api.openai.com/v1";

let runtimeProvider: ModelProvider = "ollama";
let runtimeOllamaModel = llmConfig.model;
let runtimeOllamaBase = `${llmConfig.host}/v1`;
let runtimeOpenaiModel = "gpt-4o-mini";
let runtimeOpenaiBase = OPENAI_BASE;
let runtimeApiKey = "";
let runtimeReasoningEffort: ReasoningEffort = "none";

export type ReasoningEffort = "none" | "low" | "medium" | "high";

const REASONING_EFFORTS: readonly ReasoningEffort[] = ["none", "low", "medium", "high"];

/** Ollama thinking level. None turns thinking off. */
export function setReasoningEffort(value: string) {
  runtimeReasoningEffort = REASONING_EFFORTS.includes(value as ReasoningEffort) ? value as ReasoningEffort : "none";
}

/** Which model the next call uses. The API key is kept only in memory. */
export function setModelChoice(choice: {
  provider: ModelProvider;
  ollamaModel: string;
  ollamaBase: string;
  openaiModel: string;
  baseUrl: string;
  apiKey: string;
}) {
  runtimeProvider = choice.provider;
  runtimeOllamaModel = choice.ollamaModel;
  runtimeOllamaBase = choice.ollamaBase;
  runtimeOpenaiModel = choice.openaiModel;
  runtimeOpenaiBase = choice.baseUrl;
  runtimeApiKey = choice.apiKey;
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
  return AGENT_PROMPT;
}

/** Set the chatbot prompt. Included in the message only while the chatbot concept is on. */
export function setChatbotPrompt(prompt: string) {
  runtimeChatbotPrompt = prompt;
}

export function getChatbotPrompt(): string {
  return runtimeChatbotPrompt;
}

export function getDefaultChatbotPrompt(): string {
  return CHATBOT_PROMPT;
}

/** Set the planner prompt. Used only for the planning step, and only when the loop is on. */
export function setPlannerPrompt(prompt: string) {
  runtimePlannerPrompt = prompt;
}

/** Get the current planner prompt. */
export function getPlannerPrompt(): string {
  return runtimePlannerPrompt;
}

/** Get the default planner prompt. */
export function getDefaultPlannerPrompt(): string {
  return PLANNER_PROMPT;
}

/** Set the worker prompt. Included on the loop, after the planner has written a plan. */
export function setWorkerPrompt(prompt: string) {
  runtimeWorkerPrompt = prompt;
}

export function getWorkerPrompt(): string {
  return runtimeWorkerPrompt;
}

export function getDefaultWorkerPrompt(): string {
  return WORKER_PROMPT;
}

/** Set the summarizer prompt. It writes the user reply after a workflow. */
export function setSummarizerPrompt(prompt: string) {
  runtimeSummarizerPrompt = prompt;
}

export function getSummarizerPrompt(): string {
  return runtimeSummarizerPrompt;
}

export function getDefaultSummarizerPrompt(): string {
  return SUMMARIZER_PROMPT;
}

/** The document {{grounding}} inserts. Starts as the 2026 benefits policy. */
let runtimeGroundingText: string = BENEFITS_DOC;

export function setGroundingText(text: string) {
  runtimeGroundingText = text;
}

export function getGroundingText(): string {
  return runtimeGroundingText;
}

export function getDefaultGroundingText(): string {
  return BENEFITS_DOC;
}

/**
 * Call the selected model. Ollama is the local daemon. OpenAI is any
 * chat-completions endpoint, reached through the dev server so the browser
 * does not call that host itself. The API key is optional.
 */
async function callModel(history: any[], tools: OfferedTool[]) {
  const wireTools = tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));

  const cloud = runtimeProvider === "openai";
  const model = (cloud ? runtimeOpenaiModel : runtimeOllamaModel).trim();
  if (!model) throw new Error("Set the model name.");
  const body: Record<string, unknown> = {
    model,
    messages: history,
    temperature: runtimeTemperature,
    stream: false,
  };
  if (!cloud) body.reasoning_effort = runtimeReasoningEffort;
  if (wireTools.length > 0) body.tools = wireTools;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const base = (cloud ? runtimeOpenaiBase : runtimeOllamaBase).trim();
  if (!base) throw new Error(cloud ? "Set the OpenAI base URL." : "Set the Ollama URL.");
  const url = "/cloud/v1/chat/completions";
  headers["X-Cloud-Base"] = base;
  if (cloud) {
    const key = runtimeApiKey.trim();
    if (key) headers.Authorization = `Bearer ${key}`;
  }

  console.log(`[Harness] Calling ${cloud ? "OpenAI-format" : "Ollama"} (${model}) with ${history.length} messages and ${tools.length} tools`);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    const where = cloud
      ? `Cannot reach ${runtimeOpenaiBase.trim()}.`
      : `Cannot reach Ollama at ${runtimeOllamaBase.trim()}. Start it with \`ollama serve\` and pull \`${model}\`.`;
    throw new Error(`${where} ${detail}`);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${cloud ? "OpenAI" : "Ollama"} ${res.status}: ${text}`);
  }
  const data = await res.json();
  const choice = data.choices?.[0];
  if (!choice?.message) {
    throw new Error(`${cloud ? "OpenAI" : "Ollama"} returned an empty completion.`);
  }
  const raw = JSON.parse(JSON.stringify(choice));
  const sent = JSON.parse(JSON.stringify(body));
  normalizeChoice(choice);
  return { choice, raw, sent };
}

/** Ollama sometimes returns object arguments or omits finish_reason. The loop expects OpenAI chat-completions shape. */
function normalizeChoice(choice: any) {
  if (choice.message.content == null) choice.message.content = "";
  const calls = choice.message.tool_calls;
  if (!Array.isArray(calls) || calls.length === 0) return;
  choice.finish_reason = "tool_calls";
  for (const tc of calls) {
    const args = tc.function?.arguments;
    if (args != null && typeof args !== "string") {
      tc.function.arguments = JSON.stringify(args);
    }
    if (!tc.id) tc.id = `call_${Math.random().toString(36).slice(2, 10)}`;
  }
}

/**
 * Convert a PromptMessage[] to the chat-completions wire format.
 * This is the only place where PromptMessage is translated — all other code
 * works with the higher-level typed representation.
 */
function toWire(msgs: PromptMessage[]): any[] {
  return msgs.map(m => {
    switch (m.source) {
      case 'system':           return { role: 'system', content: m.text };
      case 'chatbot':          return { role: 'system', content: m.text };
      case 'worker':           return { role: 'system', content: m.text };
      case 'summary':          return { role: 'system', content: m.text };
      case 'task':             return { role: 'system', content: m.text };
      case 'memory_user':      return { role: 'user', content: m.text };
      case 'memory_assistant': return { role: 'assistant', content: m.text };
      case 'user':             return { role: 'user', content: m.text };
      case 'assistant':        return { role: 'assistant', content: m.text };
      case 'tool_call':        return { role: 'assistant', content: m.text || '', tool_calls: m.toolCalls };
      case 'tool_response':    return { role: 'tool', tool_call_id: m.toolCallId, content: m.text };
      case 'plan':             return { role: 'system', content: `Plan:\n${m.text}` };
      case 'embedded_tool':   return { role: 'system', content: m.text };
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
/** Which concepts are switched on for this turn. Each one changes what is sent. */
export type RunControls = {
  memory: boolean;
  systemPrompt: boolean;
  loop: boolean;
  /** The chatbot prompt is included in the message. */
  chatbot: boolean;
  /** The embedded tool's description is included in the message. */
  embeddedTool: boolean;
  /** MCP text is available to {{mcp}} while this is on. */
  mcp: boolean;
  /** {{grounding}} inserts the edited document while this is on. */
  grounding: boolean;
  /** Tasks taken from one planner reply. 0 does not stop. */
  maxTasks: number;
  /** Tool rounds inside one task. 0 does not stop. */
  maxToolRounds: number;
  /** Times the summarizer may send the workflow around again. 0 does not stop. */
  maxRetries: number;
};

/** Mode None. The harness forwards the typed text and returns the reply. */
export function isPassthrough(controls: RunControls): boolean {
  return !controls.chatbot && !controls.systemPrompt && !controls.loop;
}

/** The tools/list results from the session-start query. Empty until that query runs. */
let runtimeMcpCatalog = "";

export function setMcpCatalog(value: string) {
  runtimeMcpCatalog = value;
}

/** Notes written on the selected servers. Empty when every note is blank. */
let runtimeMcpHelper = "";

export function setMcpHelper(value: string) {
  runtimeMcpHelper = value;
}

function groundingBlock(controls: RunControls, context: TemplateContext): string {
  if (!controls.grounding) return "";
  const raw = runtimeGroundingText.trim();
  if (!raw) return "";
  return renderTemplate(raw, { ...context, grounding: "" }).trim();
}

function toolBlock(controls: RunControls, context: TemplateContext): string {
  if (!controls.embeddedTool) return "";
  const raw = getEmbeddedToolDescription().trim();
  if (!raw) return "";
  const description = renderTemplate(raw, { ...context, tool: "" }).trim();
  return formatToolPrompt(description);
}

function templateContext(controls: RunControls, userQuery: string, plan: string, task = "", taskHistory = "", retry = "", lastPass = false): TemplateContext {
  const memory = controls.memory ? formatMemoryText(getMemory()) : "";
  const base: TemplateContext = {
    memory,
    mcp: controls.mcp ? runtimeMcpCatalog : "",
    "mcp-helper": controls.mcp ? runtimeMcpHelper : "",
    grounding: "",
    plan,
    task,
    "task-history": taskHistory,
    retry,
    "last-pass": lastPass ? "yes" : "",
    user: userQuery,
    tool: "",
  };
  base.grounding = groundingBlock(controls, base);
  base.tool = toolBlock(controls, base);
  return base;
}

type TaskRecord = { instruction: string; tools: string[]; result: string };

function formatTasks(tasks: TaskRecord[]): string {
  if (!tasks.length) return "";
  return JSON.stringify(tasks, null, 2);
}

function formatTask(task: { instruction: string; tools: string[] }): string {
  return JSON.stringify({ instruction: task.instruction, tools: task.tools }, null, 2);
}

function parseJsonObject(text: string): unknown | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : text).trim();
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

function readRoute(text: string): { route: "chat"; reply: string } | { route: "workflow" } {
  const parsed = parseJsonObject(text);
  if (parsed && typeof parsed === "object" && (parsed as { route?: unknown }).route === "workflow") {
    return { route: "workflow" };
  }
  if (parsed && typeof parsed === "object" && (parsed as { route?: unknown }).route === "chat") {
    const reply = (parsed as { reply?: unknown }).reply;
    if (typeof reply === "string" && reply.trim()) return { route: "chat", reply: reply.trim() };
  }
  return { route: "chat", reply: text.trim() || "(no response)" };
}

function readTasks(text: string, maxTasks: number): { instruction: string; tools: string[] }[] {
  const parsed = parseJsonObject(text);
  const tasks = parsed && typeof parsed === "object" ? (parsed as { tasks?: unknown }).tasks : null;
  if (!Array.isArray(tasks)) return [];
  const parsedTasks = tasks.flatMap((task) => {
    if (!task || typeof task !== "object") return [];
    const instruction = (task as { instruction?: unknown }).instruction;
    if (typeof instruction !== "string" || !instruction.trim()) return [];
    const names = (task as { tools?: unknown }).tools;
    const tools = Array.isArray(names)
      ? names.flatMap((name) => (typeof name === "string" && name.trim() ? [name.trim()] : []))
      : [];
    return [{ instruction: instruction.trim(), tools }];
  });
  return maxTasks > 0 ? parsedTasks.slice(0, maxTasks) : parsedTasks;
}

function readSummary(text: string): { status: "done"; reply: string } | { status: "retry"; reason: string } {
  const parsed = parseJsonObject(text);
  if (parsed && typeof parsed === "object") {
    const status = (parsed as { status?: unknown }).status;
    if (status === "retry") {
      const reason = (parsed as { reason?: unknown }).reason;
      return {
        status: "retry",
        reason: typeof reason === "string" && reason.trim() ? reason.trim() : "The tasks did not achieve the request.",
      };
    }
    if (status === "done") {
      const reply = (parsed as { reply?: unknown }).reply;
      if (typeof reply === "string" && reply.trim()) return { status: "done", reply: reply.trim() };
    }
  }
  return { status: "done", reply: text.trim() || "(no response)" };
}

/** Compile the prompt. Tags are filled from the context. The message list is that prompt. */
function composeCall(raw: string, source: PromptMessage["source"], context: TemplateContext): PromptMessage[] {
  if (!raw.trim()) return [];
  if (hasPromptStructure(raw)) return compilePromptBlocks(raw, context);
  const rendered = renderTemplate(raw, context).trim();
  return rendered ? [{ source, text: rendered }] : [];
}

async function runWorkerTask(prompt: PromptMessage[], offered: OfferedTool[], tools: Tool[], rounds: Round[], maxToolRounds: number): Promise<string> {
  const working = [...prompt];
  for (let loopCount = 0; ; loopCount++) {
    const requestSnapshot = [...working];
    const { choice, raw, sent } = await callModel(toWire(working), offered);
    const toolCalls = choice.message.tool_calls || [];
    const tc = toolCalls[0];
    const capped = maxToolRounds > 0 && loopCount >= maxToolRounds;
    if (choice.finish_reason !== "tool_calls" || !tc || capped) {
      const text = choice.message.content || "(no response)";
      rounds.push({ request: requestSnapshot, finish_reason: "stop", text, step: "task", response: raw, sent });
      return text;
    }

    const toolName = tc.function.name;
    let toolInput: Record<string, unknown>;
    try { toolInput = JSON.parse(tc.function.arguments); }
    catch { toolInput = { raw: tc.function.arguments }; }

    const tool = tools.find((item) => item.name === toolName);
    let toolResult: string;
    if (tool) {
      try { toolResult = await tool.execute(toolInput); }
      catch (err) { toolResult = JSON.stringify({ error: err instanceof Error ? err.message : String(err) }); }
    } else {
      toolResult = JSON.stringify({ error: `Tool "${toolName}" not found` });
    }
    const mcp = tool?.mcpTrace;
    if (tool) delete tool.mcpTrace;

    rounds.push({
      request: requestSnapshot,
      finish_reason: "tool_calls",
      text: choice.message.content || null,
      toolName,
      toolInput,
      toolResult,
      mcp,
      step: "task",
      response: raw,
      sent,
    });
    working.push({ source: "tool_call", text: choice.message.content || "", toolName, toolInput, toolCalls });
    working.push({ source: "tool_response", text: toolResult, toolCallId: tc.id });
  }
  return "(no response)";
}

async function orchestrateChatbot(userQuery: string, controls: RunControls): Promise<Exchange> {
  const rawChatbot = runtimeChatbotPrompt.trim();
  const context = templateContext(controls, userQuery, "");
  const messages = composeCall(rawChatbot, "chatbot", context);
  const { choice, raw, sent } = await callModel(toWire(messages), []);
  const finalAnswer = choice.message.content || "(no response)";
  if (controls.memory) addMemoryEntry(userQuery, finalAnswer);
  return {
    userQuery,
    rounds: [{ request: messages, finish_reason: "stop", text: finalAnswer, response: raw, sent }],
    finalAnswer,
  };
}

async function orchestrateAgent(userQuery: string, tools: Tool[], controls: RunControls): Promise<Exchange> {
  const rawAgent = runtimeSystemPrompt.trim();
  const rawPlanner = runtimePlannerPrompt.trim();
  const rawWorker = runtimeWorkerPrompt.trim();
  const rawSummary = runtimeSummarizerPrompt.trim();
  const rounds: Round[] = [];

  const agentContext = templateContext(controls, userQuery, "");
  const agentRequest = composeCall(rawAgent, "system", agentContext);
  const { choice: agentChoice, raw: agentRaw, sent: agentSent } = await callModel(toWire(agentRequest), []);
  const agentText = agentChoice.message.content || "";
  rounds.push({ request: agentRequest, finish_reason: "stop", text: agentText, step: "agent", response: agentRaw, sent: agentSent });
  const decision = readRoute(agentText);
  if (decision.route === "chat") {
    if (controls.memory) addMemoryEntry(userQuery, decision.reply);
    return { userQuery, rounds, finalAnswer: decision.reply };
  }

  const done: TaskRecord[] = [];
  let retryReason = "";
  let retriesUsed = 0;
  let finalAnswer = "(no response)";

  for (;;) {
    const priorText = formatTasks(done);
    const planContext = templateContext(controls, userQuery, "", "", priorText, retryReason);
    const planRequest = composeCall(rawPlanner, "system", planContext);
    const { choice: planChoice, raw: planRaw, sent: planSent } = await callModel(toWire(planRequest), []);
    const planText = planChoice.message.content || "";
    rounds.push({ request: planRequest, finish_reason: "stop", text: planText, step: "plan", response: planRaw, sent: planSent });
    const tasks = readTasks(planText, controls.maxTasks);

    for (const task of tasks) {
      const prior = formatTasks(done);
      const current = formatTask(task);
      const workerContext = templateContext(controls, userQuery, "", current, prior);
      const lifted = liftSection(rawWorker, "tools");
      const workerRequest = composeCall(lifted.rest, "worker", workerContext);
      const offered = lifted.body ? offeredTools(renderTemplate(lifted.body, workerContext)) : [];
      const result = await runWorkerTask(workerRequest, offered, tools, rounds, controls.maxToolRounds);
      done.push({ instruction: task.instruction, tools: task.tools, result });
    }

    const taskText = formatTasks(done);
    const lastPass = controls.maxRetries > 0 && retriesUsed >= controls.maxRetries;
    const summaryContext = templateContext(controls, userQuery, planText, "", taskText, "", lastPass);
    const summaryRequest = composeCall(rawSummary, "summary", summaryContext);
    const { choice: summaryChoice, raw: summaryRaw, sent: summarySent } = await callModel(toWire(summaryRequest), []);
    const summaryText = summaryChoice.message.content || "";
    rounds.push({ request: summaryRequest, finish_reason: "stop", text: summaryText, step: "summary", response: summaryRaw, sent: summarySent });
    const verdict = readSummary(summaryText);
    if (verdict.status === "done" || lastPass) {
      finalAnswer = verdict.status === "done" ? verdict.reply : verdict.reason;
      break;
    }
    retryReason = verdict.reason;
    retriesUsed++;
  }

  if (controls.memory) addMemoryEntry(userQuery, finalAnswer);
  return { userQuery, rounds, finalAnswer };
}

export async function orchestrate(
  userQuery: string,
  tools: Tool[],
  controls: RunControls,
): Promise<Exchange> {
  if (isPassthrough(controls)) return sendMessage(userQuery);
  if (controls.loop) return orchestrateAgent(userQuery, tools, controls);
  return orchestrateChatbot(userQuery, controls);
}

/**
 * Direct single-turn call used for mode None.
 * The typed text is the only message. Nothing else is added, and the turn is not stored.
 */
export async function sendMessage(userMessage: string): Promise<Exchange> {
  const prompt: PromptMessage[] = [{ source: 'user', text: userMessage }];
  const { choice, raw, sent } = await callModel(toWire(prompt), []);
  const finalAnswer = choice.message.content || '(no response)';
  return {
    userQuery: userMessage,
    rounds: [{ request: prompt, finish_reason: 'stop', text: finalAnswer, response: raw, sent }],
    finalAnswer,
  };
}

/**
 * Export for testing/debugging
 */
export { callModel };
