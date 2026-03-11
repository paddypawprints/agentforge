# AgentForge — Building Your First AI Agent

A hands-on workshop for technical people who use LLM chatbots every day but want to understand — and write — the code that makes them work.

Hands-on sandbox: **https://paddypawprints.github.io/agentforge/**
Source code: **https://github.com/paddypawprints/agentforge**
Built with [pre.dev](https://pre.dev)

---

## Before You Start — Get Your API Keys

### Groq API Key (required)

You cannot send messages in the sandbox without a Groq API key. Here is how to get one in about two minutes:

1. Open [console.groq.com](https://console.groq.com) in a new tab.
2. Click **Sign Up** and create a free account (Google or GitHub login available).
3. Once logged in, click **API Keys** in the left sidebar.
4. Click **Create API Key**.
5. Give the key a name — anything works, e.g. `agentforge-workshop`.
6. Click **Submit**. The key is shown once — copy it now and save it somewhere safe (e.g. a notes app). You will need it again for the Portkey bonus exercises.
7. Return to the sandbox and paste the key into the **API KEY** field in the top-right of the header.
8. Press Enter or click away. The field will show a green border when a key is present.

The key is stored only in your browser's memory for the current session. It is sent directly to Groq and nowhere else. If you close and reopen the tab you will need to paste it again.

### Portkey API Key (bonus Steps 7–9 only)

[Portkey](https://portkey.ai) is an **AI gateway** — a proxy layer that sits between your application and any LLM provider. It gives you centralised logging, cost tracking, rate limiting, PII detection, and the ability to switch models or providers without changing application code. Think of it as an API gateway (like Kong or AWS API Gateway) purpose-built for LLM traffic.

For this workshop, Portkey lets you inspect every call the agent makes — the full prompt, the tool call, the tool result, token counts, and latency — from a single dashboard.

To get a free Portkey key:

1. Open [app.portkey.ai](https://app.portkey.ai) and sign up for a free account.
2. Once logged in, copy your **Portkey API key** from the dashboard home or the **API Keys** section.
3. Navigate to **Virtual Keys → Add Key**.
4. Select **Groq** as the provider.
5. Enter `aidaysf` as the slug (this is the virtual key identifier the sandbox uses).
6. Paste your Groq API key into the provider key field and save.

You now have a virtual key — a named alias for your Groq key stored securely in Portkey. The sandbox never needs your real Groq key when routing through Portkey; it uses the virtual key slug instead.

---

## 1. Scope — Who This Is For

This workshop is aimed at **technically literate people who are already comfortable using LLM chatbots** (ChatGPT, Claude, Gemini, etc.) but have not yet written code that calls a model API.

By the end of this session you will:

- Understand the difference between a raw language model and a chatbot product
- Know why memory is not a model feature — it is application code
- Have read and run a real agent loop (< 100 lines of TypeScript)
- Be able to extend the agent with your own tool

No prior AI/ML background is required. Basic familiarity with JavaScript or TypeScript is helpful but not essential — all the key code is annotated line-by-line.

---

## 2. All the Code Is Here — Clone and Experiment

Everything shown in this presentation is in this repository. There are no hidden services, no proprietary SDKs, no magic. Clone it, run it locally, and break things.

```bash
git clone https://github.com/paddypawprints/agentforge.git
cd agentforge
npm install
npm run dev
```

Open `http://localhost:5173`. Enter your free Groq API key in the header and you are live.

Get a free Groq API key (no credit card required) at [console.groq.com](https://console.groq.com).

The two files that contain every concept in this workshop:

| File | What it does |
|------|-------------|
| [`src/services/orchestrator.ts`](src/services/orchestrator.ts) | The agent loop — memory, calling the model, running tools |
| [`src/services/tools.ts`](src/services/tools.ts) | Tool definitions — what the model can call and how |

Everything else is UI that visualises those two files.

---

## 3. Model vs Chatbot — Memory and the Loop

When you open ChatGPT and have a multi-turn conversation, you might naturally assume the model "remembers" what you said. It does not.

**A language model is a stateless function.** Every time you call it, you hand it a block of text and it hands back a continuation. It has no memory of previous calls. Each request is completely independent.

```
Call 1:  [  "What's the capital of France?"  ]  →  "Paris."
Call 2:  [  "What's its population?"         ]  →  ??? (who is "its"?)
```

Call 2 fails — or hallucinates — because the model received no context.

**A chatbot product solves this by maintaining a messages array in application code** and passing the full conversation history on every call:

```
Call 2:  [
  { role: "user",      content: "What's the capital of France?" },
  { role: "assistant", content: "Paris." },
  { role: "user",      content: "What's its population?"        }
]
→  "Paris has a population of approximately 2.1 million in the city proper."
```

The model now has context. **Memory is not a model feature — it is a loop maintained by your code.**

This is the single most important concept in this workshop. Everything else builds on it.

---

## 4. Raw Models — What Are We Actually Working With?

Underneath every chatbot product is a foundation model: a large neural network trained to predict the next token in a sequence of text. Common open-weight and hosted models include:

| Model family | Provider | Notes |
|---|---|---|
| Llama 3.x | Meta (hosted by Groq, Together, etc.) | Open weights, fast |
| Mixtral | Mistral AI | Strong reasoning, MoE architecture |
| Gemma 3 | Google | Compact, efficient |
| Qwen 2.5 | Alibaba | Strong multilingual |

All of these expose the same basic API: send a `messages` array, receive a response. The differences are in speed, cost, context window, and quality on different tasks.

For this workshop we use **Groq** as our inference provider because:

- Free tier with generous rate limits
- Extremely fast inference (often < 1 second to first token)
- Supports multiple open models through one API
- Compatible with the OpenAI SDK — the same code works with OpenAI, Anthropic, and most other providers with a one-line change

---

## 5. Groq Provides a Model Playground

Before writing any code, it is worth spending a few minutes with Groq's built-in playground to get a feel for what a raw model looks like.

Go to [console.groq.com/playground](https://console.groq.com/playground).

You will see:

- A **model selector** — choose from the available hosted models
- A **system prompt** field — instructions you give the model before the conversation starts
- A **chat interface** — send messages and see responses
- **Token counts and latency** — visible on every response

This is the same interface you will be controlling programmatically in minutes.

---

## 6. Connecting to Groq — API Keys and the SDK

Groq's API is compatible with the OpenAI SDK. You can switch between providers by changing the `baseURL` and `apiKey`:

```typescript
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: "your-key-here", dangerouslyAllowBrowser: true });

const response = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    { role: "system",  content: "You are a helpful assistant." },
    { role: "user",    content: "What is TypeScript?" },
  ],
});

console.log(response.choices[0].message.content);
```

That is the complete minimum. One function call, one response. No framework, no agent, just a model.

### Temperature

Every call accepts a `temperature` parameter (0.0 – 2.0) that controls how random the output is:

| Range | Effect |
|-------|--------|
| **0.0** | Deterministic — always picks the most likely token. Best for tool-use and structured output. |
| **0.7 – 1.0** | Balanced — the typical default. Good for general chat. |
| **1.0 – 1.5** | More creative and varied output. |
| **1.5 – 2.0** | Very random — often incoherent. Rarely useful. |

For an agent making tool calls, keep temperature low (0.0–0.5) so it reliably produces well-formed requests. For open-ended conversation, 0.7–1.0 is the sweet spot. You can adjust this in real time using the TEMP slider in the sandbox header.

---

## 7. Try It in the Playground — Notice the Missing Memory

Open the Groq playground at [console.groq.com/playground](https://console.groq.com/playground).

1. Select any model (e.g. `llama-3.3-70b-versatile`)
2. Set the system prompt to: `You are a helpful chatbot.`
3. Send a message: `My name is Alex.`
4. The model responds and acknowledges your name.
5. Now click **"New conversation"** (or the equivalent reset button) and ask: `What is my name?`

The model says it does not know. **Each conversation is independent.**

Now try the same thing *within* a single conversation — the model will remember your name because the playground is maintaining the messages array for you behind the scenes. That messages array is the only reason it works.

**Key observation:** the playground itself is a minimal application layer sitting on top of a stateless model. It is doing exactly what your orchestrator will do: accumulating messages and replaying them on every call.

---

## 8. Memory Is Added by System Code — The Orchestrator

The component that manages the messages array, calls the model, and decides what to do with the response is called an **orchestrator**.

Here is the core of ours, lightly simplified:

```typescript
async function orchestrate(userMessage: string) {
  // 1. Add the new user message to the conversation history
  messages.push({ role: "user", content: userMessage });

  while (true) {
    // 2. Call the model with the FULL conversation history every time
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      tools: availableTools,
    });

    const choice = response.choices[0];

    // 3. Did the model want to call a tool?
    if (choice.finish_reason === "tool_calls") {
      const toolCall = choice.message.tool_calls[0];

      // Execute the tool and get the result
      const result = await executeTool(toolCall.function.name, toolCall.function.arguments);

      // Add both the model's tool request AND the tool result to history
      messages.push(choice.message);
      messages.push({ role: "tool", tool_call_id: toolCall.id, content: result });

      // Loop — call the model again with the tool result in context
      continue;
    }

    // 4. Model is done — add its final response and return
    messages.push(choice.message);
    return choice.message.content;
  }
}
```

The full, annotated version is in [`src/services/orchestrator.ts`](src/services/orchestrator.ts).

This loop is the heart of every AI agent. Everything else — streaming, retries, multi-agent routing — is an elaboration of this pattern.

---

## 9. What Is an Agent?

There is a lot of hype around the word "agent". A useful working definition:

> **An agent is a language model that can take actions.**

The minimal version of that is: **a chatbot with tools**.

A tool is any function you expose to the model. You describe it in JSON (name, description, parameters) and the model decides when to call it, what arguments to pass, and how to incorporate the result. The model never calls the function itself — it emits a structured request, your code runs the function, and you hand the result back.

```
User:  "What are Alice's employee benefits?"
         ↓
Model: I need to look that up.
       → tool_call: benefits_lookup({ employee_id: "EMP001" })
         ↓
Code:  runs benefits_lookup, returns JSON
         ↓
Model: (reads the JSON result)
       "Alice Johnson has Premium PPO health coverage, 
        4 weeks annual leave, and is enrolled in the 
        401(k) with 6% employer match."
         ↓
User:  sees the final answer
```

The model contributed reasoning and natural language. The tool contributed real data. Neither could produce the correct answer alone.

Tools are defined in [`src/services/tools.ts`](src/services/tools.ts). Each tool has a JSON schema (what the model sees) and an `execute()` function (what actually runs). To add a new capability to the agent, add it there.

---

## 10. Hands-On — Play With a Real Agent

The sandbox at **https://paddypawprints.github.io/agentforge/** (and the local version you cloned) is a live environment where you can experiment with a minimal but complete agent:

- A system prompt you can edit in real time
- A `benefits_lookup` tool that queries a mock employee benefits database
- Full visibility into the messages array so you can watch the orchestrator work
- Step-by-step exercises that build from a plain chatbot up to a working agent

### Workshop Exercises

Open the sandbox before starting: **https://paddypawprints.github.io/agentforge/**

You will need your Groq API key in the **API KEY** field in the header — see **Before You Start** at the top of this document if you haven't done that yet.

---

#### Step 1 — System Prompt: Shape the Model's Behaviour

1. Open the sandbox. The **SYSTEM PROMPT** panel is expanded by default with the **HR CHATBOT** preset active.
2. Read the prompt — it instructs the model to answer HR questions only and refuse anything else.
3. Send an on-topic message: *"What is the PTO policy?"* — the model will attempt to answer but has no actual policy document, so it will either make something up or say it doesn't have that information.
4. Send an off-topic one: *"Write me a poem."* — the model should decline.
5. Edit the system prompt text directly. Change the refusal instruction to something permissive. Click **APPLY**.
6. Ask the off-topic question again — observe how the model's behaviour changes.

**What you learned:** The system prompt shapes *how* the model behaves, but it does not give the model *knowledge*. Without a document or tool, the model only has what it was trained on. Adding real data is what the next two exercises are about.

---

#### Step 2 — Grounding: Embedding a Document in the Prompt

1. In the **SYSTEM PROMPT** panel, click the **BENEFITS DOC** preset button.
2. Scroll through the prompt — you will see the full 2026 employee benefits policy injected inline between `--- BENEFITS POLICY ---` markers.
3. Ask a question that is answered in the document: *"How many days of annual leave do employees get?"*
4. Ask a question not covered by the document: *"What is the process for requesting a laptop?"* — the model should say it cannot answer from the document.

**What you learned:** Grounding means injecting data directly into the prompt so the model can refer to it. It is the simplest form of retrieval — no database, no search, just text in the context window.

---

#### Step 3 — Tools: Manual Invocation in the Sandbox

1. Find the **TOOL SANDBOX** panel (below the exercise steps, left column).
2. Enter `EMP001` in the employee ID field and click **LOOKUP BENEFITS**.
3. Examine the JSON that comes back — name, health plan, leave entitlement, 401(k) match, and an SSN field.
4. Try `EMP002` and `EMP003` to see different employee records.

**What you learned:** A tool is just a function that returns structured data. The JSON schema you saw defined in `tools.ts` is what the model reads to know the tool exists and what arguments to pass. The model never calls the function itself — it requests a call and your code runs it.

---

#### Step 4 — Ask Without Tools: Observe Hallucination

1. Switch back to the **HR CHATBOT** preset (no tools).
2. Click **CLEAR** in the header to reset the conversation.
3. Ask: *"What are the benefits for EMP001?"*
4. The model has no access to the benefits database. Depending on the model and temperature setting, it may refuse and admit it doesn't know, or it may confidently invent plausible-sounding but entirely fabricated details.
5. Try changing the model or adjusting the **TEMP** slider and ask again — you will likely see different behaviours.

**What you learned:** Whether a model hallucinates or hedges depends on how it was trained and how much randomness (temperature) is in the output. You cannot rely on the model to know when it doesn't know something. The only reliable fix is to give it the data — which is what grounding and tools are for.

---

#### Step 5 — Manual Grounding: Paste the Tool Output Yourself

1. Go back to the Tool Sandbox and run `EMP001` again to get the JSON output.
2. Copy the full JSON result.
3. In the chat, send a new message: paste the JSON and follow it with *"Given this data, what are the benefits for this employee?"*
4. The model now has the data inline and will give a correct answer.

**What you learned:** You just manually did what the orchestrator will do automatically in the next step. Adding the tool result to the messages array is the entire mechanism — there is no magic. The model simply reads whatever is in the conversation history.

---

#### Step 6 — The Agent Loop: Let the Orchestrator Do It

1. Click the **HR AGENT** preset. This prompt tells the model it has access to the `benefits_lookup` tool.
2. Click **CLEAR** to start a fresh conversation.
3. Ask: *"What are the benefits for EMP001?"*
4. Watch the message trace in the right panel:
   - The model emits a `tool_calls` response instead of a plain answer
   - The orchestrator detects `finish_reason === "tool_calls"`, runs `benefits_lookup("EMP001")`, and appends the result to the messages array
   - The orchestrator calls the model again with the tool result in context
   - The model now answers correctly
5. Try a follow-up: *"What about EMP002?"* — the orchestrator repeats the loop.

**What you learned:** The agent loop is exactly steps 3–5 automated. The orchestrator maintains the messages array, dispatches tools when the model requests them, and keeps looping until `finish_reason === "stop"`. The model decides *when* to call a tool and *what arguments* to use — your code decides *how* to execute it.

---

#### Read the Code — How the Orchestrator Works

Now that you have seen the agent loop in action, open [`src/services/orchestrator.ts`](src/services/orchestrator.ts). It is heavily commented and maps directly to what you just observed. Here is what each part does:

**1. The messages array** (around the `groqHistory` variable)
Every call to the model starts by building a fresh `groqHistory` array — system prompt first, then the user message. As the loop runs, tool calls and tool results are appended to this same array. This is the only "memory" the agent has.

**2. First LLM call** (`callGroqAPI`)
Sends `groqHistory` plus the tool schemas to the model. The tool schemas are JSON descriptions of what each tool is called, what it does, and what arguments it takes. The model reads these and decides whether to call one.

**3. Checking `finish_reason`**
The model's response includes a `finish_reason` field:
- `"tool_calls"` — the model wants to call a tool before answering
- `"stop"` — the model is done and the content field holds the final answer

**4. The tool loop** (`while (choice.finish_reason === "tool_calls")`)
When `finish_reason` is `"tool_calls"`:
- Read the tool name and arguments from the model's response
- Call `tool.execute(args)` — the same function you ran manually in Step 3
- Append both the model's tool request *and* the tool result to `groqHistory`
- Call the model again with the updated context
- Repeat until `finish_reason === "stop"` or the loop limit is reached

**5. Writing to the UI**
The orchestrator calls `addMessage()` at each stage — user message, each LLM call, each tool result, and the final answer. The message history panel renders these in order, giving you the full execution trace you saw in Step 6.

That is the complete agent. There is no hidden framework — everything is in those ~200 lines.

---

#### Bonus — Observability with Portkey

Steps 7–9 require a free Portkey account and API key. See **Getting a Portkey API Key** in the Prerequisites section above for setup instructions.

**What is Portkey?**
Portkey is an AI gateway — a proxy that sits between your code and any LLM provider. You point your API calls at Portkey instead of directly at Groq (or OpenAI, Anthropic, etc.), and Portkey forwards them on. Because all traffic flows through it, you get a complete log of every request and response: the full prompt, the model's reply, token counts, latency, cost, and automatic scanning for sensitive data like PII. In production, teams use gateways like Portkey to enforce rate limits, swap models without code changes, and catch data leakage before it leaves the system.

**Step 7 — Connect Portkey to Groq**
1. Follow the instructions in **Getting a Portkey API Key** above to create a Virtual Key pointing at Groq with the slug `aidaysf`.
2. Make sure you have both your **Portkey API key** (from the Portkey dashboard) and the virtual key slug ready.

**Step 8 — Enable in the Sandbox**
1. Check the **PORTKEY** checkbox in the sandbox header.
2. Paste your **Portkey API key** into the field that appears (not your Groq key — Portkey handles that internally via the virtual key).
3. The checkbox border turns green. All LLM traffic now routes through Portkey instead of hitting Groq directly.

**Step 9 — Observe**
1. Run the HR Agent query again (Step 6).
2. Switch to the Portkey dashboard and open the **Logs** tab.
3. Click on the most recent request. You can see:
   - The full messages array sent to the model (system prompt, user message, tool result)
   - The model's raw response including the tool call request
   - Token counts (prompt tokens, completion tokens, total)
   - Request latency
   - Any PII detected — look for the SSN field in the `benefits_lookup` tool result

**What you learned:** An AI gateway gives you observability and control over every LLM call without touching application code. The orchestrator sends the same request regardless — it is the routing layer that changes. This is how production agent systems handle logging, cost management, and compliance.

### Architecture

```
┌─────────────────────────────────────────┐
│  MessageComposer  ←→  MessageHistory    │  React UI (Zustand store)
└──────────────┬──────────────────────────┘
               │ orchestrate(userQuery, tools)
┌──────────────▼──────────────────────────┐
│           orchestrator.ts               │
│  1. Append user message                 │
│  2. Call LLM with full history          │
│  3. finish_reason === "tool_calls"?      │
│     → execute tool → append result      │
│     → call LLM again                    │
│  4. finish_reason === "stop" → done     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│             tools.ts                    │
│  benefits_lookup({ employee_id })       │
│  → returns benefits JSON                │
└─────────────────────────────────────────┘
```

---

## Running Locally

```bash
git clone https://github.com/paddypawprints/agentforge.git
cd agentforge
npm install
npm run dev
```

Open `http://localhost:5173`. Enter your Groq key in the header — no `.env` file needed.

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

---

## Forking and Deploying Your Own Copy

1. Fork the repo on GitHub
2. Go to your fork's **Settings → Pages → Source → GitHub Actions**
3. Push any change to `main` — the included workflow builds and deploys automatically
4. Your live app will be at `https://<your-username>.github.io/agentforge/`

---

## Further Reading

- [Groq API Documentation](https://console.groq.com/docs)
- [OpenAI Chat Completions API reference](https://platform.openai.com/docs/api-reference/chat) — Groq uses the same interface
- [Groq model playground](https://console.groq.com/playground)

---

## Credits

- **[pre.dev](https://pre.dev)** — The agent app was scaffolded and generated with pre.dev, an AI-powered software architect that takes a project brief and produces a working codebase. If you want to build your own agent app from scratch, it's a great place to start.

- **[Groq](https://groq.com)** — Provides the LLM inference used throughout this workshop. Groq's hardware delivers extremely fast responses and a generous free tier, making it ideal for hands-on learning. Get your free API key at [console.groq.com](https://console.groq.com).

- **[GitHub](https://github.com)** — Hosts the source code and serves the sandbox via GitHub Pages. Fork the repo, push a change, and your own live version deploys automatically.

- **[Portkey](https://portkey.ai)** — Provides the AI gateway used in the observability bonus exercises. Portkey makes it easy to add logging, cost tracking, and governance to any LLM application. Free tier available at [app.portkey.ai](https://app.portkey.ai).

---

## License

This work is licensed under the [Creative Commons Attribution 4.0 International License (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

You are free to share and adapt this material for any purpose, including commercially, as long as you give appropriate credit. See the [LICENSE](LICENSE) file for the full terms.
