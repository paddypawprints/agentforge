import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { createRetirementServer, createSalaryServer } from "./hrServers";
import { Tool, ToolInputSchema } from "./tools";

/** A public server. The browser POSTs JSON-RPC to that URL. */
export const MCP_HTTP = "Streamable HTTP";
/** Salary and retirement. The client and the server share the page. */
export const MCP_PAGE = "in the page";

const PAGE_SERVERS: Record<string, () => ReturnType<typeof createSalaryServer>> = {
  "/mcp/salary": createSalaryServer,
  "/mcp/retirement": createRetirementServer,
};

/** How this server is reached. Built-ins stay in the page. Anything else is HTTP. */
export function mcpTransport(url: string): string {
  const path = url.trim().split("?")[0];
  return PAGE_SERVERS[path] ? MCP_PAGE : MCP_HTTP;
}

export type McpEndpoint = {
  id: string;
  name: string;
  /** A same-origin path, or an https URL for a public server. */
  url: string;
  token: string;
  /** Local note for this server. It is not part of the server's own catalog. */
  helper: string;
};

export type McpQuery = {
  id: string;
  server: string;
  transport: string;
  request: string;
  result: unknown;
};

export type McpDiscovery = {
  queries: McpQuery[];
  tools: Tool[];
  /** The {{mcp}} text: each server's transport and its tools, keyed by server name. */
  catalog: string;
};

type ListedTool = {
  name: string;
  description?: string;
  inputSchema?: { type?: string; properties?: Record<string, unknown>; required?: unknown };
};

type OpenSession = {
  id: string;
  client: Client;
  transport: string;
};

let open: OpenSession[] = [];
let inflight: Client[] = [];
let generation = 0;
let closing: Promise<void> = Promise.resolve();

async function closeClients(clients: Client[]) {
  await Promise.all(clients.map((client) => client.close().catch(() => undefined)));
}

/** Drop every open MCP connection. A newer discovery waits until these are gone. */
function retire(): Promise<void> {
  const clients = [...inflight, ...open.map((session) => session.client)];
  inflight = [];
  open = [];
  closing = closing.then(() => closeClients(clients)).then(() => undefined);
  return closing;
}

/** Stop the session-start query. The next discovery opens fresh connections. */
export function retireMcp() {
  generation += 1;
  void retire();
}

function prettyBody(body: string): string {
  try { return JSON.stringify(JSON.parse(body), null, 2); }
  catch { return body; }
}

function endpointOf(server: McpEndpoint): { url: URL; headers: Record<string, string> } {
  const headers: Record<string, string> = {};
  const token = server.token.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (server.url.startsWith("/")) return { url: new URL(server.url, window.location.origin), headers };
  headers["X-Mcp-Url"] = server.url.trim();
  return { url: new URL("/mcp/remote", window.location.origin), headers };
}

function catalogEntry(transport: string, result: unknown, tools: Tool[]) {
  if (result && typeof result === "object" && "error" in result) {
    return { transport, error: (result as { error: unknown }).error };
  }
  return {
    transport,
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: {
        type: tool.inputSchema.type,
        properties: tool.inputSchema.properties,
        required: tool.inputSchema.required,
      },
    })),
  };
}

function schemaOf(tool: ListedTool): ToolInputSchema {
  const required = Array.isArray(tool.inputSchema?.required)
    ? tool.inputSchema.required.filter((name): name is string => typeof name === "string")
    : [];
  return {
    type: "object",
    properties: tool.inputSchema?.properties ?? {},
    required,
  };
}

function textOf(result: unknown): string {
  const content = result && typeof result === "object" ? (result as { content?: unknown }).content : undefined;
  if (Array.isArray(content)) {
    const lines = content.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const text = (item as { type?: unknown; text?: unknown }).text;
      return (item as { type?: unknown }).type === "text" && typeof text === "string" ? [text] : [];
    });
    if (lines.length) return lines.join("\n");
  }
  return JSON.stringify(result);
}

function expose(taken: Set<string>, serverName: string, toolName: string): string {
  const slug = serverName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "mcp";
  let name = taken.has(toolName) ? `${slug}_${toolName}` : toolName;
  while (taken.has(name)) name = `${slug}_${name}`;
  taken.add(name);
  return name;
}

function oneOrAll(messages: unknown[]): unknown {
  return messages.length === 1 ? messages[0] : messages;
}

function makeTool(sessionId: string, serverName: string, transportName: string, protocolName: string, exposed: string, description: string, inputSchema: ToolInputSchema, sent: string[], received: string[]): Tool {
  const tool: Tool = {
    name: exposed,
    description,
    inputSchema,
    execute: async (input) => {
      const session = open.find((item) => item.id === sessionId);
      const params = { name: protocolName, arguments: input };
      const sentAt = sent.length;
      const receivedAt = received.length;
      const requestOf = () => {
        const outbound = sent.slice(sentAt).map(parseBody);
        return outbound.length ? oneOrAll(outbound) : { method: "tools/call", params };
      };
      if (!session) {
        const response = { error: `MCP server ${serverName} is not connected.` };
        tool.mcpTrace = { server: serverName, transport: transportName, request: requestOf(), response };
        return JSON.stringify(response);
      }
      try {
        const response = await session.client.callTool(params);
        const inbound = received.slice(receivedAt).map(parseBody);
        tool.mcpTrace = {
          server: serverName,
          transport: session.transport,
          request: requestOf(),
          response: inbound.length ? oneOrAll(inbound) : response,
        };
        return textOf(response);
      } catch (err) {
        const inbound = received.slice(receivedAt).map(parseBody);
        const response = inbound.length ? oneOrAll(inbound) : { error: err instanceof Error ? err.message : String(err) };
        tool.mcpTrace = { server: serverName, transport: session.transport, request: requestOf(), response };
        return JSON.stringify(response);
      }
    },
  };
  return tool;
}

