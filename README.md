# AgentForge — AI Agents Workshop

A hands-on workshop app for learning AI agent orchestration. Built with React, Vite, and the Groq API.

Live: **https://paddypawprints.github.io/agentforge/**

---

## Using the App

No installation required. Open the link above, enter your Groq API key in the header, and follow the 9-step exercise in the left panel.

Get a free Groq API key at [console.groq.com](https://console.groq.com).

---

## Workshop Exercise

The 9 steps walk you through how an AI agent actually works, building up from first principles:

| Step | Topic |
|------|-------|
| 1 | System prompt — shape the model's behaviour with instructions |
| 2 | Grounding — embed a document directly in the prompt |
| 3 | Tools — call the `benefits_lookup` tool manually in the sandbox |
| 4 | LLM without tools — ask a data question, observe hallucination |
| 5 | Manual grounding — paste tool output into the chat yourself |
| 6 | Agent loop — let the orchestrator do steps 3–5 automatically |
| 7 | Portkey setup — create a virtual key pointing at Groq |
| 8 | Enable Portkey — route all traffic through the gateway |
| 9 | Observe — inspect logs, token counts, and PII detection |

---

## The Two Files That Matter

All the agent logic lives in two files:

- **[`src/services/tools.ts`](src/services/tools.ts)** — defines the `benefits_lookup` tool: its JSON schema (what the LLM sees) and `execute()` function (the actual data lookup). To add a new tool, add it here.

- **[`src/services/orchestrator.ts`](src/services/orchestrator.ts)** — the agent loop: builds the messages array, calls the LLM, checks `finish_reason`, runs tools, injects results, loops until done. Heavily commented and keyed to the exercise steps.

Everything else is UI that visualises what those two files are doing.

---

## Architecture

```
┌─────────────────────────────────────────┐
│  MessageComposer  ←→  MessageHistory    │  React UI (Zustand store)
└──────────────┬──────────────────────────┘
               │ orchestrate(userQuery, tools)
┌──────────────▼──────────────────────────┐
│           orchestrator.ts               │
│  1. Build messages array                │
│  2. Call LLM (Groq or Portkey)          │
│  3. finish_reason === "tool_calls"?      │
│     → execute tool → inject result      │
│     → call LLM again                    │
│  4. finish_reason === "stop" → done     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│             tools.ts                    │
│  benefits_lookup.execute(employee_id)   │
│  → returns JSON with benefits + SSN     │
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

Open `http://localhost:3000`. Enter your Groq key in the header — no `.env` file needed.

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

---

## Forking & Deploying Your Own Copy

1. Fork the repo on GitHub
2. Go to your fork's **Settings → Pages → Source → GitHub Actions**
3. Push any change to `main` — the included workflow builds and deploys automatically
4. Your app will be live at `https://<your-username>.github.io/agentforge/`


## 📋 Prerequisites

- **StackBlitz Account**: Free account at [stackblitz.com](https://stackblitz.com) (required to fork and save templates)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **No Local Installation Required**: StackBlitz runs entirely in the browser

### Optional: Local Development
- **Node.js**: v18+ (for running locally)
- **npm**: v9+ (included with Node.js)
- **Git**: For cloning the repository

## 🚀 Quick Start

### Option 1: StackBlitz (Recommended for Workshop)

1. **Fork the Template**
   - Open the StackBlitz template link provided by the instructor
   - Click **"Fork"** in the top-right corner
   - StackBlitz will create a copy in your account

2. **Add Secrets (API Keys)**
   - Click the **"Secrets"** icon (lock icon) in the left sidebar
   - Add the following environment variables:
     - `GROQ_API_KEY`: Your Groq API key (get from [console.groq.com](https://console.groq.com))
     - `PORTKEY_API_KEY`: Your Portkey API key (optional, for governance demo)
   - Secrets are encrypted and never exposed in the browser console

3. **Run the Template**
   - StackBlitz automatically installs dependencies and starts the dev server
   - The preview pane (right side) shows the running app
   - Open the **"Preview"** tab to interact with the agent

### Option 2: Local Development

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd ai-agents-workshop
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your API keys:
   ```
   VITE_GROQ_API_KEY=your_groq_api_key_here
   VITE_PORTKEY_API_KEY=your_portkey_api_key_here
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser

5. **Build for Production**
   ```bash
   npm run build
   ```

## 🏗️ Architecture Overview

This template demonstrates the **separation of agent logic from UI**, a core principle of production agent systems.

### Key Concepts

**Agent Logic ≠ UI**
- The agent orchestrator is a pure state machine that manages messages and tool dispatch
- The UI is a separate layer that displays state and triggers orchestrator actions
- This separation allows the same orchestrator to power different interfaces (web, CLI, API)

### Component Layers

```
┌─────────────────────────────────────────┐
│         React UI Components             │
│  (Display messages, handle user input)  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Agent Orchestrator Service         │
│  (Manage state, dispatch tools, track   │
│   messages, handle tool responses)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Tool Implementations               │
│  (benefits lookup, salary calculator)   │
└─────────────────────────────────────────┘
```

### Data Flow

1. **User Input** → UI component captures message
2. **Dispatch** → Orchestrator adds message to history
3. **Tool Check** → Orchestrator checks if agent requests a tool
4. **Tool Execution** → Tool runs and returns result
5. **Response** → Orchestrator adds tool result to history
6. **Render** → UI displays updated messages array

### State Management

- **Messages Array**: Immutable list of all turns (user messages, agent responses, tool calls, tool results)
- **Agent Store**: Zustand store holding messages and orchestrator state
- **No Model State Leakage**: Each session starts fresh; no memory persists between runs

## 📁 Key Files to Inspect

### 1. **`src/types/agent.ts`** — Type Definitions
Defines the message structure and tool types:
- `Message`: User, assistant, or tool message
- `ToolCall`: Structured tool request from the agent
- `ToolResult`: Result returned by a tool

**Why inspect it**: Understand the shape of data flowing through the system.

### 2. **`src/services/agent-orchestrator.ts`** — Core Orchestrator
The heart of the agent logic:
- `AgentOrchestrator` class manages the message history
- `processMessage()`: Sends a message to the agent and handles responses
- `executeTool()`: Runs a tool and adds the result to history
- `getMessages()`: Returns the current message history

**Why inspect it**: See how the agent state machine works without UI concerns.

### 3. **`src/store/agentStore.ts`** — State Store
Zustand store for reactive state management:
- `messages`: Current message history
- `addMessage()`: Add a message to history
- `clearHistory()`: Reset for a new session

**Why inspect it**: Understand how React components subscribe to orchestrator state.

### 4. **`src/services/tools.ts`** — Tool Implementations
Mock tools used in the demo:
- `benefitsLookup()`: Simulates querying an employee benefits database
- `salaryCalculator()`: Simulates calculating adjusted salary

**Why inspect it**: See how tools are invoked and how results are structured.

### 5. **`src/components/hooks/use-agent-orchestrator.ts`** — React Hook
Custom hook that bridges the orchestrator and React:
- `useAgentOrchestrator()`: Provides orchestrator methods and state to components

**Why inspect it**: See how to integrate the orchestrator into React components.

## 🏃 How to Run Locally

### Prerequisites
- Node.js v18+ installed
- npm v9+ installed

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your API keys
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Output:
   ```
   VITE v4.x.x  ready in xxx ms

   ➜  Local:   http://localhost:5173/
   ➜  press h to show help
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:5173`
   - The app should load with the agent interface

5. **Stop the Server**
   - Press `Ctrl+C` in the terminal

### Available npm Scripts

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
npm run format   # Format code with Prettier
```

## 👥 Participant Exercises

These exercises help you understand how agent orchestration works by observing the system in action.

### Exercise 1: Observe the Messages Array

**Objective**: Understand that the agent's "memory" is just a list of messages.

**Steps**:
1. Open the app in StackBlitz or locally
2. In the browser **DevTools Console** (F12), run:
   ```javascript
   // Access the Zustand store (exposed for debugging)
   window.__agentStore?.getState().messages
   ```
3. Send a message to the agent (e.g., "What are the health benefits?")
4. Run the console command again and observe:
   - A new **user message** was added
   - The agent's **response** was added
   - If a tool was called, a **tool call** and **tool result** were added

**Key Insight**: The agent has no persistent memory—only the messages array. Each turn is stateless; the full history is passed to the model.

### Exercise 2: Trace Tool Dispatch

**Objective**: See how the agent requests tools and how results are returned.

**Steps**:
1. Open **DevTools Console** (F12)
2. Send a message that triggers a tool (e.g., "Calculate my salary if I get a 10% raise")
3. Watch the console for logs like:
   ```
   [Agent] Tool requested: salaryCalculator
   [Agent] Tool result: { adjustedSalary: 110000 }
   ```
4. In the messages array, find:
   - The **tool call** message (role: "assistant", content includes tool name)
   - The **tool result** message (role: "tool", content includes the result)

**Key Insight**: Tool dispatch is a two-step handshake:
1. Agent requests a tool (included in its response)
2. Orchestrator executes the tool and adds the result to history
3. Next turn, the agent sees the result and can respond

### Exercise 3: Inspect the Orchestrator State

**Objective**: Understand the separation between agent logic and UI.

**Steps**:
1. Open the app and send a few messages
2. Open **DevTools Console** and run:
   ```javascript
   // Get the full orchestrator state
   window.__agentStore?.getState()
   ```
3. Observe:
   - `messages`: Array of all turns
   - `isLoading`: Whether the agent is processing
   - `error`: Any errors that occurred
4. The UI is just rendering this state—the orchestrator doesn't know about React

**Key Insight**: The orchestrator is framework-agnostic. The same orchestrator could power a CLI, API, or mobile app.

### Exercise 4: Reset and Start Fresh

**Objective**: Verify that no state leaks between sessions.

**Steps**:
1. Send several messages to the agent
2. Click the **"Clear History"** button
3. In the console, run:
   ```javascript
   window.__agentStore?.getState().messages
   ```
4. Observe: The messages array is empty

**Key Insight**: Each session is isolated. The agent has no memory of previous conversations.

### Exercise 5: Modify a Tool and Observe

**Objective**: See how changing tool behavior affects the agent.

**Advanced**: If you're comfortable with code:
1. Open `src/services/tools.ts`
2. Modify the `salaryCalculator()` function to return a different value
3. Send a message that triggers the tool
4. Observe the new result in the messages array

**Key Insight**: Tools are pluggable. You can swap implementations without changing the orchestrator.

## 🔗 Integration with Other Sessions

This template is part of a three-session workshop:

1. **Session 1: Inference & Grounding** (Groq Playground)
   - Demonstrates stateless inference
   - Shows how grounding works in the system message

2. **Session 2: State & Orchestration** (This Template)
   - Demonstrates stateful message history
   - Shows tool dispatch and orchestration

3. **Session 3: Governance & FinOps** (Portkey Gateway)
   - Adds security and cost tracking
   - Integrates with this template via the `PORTKEY_API_KEY`

## 🛠️ Troubleshooting

### "API Key Not Found" Error
- **StackBlitz**: Check that you added the secret in the Secrets panel
- **Local**: Check that `.env.local` has the correct key name (must start with `VITE_`)

### "Tool Not Found" Error
- The agent requested a tool that doesn't exist in `src/services/tools.ts`
- Check the console logs to see which tool was requested
- Add the tool to `tools.ts` or update the agent's system prompt

### App Won't Load
- **StackBlitz**: Refresh the page (Cmd+R or Ctrl+R)
- **Local**: Check that `npm run dev` is running and no errors in the terminal

### Messages Array Not Updating
- Check that the orchestrator is being called correctly
- Open DevTools Console and look for error messages
- Verify that the API key is valid

## 📚 Further Reading

- [Groq API Documentation](https://console.groq.com/docs)
- [Portkey Gateway Documentation](https://docs.portkey.ai)
- [React Hooks Documentation](https://react.dev/reference/react)
- [Zustand State Management](https://github.com/pmndrs/zustand)

## 📝 License

This workshop material is provided by the Internet Society for educational purposes.

---

**Questions?** Ask the instructor during the workshop or check the workshop Slack channel.
