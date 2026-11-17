# Agentforge

A live workshop for people who already use chatbots and want to see the software around the model. The page shows every message the harness sends and every tool result that comes back.

Live sandbox: **https://paddypawprints.github.io/agentforge/**

Source: **https://github.com/paddypawprints/agentforge**

The demonstration script is [demo.md](demo.md).

---

## What the system is

A model call is one HTTP request. The model returns text. It does not remember the last call, and it does not run tools.

The harness is the application code that builds that request from the prompts on screen, calls the model, runs a tool when the model asks for one, and shows the exchange in the trace.

Four ideas sit on top of that:

**Model.** Text in, text out. Ollama is the local daemon. An OpenAI-format host is the other choice. Both go through the dev server.

**Memory.** Stored turns. The harness sends them again on the next call when the prompt contains `{{memory}}`. Memory keeps the employee’s message and the reply they were shown. It does not keep tool results.

**Grounding.** A document inserted by `{{grounding}}` while that switch is on. It starts as the 2026 benefits policy.

**Tools.** The embedded tool `benefits_lookup` is a function in the page. Salary and retirement are MCP servers in the page. A public MCP server is an https URL, reached with Streamable HTTP while the dev server is running. The model asks for a tool by name. The harness runs it.

Agent mode is a workflow, not one prompt:

1. The agent answers directly, or chooses a workflow.
2. The planner returns a list of tasks. Each task is an instruction and the tool names that step may use.
3. The worker carries out one task. `{{#tools}}` on the worker prompt is the tools array for that call: names from `{{task}}`, schemas from `{{mcp}}` and `{{tool}}`.
4. The summarizer writes the reply, or asks for another pass.

The harness fills the tags in the prompt. It does not add messages of its own.

---

## Run it

```bash
git clone https://github.com/paddypawprints/agentforge.git
cd agentforge
npm install
npm run dev
```

Open `http://localhost:3000/agentforge/`.

[Install Ollama](https://ollama.com/download) and leave it running, then pull the model on the card. The card starts from [`src/config.ts`](src/config.ts):

```bash
ollama pull qwen3.5:9b
```

Set reasoning effort to **none** for that model. Low, medium, and high turn thinking on, and the call can sit there.

The model name, the Ollama URL, and the OpenAI base URL are editable on the model card. An OpenAI key is optional and is shown as a password. The key is a header. It is not copied into the trace.

GitHub Pages serves the static build only. That build has no dev server, so it cannot reach Ollama and it cannot proxy a public MCP URL. Salary and retirement still run in the page. Use `npm run dev` for the demonstration.

---

## The screen

Two columns.

**Concepts**, on the left:

| Card | What it controls |
|---|---|
| Architecture | A diagram of the loop. No switch. |
| Data | The benefits, salary, and retirement tables the tools read. |
| Model | Ollama or OpenAI, model name, base URL, temperature, and reasoning effort. |
| Mode | None, Chatbot, or Agent Loop. |
| Memory | Stored turns. On by default. |
| Grounding | The policy document. Off by default. |
| Embedded tool | `benefits_lookup`. Off by default. The sandbox runs it by hand. |
| MCP | Salary and retirement in the page, plus any public server. Off by default. |
| Templates | The tags a prompt can use. |

**Session**, on the right: the composer, the inspector, and the hop list. **NEW SESSION** clears the trace and memory, then queries the selected MCP servers again. **EXPORT SESSION** copies the whole trace as JSON.

A hop body is the whole payload. A model call is the JSON that was posted. A model reply is the choice object. An MCP hop is the JSON-RPC messages.

---

## Prompts

Chatbot, agent, planner, worker, and summarizer are editable JSON roles. A section such as `{{#mcp}}` … `{{/mcp}}` wraps a whole role. The role is omitted when that tag is empty.

| Tag | Inserts |
|---|---|
| `{{user}}` | The message just sent. |
| `{{memory}}` | Stored turns, oldest first. The memory role content stays exactly `{{memory}}`. |
| `{{grounding}}` | The policy document, when grounding is on. |
| `{{tool}}` | The embedded tool as JSON, when that switch is on. |
| `{{mcp}}` | The session-start catalog: name, description, and parameters, keyed by server name, with the transport. |
| `{{mcp-helper}}` | The helper note typed on each selected server, keyed by the same server name. Blank notes are left out. |
| `{{task}}` | The current planner step: `{ "instruction", "tools" }`. |
| `{{task-history}}` | Finished steps in this workflow, including each result. |
| `{{retry}}` | Why the previous steps were not accepted. |
| `{{last-pass}}` | Present on the summarizer’s last pass. |
| `{{plan}}` | The plan text. |

`{{#tools}}` on the worker is not a message. It builds the tools array for that call.

The helper is local. It does not change the catalog the server returned. `{{mcp}}` and `{{mcp-helper}}` share the server’s NAME, so a note under `retirement-buddy` lines up with the `retirement-buddy` entry in the catalog.

---

## MCP and the tables

At session start, and when MCP is turned on or a server is added or removed, the harness sends `initialize`, then `tools/list`, to each selected server.

| Server | Where it runs | Tools |
|---|---|---|
| salary | In the page | `employee_lookup` returns only an employee id. `salary_lookup` returns base pay, bonus percent, and band. |
| retirement | In the page | `retirement_lookup` returns current age, plan, contribution, match, and vested balance. |
| A public server | Streamable HTTP through the dev server | Whatever that server lists. |

Employees are EMP001–EMP004: Alice Johnson, Bob Smith, Carol Davis, David Wilson. Bob is EMP002, age 34, base pay 98000, bonus 8%, band L3, 401(k) contribution 4%, vested balance 31000.

The embedded tool reads a separate benefits table: health, dental, vision, retirement match, PTO, and wellness stipend.

Stdio is named and not used. The browser cannot start a process.

---

## Where the code lives

| File | What it holds |
|---|---|
| [`src/App.tsx`](src/App.tsx) | The screen and the session. |
| [`src/services/orchestrator.ts`](src/services/orchestrator.ts) | The prompts and the agent loop. |
| [`src/services/templates.ts`](src/services/templates.ts) | The tags. |
| [`src/services/promptStructure.ts`](src/services/promptStructure.ts) | Compiling roles, and the worker tools array. |
| [`src/services/memory.ts`](src/services/memory.ts) | The stored turns. |
| [`src/services/mcp.ts`](src/services/mcp.ts) | Discovery, the in-page transport, and the public proxy. |
| [`src/services/hrServers.ts`](src/services/hrServers.ts) | The salary and retirement tables and tools. |
| [`src/services/tools.ts`](src/services/tools.ts) | `benefits_lookup`. |

---

## Deploy

Fork the repo, set Pages to GitHub Actions, and push to `main`. The workflow publishes `dist`. The address is `https://<username>.github.io/agentforge/`.

That copy can show the in-page salary and retirement tools. Model calls and public MCP servers need the dev server.

---

## License

[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). See [LICENSE](LICENSE).
