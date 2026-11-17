/**
 * Mustache-style tags for prompts.
 *
 * {{tag}} and {{{tag}}} insert the text as-is. This is a prompt, not HTML.
 * {{#tag}}...{{/tag}} keeps the block when the tag has text.
 * {{^tag}}...{{/tag}} keeps the block when the tag is empty.
 * A tag this file does not know is left in place, so a typo stays visible.
 */

export type TemplateContext = Record<string, string>;

export const TEMPLATE_GUIDE: { tag: string; inserts: string; empty: string }[] = [
  {
    tag: "memory",
    inserts: "The stored turns as JSON, oldest first.",
    empty: "Memory is off, or nothing is stored.",
  },
  {
    tag: "tool",
    inserts: "The embedded tool prompt as JSON.",
    empty: "The embedded tool is off, or the description is blank.",
  },
  {
    tag: "mcp",
    inserts: "The tools from the session-start MCP query: name, description, and parameters, with the transport.",
    empty: "MCP is off, or the harness has not queried a server yet.",
  },
  {
    tag: "mcp-helper",
    inserts: "The local notes written on the selected MCP servers, keyed by server name.",
    empty: "MCP is off, or every selected server's note is blank.",
  },
  {
    tag: "grounding",
    inserts: "The 2026 benefits policy.",
    empty: "Grounding is off, or the text is blank.",
  },
  {
    tag: "plan",
    inserts: "The plan written by the planning step.",
    empty: "There is no plan yet. The planning call itself has none.",
  },
  {
    tag: "task",
    inserts: "The planner step for this call, as JSON: instruction and tools.",
    empty: "This call is not carrying out a step.",
  },
  {
    tag: "task-history",
    inserts: "The finished workflow steps as JSON, oldest first. Each one has its instruction, tool names, and result.",
    empty: "No step has finished yet.",
  },
  {
    tag: "retry",
    inserts: "Why the previous steps did not achieve the request.",
    empty: "This is the first plan, or the previous steps were accepted.",
  },
  {
    tag: "last-pass",
    inserts: "Present on the summarizer's last pass.",
    empty: "A retry is still allowed.",
  },
  {
    tag: "user",
    inserts: "The message just sent.",
    empty: "The message is empty.",
  },
];

/** True when the template inserts this tag's text, so the caller should not add it again. */
export function includesTag(source: string, tag: string): boolean {
  return new RegExp(`\\{\\{\\{?\\s*${tag}\\s*\\}\\}\\}?`).test(source);
}

type Token =
  | { kind: "text"; text: string }
  | { kind: "var"; name: string }
  | { kind: "section"; name: string; inverted: boolean; body: string };

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const open = source.indexOf("{{", i);
    if (open === -1) {
      tokens.push({ kind: "text", text: source.slice(i) });
      break;
    }
    if (open > i) tokens.push({ kind: "text", text: source.slice(i, open) });
    const triple = source.startsWith("{{{", open);
    const closeMark = triple ? "}}}" : "}}";
    const close = source.indexOf(closeMark, open + 2);
    if (close === -1) {
      tokens.push({ kind: "text", text: source.slice(open) });
      break;
    }
    const raw = source.slice(open + (triple ? 3 : 2), close).trim();
    const after = close + closeMark.length;
    if (raw.startsWith("#") || raw.startsWith("^")) {
      const name = raw.slice(1).trim();
      const end = findSectionEnd(source, after, name);
      if (!end) {
        tokens.push({ kind: "text", text: source.slice(open, after) });
        i = after;
        continue;
      }
      tokens.push({
        kind: "section",
        name,
        inverted: raw.startsWith("^"),
        body: source.slice(after, end.bodyEnd),
      });
      i = end.after;
      continue;
    }
    if (raw.startsWith("/")) {
      tokens.push({ kind: "text", text: source.slice(open, after) });
      i = after;
      continue;
    }
    tokens.push({ kind: "var", name: raw });
    i = after;
  }
  return tokens;
}

function findSectionEnd(source: string, from: number, name: string): { bodyEnd: number; after: number } | null {
  let depth = 1;
  let i = from;
  while (i < source.length) {
    const open = source.indexOf("{{", i);
    if (open === -1) return null;
    const triple = source.startsWith("{{{", open);
    const closeMark = triple ? "}}}" : "}}";
    const close = source.indexOf(closeMark, open + 2);
    if (close === -1) return null;
    const raw = source.slice(open + (triple ? 3 : 2), close).trim();
    const after = close + closeMark.length;
    if ((raw.startsWith("#") || raw.startsWith("^")) && raw.slice(1).trim() === name) depth++;
    if (raw.startsWith("/") && raw.slice(1).trim() === name) {
      depth--;
      if (depth === 0) return { bodyEnd: open, after };
    }
    i = after;
  }
  return null;
}

/** Remove one section from a prompt and return its body. The body is still a template. */
export function liftSection(source: string, name: string): { rest: string; body: string | null } {
  const match = new RegExp(`\\{\\{#\\s*${name}\\s*\\}\\}`).exec(source);
  if (!match) return { rest: source, body: null };
  const from = match.index + match[0].length;
  const end = findSectionEnd(source, from, name);
  if (!end) return { rest: source, body: null };
  return { rest: source.slice(0, match.index) + source.slice(end.after), body: source.slice(from, end.bodyEnd) };
}

export function renderTemplate(source: string, context: TemplateContext): string {
  return tokenize(source).map((token) => {
    if (token.kind === "text") return token.text;
    if (token.kind === "var") {
      if (!Object.prototype.hasOwnProperty.call(context, token.name)) return `{{${token.name}}}`;
      return context[token.name] ?? "";
    }
    const present = Boolean(context[token.name]?.trim());
    const known = Object.prototype.hasOwnProperty.call(context, token.name);
    if (!known) return token.inverted ? `{{^${token.name}}}${token.body}{{/${token.name}}}` : `{{#${token.name}}}${token.body}{{/${token.name}}}`;
    if (token.inverted ? !present : present) return renderTemplate(token.body, context);
    return "";
  }).join("");
}
