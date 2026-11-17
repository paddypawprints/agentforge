import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect } from "vite";

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function header(req: IncomingMessage, name: string): string {
  const value = req.headers[name];
  return typeof value === "string" ? value : "";
}

/** https, or http only for localhost. Rejects metadata hosts and userinfo. */
export function mcpTarget(value: string): URL | null {
  let parsed: URL;
  try { parsed = new URL(value.trim()); }
  catch { return null; }
  const host = parsed.hostname.toLowerCase();
  const local = host === "localhost" || host === "127.0.0.1";
  if (host === "169.254.169.254" || host === "metadata.google.internal") return null;
  if (parsed.protocol === "http:" && !local) return null;
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  if (parsed.username || parsed.password) return null;
  return parsed;
}

async function proxyRemote(req: IncomingMessage, res: ServerResponse) {
  const target = mcpTarget(header(req, "x-mcp-url"));
  if (!target) {
    res.statusCode = 400;
    res.end("Set an https MCP URL. http is only allowed for localhost.");
    return;
  }
  if (req.method !== "POST" && req.method !== "GET" && req.method !== "DELETE") {
    res.statusCode = 405;
    res.end("POST, GET, or DELETE");
    return;
  }
  try {
    const body = req.method === "GET" || req.method === "DELETE" ? undefined : await readBody(req);
    const headers: Record<string, string> = {};
    for (const name of ["accept", "content-type", "mcp-session-id", "mcp-protocol-version", "last-event-id", "authorization"]) {
      const value = header(req, name);
      if (value) headers[name] = value;
    }
    const upstream = await fetch(target, { method: req.method, headers, body });
    const text = await upstream.text();
    res.statusCode = upstream.status;
    for (const name of ["content-type", "mcp-session-id", "mcp-protocol-version"]) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    res.end(text);
  } catch (err) {
    res.statusCode = 502;
    res.end(err instanceof Error ? err.message : String(err));
  }
}

/** Proxy for a public MCP URL. Salary and retirement run in the page. */
export function mcpServers() {
  const handler: Connect.NextHandleFunction = async (req, res, next) => {
    const path = (req.url || "").split("?")[0];
    if (path === "/mcp/remote") return proxyRemote(req, res);
    next();
  };
  const attach = (server: { middlewares: Connect.Server }) => {
    server.middlewares.use(handler);
  };
  return {
    name: "mcp-servers",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}
