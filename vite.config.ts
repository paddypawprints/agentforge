import { defineConfig, type Connect } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { mcpServers } from './server/hrMcp'

// Proxy target must match llmConfig.host in src/config.ts.
const ollamaProxy = {
  '/ollama': {
    target: 'http://127.0.0.1:11434',
    changeOrigin: true,
    rewrite: (requestPath: string) => requestPath.replace(/^\/ollama/, ''),
  },
}

function completionsUrl(base: string): URL | null {
  let parsed: URL;
  try {
    parsed = new URL(base.trim());
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  const local = host === "localhost" || host === "127.0.0.1";
  if (host === "169.254.169.254" || host === "metadata.google.internal") return null;
  if (parsed.protocol === "http:" && !local) return null;
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  if (parsed.username || parsed.password) return null;
  const root = parsed.href.endsWith("/") ? parsed.href : `${parsed.href}/`;
  return new URL("chat/completions", root);
}

function readBody(req: Connect.IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

/** Forwards an OpenAI-format chat call. The API key stays on the request. */
function cloudProxy() {
  const handler: Connect.NextHandleFunction = async (req, res, next) => {
    const pathOnly = (req.url || "").split("?")[0];
    if (pathOnly !== "/cloud/v1/chat/completions") {
      next();
      return;
    }
    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end("POST only");
      return;
    }
    const base = req.headers["x-cloud-base"];
    const target = typeof base === "string" ? completionsUrl(base) : null;
    if (!target) {
      res.statusCode = 400;
      res.end("Set an https base URL. http is only allowed for localhost.");
      return;
    }
    const controller = new AbortController();
    let settled = false;
    const cancel = () => { if (!settled) controller.abort(); };
    res.on("close", cancel);
    try {
      const body = await readBody(req);
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      const authorization = req.headers.authorization;
      if (typeof authorization === "string" && authorization.trim()) headers.Authorization = authorization;
      const upstream = await fetch(target, { method: "POST", headers, body, signal: controller.signal });
      const text = await upstream.text();
      settled = true;
      if (res.destroyed) return;
      res.statusCode = upstream.status;
      res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
      res.end(text);
    } catch (err) {
      settled = true;
      if (res.destroyed) return;
      if (controller.signal.aborted) {
        res.statusCode = 499;
        res.end("The request was cancelled.");
        return;
      }
      res.statusCode = 502;
      res.end(err instanceof Error ? err.message : String(err));
    }
  };
  const attach = (server: { middlewares: Connect.Server }) => {
    server.middlewares.use(handler);
  };
  return {
    name: "openai-format-proxy",
    configureServer: attach,
    configurePreviewServer: attach,
  };
}

export default defineConfig({
  base: '/agentforge/',
  plugins: [react(), cloudProxy(), mcpServers()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: false,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: ollamaProxy,
  },
  preview: {
    proxy: ollamaProxy,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
  },
})
