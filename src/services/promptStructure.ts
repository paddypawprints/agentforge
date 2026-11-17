import { PromptMessage } from "../types/agent";
import { renderTemplate, TemplateContext } from "./templates";

function roleBlock(role: string, content: string): string {
  return `\n${JSON.stringify({ role, content }, null, 2)}\n\n`;
}

/** A prompt made of JSON roles, with a blank line between them. */
export function promptFromRoles(roles: { role: string; content: string }[]): string {
  return roles.map(({ role, content }) => JSON.stringify({ role, content }, null, 2)).join("\n\n");
}

/** A JSON role kept only when the tag has text. {{tag}} inside the content inserts that text. */
export function optionalRole(tag: string, role: string, content: string): string {
  return `{{#${tag}}}\n${JSON.stringify({ role, content }, null, 2)}\n{{/${tag}}}`;
}

/** Join prompt pieces, including optional roles, with a blank line between them. */
export function joinPrompt(parts: string[]): string {
  return parts.filter((part) => part.trim()).join("\n\n");
}

/** Each button inserts one JSON role, with a blank line around it. */
export const PROMPT_BLOCKS: { id: string; label: string; template: string }[] = [
  { id: "system", label: "SYSTEM", template: roleBlock("system", "") },
  { id: "user", label: "USER", template: `\n${optionalRole("user", "user", "{{user}}")}\n\n` },
  { id: "assistant", label: "ASSISTANT", template: roleBlock("assistant", "") },
  { id: "memory", label: "MEMORY", template: `\n${optionalRole("memory", "memory", "{{memory}}")}\n\n` },
  { id: "tool", label: "TOOL", template: `\n${optionalRole("tool", "tool", "This is the embedded tool.\n{{tool}}")}\n\n` },
];

/** True when the prompt is a list of JSON role objects. */
export function hasPromptStructure(source: string): boolean {
  return /"role"\s*:/.test(source);
}

export function ownsRole(source: string, role: string): boolean {
  return new RegExp(`"role"\\s*:\\s*"${role}"`).test(source);
}

function isTurn(value: unknown): value is { user: string; assistant: string } {
  if (!value || typeof value !== "object") return false;
  const turn = value as { user?: unknown; assistant?: unknown };
  return typeof turn.user === "string" && typeof turn.assistant === "string";
}

/** Memory content is the JSON turns. Those become user and assistant messages. */
function compileMemory(body: string): PromptMessage[] {
  const trimmed = body.trim();
  if (!trimmed || trimmed === "[]" || trimmed === "{}") return [];
  try {
    const parsed = JSON.parse(trimmed);
    const turns = Array.isArray(parsed) ? parsed : [parsed];
    if (turns.length > 0 && turns.every(isTurn)) {
      return turns.flatMap((turn) => [
        { source: "memory_user" as const, text: turn.user },
        { source: "memory_assistant" as const, text: turn.assistant },
      ]);
    }
  } catch {
    /* The content is not the memory JSON, so it stays as text. */
  }
  return trimmed ? [{ source: "system", text: trimmed }] : [];
}

function matchingBrace(source: string, open: number): number {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === "\"") inString = false;
      continue;
    }
    if (ch === "\"") inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function fromRole(role: string, content: string): PromptMessage[] {
  switch (role) {
    case "memory":
      return compileMemory(content);
    case "user":
      return content ? [{ source: "user", text: content }] : [];
    case "assistant":
      return content ? [{ source: "assistant", text: content }] : [];
    case "tool":
      return content ? [{ source: "embedded_tool", text: content }] : [];
    default:
      return content ? [{ source: "system", text: content }] : [];
  }
}

export type OfferedTool = {
  name: string;
  description: string;
  inputSchema: { type: string; properties: Record<string, unknown>; required: string[] };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function asTool(value: unknown): OfferedTool | null {
  if (!isRecord(value) || typeof value.name !== "string" || !value.name.trim()) return null;
  if (typeof value.description !== "string" || !isRecord(value.parameters)) return null;
  const required = Array.isArray(value.parameters.required)
    ? value.parameters.required.filter((item): item is string => typeof item === "string")
    : [];
  const properties = isRecord(value.parameters.properties) ? value.parameters.properties : {};
  return {
    name: value.name,
    description: value.description,
    inputSchema: { type: "object", properties, required },
  };
}

function collectSchemas(value: unknown, schemas: Map<string, OfferedTool>) {
  const tool = asTool(value);
  if (tool) {
    schemas.set(tool.name, tool);
    return;
  }
  if (!isRecord(value)) return;
  for (const entry of Object.values(value)) {
    if (!isRecord(entry) || !Array.isArray(entry.tools)) continue;
    for (const item of entry.tools) {
      const listed = asTool(item);
      if (listed) schemas.set(listed.name, listed);
    }
  }
}

function taskNames(value: unknown): string[] {
  if (!isRecord(value) || typeof value.instruction !== "string" || !Array.isArray(value.tools)) return [];
  if (!value.tools.every((item) => typeof item === "string")) return [];
  return value.tools;
}

function jsonValues(source: string): unknown[] {
  const values: unknown[] = [];
  for (let i = 0; i < source.length; i++) {
    if (source[i] !== "{") continue;
    const end = matchingBrace(source, i);
    if (end === -1) break;
    try {
      values.push(JSON.parse(source.slice(i, end + 1)));
      i = end;
    } catch {
      /* The next brace may start a value. */
    }
  }
  return values;
}

/** The tools array for a {{#tools}} section: task names matched to MCP and embedded-tool schemas. */
export function offeredTools(rendered: string): OfferedTool[] {
  const schemas = new Map<string, OfferedTool>();
  const names: string[] = [];
  for (const value of jsonValues(rendered)) {
    collectSchemas(value, schemas);
    names.push(...taskNames(value));
  }
  const seen = new Set<string>();
  const tools: OfferedTool[] = [];
  for (const name of names) {
    if (seen.has(name)) continue;
    const schema = schemas.get(name);
    if (!schema) continue;
    seen.add(name);
    tools.push(schema);
  }
  return tools;
}

function escapeJsonString(value: string): string {
  return JSON.stringify(value).slice(1, -1);
}

/**
 * Turn JSON role objects into messages, in the order they are written.
 * Tags inside a role are filled here so quotes in the inserted text stay valid JSON.
 */
export function compilePromptBlocks(source: string, context: TemplateContext): PromptMessage[] {
  const escaped: TemplateContext = {};
  for (const [key, value] of Object.entries(context)) escaped[key] = escapeJsonString(value);
  const rendered = renderTemplate(source, escaped);
  const messages: PromptMessage[] = [];
  let cursor = 0;
  for (let i = 0; i < rendered.length; i++) {
    if (rendered[i] !== "{") continue;
    const end = matchingBrace(rendered, i);
    if (end === -1) break;
    const between = rendered.slice(cursor, i).replace(/[\[\],\s]/g, "");
    if (between) messages.push({ source: "system", text: rendered.slice(cursor, i).trim() });
    try {
      const parsed = JSON.parse(rendered.slice(i, end + 1)) as { role?: unknown; content?: unknown };
      if (parsed && typeof parsed.role === "string") {
        const content = typeof parsed.content === "string" ? parsed.content : "";
        messages.push(...fromRole(parsed.role, content));
        cursor = end + 1;
        i = end;
      }
    } catch {
      /* Leave text that is not a role object where it is. */
    }
  }
  const after = rendered.slice(cursor).replace(/[\[\],\s]/g, "");
  if (after) messages.push({ source: "system", text: rendered.slice(cursor).trim() });
  return messages;
}