function parseBody(body: string): unknown {
  try { return JSON.parse(body); }
  catch { return body; }
}

/** Record every JSON-RPC message this transport sends or receives. */
function traceTransport(transport: Transport, sent: string[], received: string[]) {
  const send = transport.send.bind(transport);
  transport.send = (message, options) => {
    try { sent.push(JSON.stringify(message)); }
    catch { sent.push(String(message)); }
    return send(message, options);
  };
  let handler = transport.onmessage;
  Object.defineProperty(transport, "onmessage", {
    configurable: true,
    enumerable: true,
    get() { return handler; },
    set(next) {
      handler = (message, extra) => {
        try { received.push(JSON.stringify(message)); }
        catch { received.push(String(message)); }
        next?.(message, extra);
      };
    },
  });
}

async function openTransport(server: McpEndpoint, sent: string[], received: string[]): Promise<{ transport: Transport; name: string }> {
  const path = server.url.trim().split("?")[0];
  const create = PAGE_SERVERS[path];
  if (create) {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    traceTransport(clientTransport, sent, received);
    await create().connect(serverTransport);
    return { transport: clientTransport, name: MCP_PAGE };
  }
  const { url, headers } = endpointOf(server);
  const transport = new StreamableHTTPClientTransport(url, { requestInit: { headers } });
  traceTransport(transport, sent, received);
  return { transport, name: MCP_HTTP };
}

async function queryOne(server: McpEndpoint, key: string, taken: Set<string>, mine: number): Promise<{ query: McpQuery; tools: Tool[]; client: Client | null; transport: string }> {
  const sent: string[] = [];
  const received: string[] = [];
  const opened = await openTransport(server, sent, received);
  const client = new Client({ name: "agentforge-harness", version: "1.0.0" });
  inflight.push(client);
  try {
    if (mine !== generation) throw new Error("MCP discovery was replaced.");
    await client.connect(opened.transport);
    if (mine !== generation) throw new Error("MCP discovery was replaced.");
    const listed = await client.listTools();
    const tools = (listed.tools as ListedTool[]).map((item) => makeTool(
      server.id,
      key,
      opened.name,
      item.name,
      expose(taken, key, item.name),
      item.description || item.name,
      schemaOf(item),
      sent,
      received,
    ));
    const live = mine === generation;
    if (!live) {
      await client.close().catch(() => undefined);
      inflight = inflight.filter((item) => item !== client);
    }
    return {
      client: live ? client : null,
      query: {
        id: server.id,
        server: key,
        transport: opened.name,
        request: sent.map(prettyBody).filter(Boolean).join("\n\n"),
        result: received.length ? received.map(parseBody) : JSON.parse(JSON.stringify(listed)),
      },
      tools,
      transport: opened.name,
    };
  } catch (err) {
    await client.close().catch(() => undefined);
    inflight = inflight.filter((item) => item !== client);
    return {
      client: null,
      transport: opened.name,
      query: {
        id: server.id,
        server: key,
        transport: opened.name,
        request: sent.map(prettyBody).filter(Boolean).join("\n\n"),
        result: received.length
          ? { messages: received.map(parseBody), error: err instanceof Error ? err.message : String(err) }
          : { error: err instanceof Error ? err.message : String(err) },
      },
      tools: [],
    };
  }
}

/** initialize, then tools/list, for every selected server. Later tools/call uses the same sessions. */
export async function discoverMcp(servers: McpEndpoint[]): Promise<McpDiscovery> {
  const mine = ++generation;
  await retire();
  if (mine !== generation) return { queries: [], tools: [], catalog: "" };
  const queries: McpQuery[] = [];
  const tools: Tool[] = [];
  const catalog: Record<string, unknown> = {};
  const keys = new Set<string>();
  const taken = new Set<string>(["benefits_lookup"]);
  const kept: OpenSession[] = [];
  for (const server of servers) {
    if (mine !== generation) break;
    let key = server.name.trim() || server.id;
    let n = 2;
    while (keys.has(key)) key = `${server.name.trim() || server.id} ${n++}`;
    keys.add(key);
    const found = await queryOne(server, key, taken, mine);
    if (found.client) kept.push({ id: server.id, client: found.client, transport: found.transport });
    if (mine !== generation) break;
    queries.push(found.query);
    tools.push(...found.tools);
    catalog[key] = catalogEntry(found.transport, found.query.result, found.tools);
  }
  if (mine !== generation) {
    await closeClients(kept.map((session) => session.client));
    return { queries: [], tools: [], catalog: "" };
  }
  for (const session of kept) inflight = inflight.filter((client) => client !== session.client);
  open = kept;
  return { queries, tools, catalog: JSON.stringify(catalog, null, 2) };
}
