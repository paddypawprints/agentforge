# Agent Orchestrator Pattern

This document explains how the agent orchestrator works in the StackBlitz template. Understanding this pattern is key to Session 2: **State & Orchestration**.

## Core Concept: The Two-Step MCP Handshake

The orchestrator implements a **two-step handshake** for tool use:

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Request                                             │
│ User: "What are Alice's benefits?"                          │
│ → Add to messages array                                     │
│ → Call LLM with tools available                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ LLM Response: Tool Use                                      │
│ {                                                           │
│   "stop_reason": "tool_use",                               │
│   "content": "I'll look up Alice's benefits",              │
│   "tool_calls": [                                          │
│     {                                                       │
│       "id": "call_123",                                    │
│       "name": "benefits_lookup",                           │
│       "input": { "employee_id": "EMP001" }                │
│     }                                                       │
│   ]                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Execute & Result                                    │
│ → Dispatch tool: benefits_lookup("EMP001")                 │
│ → Get result: { name: "Alice Johnson", ... }              │
│ → Add tool call to messages                                │
│ → Add tool result to messages                              │
│ → Call LLM again with result in context                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ LLM Response: Final Answer                                  │
│ {                                                           │
│   "stop_reason": "end_turn",                               │
│   "content": "Alice Johnson has Premium PPO coverage..."   │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Loop Complete                                               │
│ → Add final response to messages                           │
│ → Display to user                                          │
│ → Ready for next query                                     │
└─────────────────────────────────────────────────────────────┘
```

## Key Insight: Memory is Application Logic

**The LLM has NO memory.** Each API call is stateless:

```typescript
// ❌ WRONG: Expecting the model to remember previous queries
const response1 = await groq.chat.completions.create({
  messages: [{ role: "user", content: "What are Alice's benefits?" }],
  tools: [benefits_lookup],
});

const response2 = await groq.chat.completions.create({
  messages: [{ role: "user", content: "What's her salary?" }],
  // ❌ Model doesn't know who "her" is!
  tools: [salary_calc],
});

// ✅ CORRECT: Pass full conversation history
const messages = [
  { role: "user", content: "What are Alice's benefits?" },
  { role: "assistant", content: "...", tool_calls: [...] },
  { role: "tool", content: "Alice Johnson has Premium PPO..." },
  { role: "assistant", content: "Alice has Premium PPO coverage..." },
  { role: "user", content: "What's her salary?" },
  // ✅ Model now has full context!
];

const response2 = await groq.chat.completions.create({
  messages: messages,
  tools: [salary_calc],
});
```

**This is the fundamental principle:** The orchestrator maintains the `messages` array, and each API call includes the ENTIRE conversation history.

## Messages Array Structure

The messages array is the "memory" of the conversation. Each message has:

```typescript
interface Message {
  role: "user" | "assistant" | "tool";
  content: string;
  timestamp: string;
  toolCall?: ToolCall;      // Only for assistant messages with tool use
  toolResult?: ToolResult;  // Only for tool messages
}

interface ToolCall {
  id: string;
  name: string;
  input: Record<string, any>;
  status: "pending" | "completed" | "failed";
}

interface ToolResult {
  toolCallId: string;
  toolName: string;
  result: Record<string, any>;
  error?: string;
}
```

### Example Conversation

```typescript
const messages = [
  // Turn 1: User asks a question
  {
    role: "user",
    content: "What are Alice's benefits?",
    timestamp: "6:32:14 PM",
  },
  
  // LLM decides to use a tool
  {
    role: "assistant",
    content: "I'll look up Alice's benefits for you.",
    timestamp: "6:32:14 PM",
    toolCall: {
      id: "call_123",
      name: "benefits_lookup",
      input: { employee_id: "EMP001" },
      status: "completed",
    },
  },
  
  // Tool result is added as a separate message
  {
    role: "tool",
    content: JSON.stringify({
      success: true,
      employee_id: "EMP001",
      benefits: {
        name: "Alice Johnson",
        health_insurance: "Premium PPO",
        dental: "Full Coverage",
        vision: "Full Coverage",
        retirement_match: "6%",
        pto_days: 25,
        wellness_stipend: 1500,
      },
    }),
    timestamp: "6:32:14 PM",
    toolResult: {
      toolCallId: "call_123",
      toolName: "benefits_lookup",
      result: { /* parsed result */ },
    },
  },
  
  // LLM provides final answer with full context
  {
    role: "assistant",
    content: "Alice Johnson has Premium PPO health insurance with full dental and vision coverage. She gets a 6% 401k match, 25 PTO days, and a $1,500 wellness stipend.",
    timestamp: "6:32:14 PM",
  },
];
```

## Tool Dispatch Flow

Here's how tools are dispatched in the orchestrator:

```typescript
// 1. User submits a query
async function orchestrate(userQuery: string, tools: Tool[]) {
  // 2. Add user message to history
  addMessage({
    role: "user",
    content: userQuery,
    timestamp: new Date().toLocaleTimeString(),
  });

  // 3. Call LLM with full message history + available tools
  const response = await callGroqAPI(messages, tools);

  // 4. Check if LLM wants to use a tool
  if (response.stop_reason === "tool_use") {
    // 5. Add assistant message (with tool call info)
    addMessage({
      role: "assistant",
      content: response.content,
      timestamp: new Date().toLocaleTimeString(),
      toolCall: response.tool_calls[0],
    });

    // 6. Dispatch the tool
    const tool = tools.find((t) => t.name === response.tool_calls[0].name);
    const result = await tool.execute(response.tool_calls[0].input);

    // 7. Add tool result to history
    addMessage({
      role: "tool",
      content: JSON.stringify(result),
      timestamp: new Date().toLocaleTimeString(),
      toolResult: {
        toolCallId: response.tool_calls[0].id,
        toolName: tool.name,
        result: result,
      },
    });

    // 8. Call LLM again with result in context (loop back)
    const finalResponse = await callGroqAPI(messages, tools);

    // 9. Add final response
    addMessage({
      role: "assistant",
      content: finalResponse.content,
      timestamp: new Date().toLocaleTimeString(),
    });
  } else {
    // LLM answered directly without tools
    addMessage({
      role: "assistant",
      content: response.content,
      timestamp: new Date().toLocaleTimeString(),
    });
  }
}
```

## Code Walkthrough: orchestrator.ts

Let's examine the actual implementation:

### 1. Import Dependencies

```typescript
import { Groq } from "groq-sdk";
import { useAgentStore } from "../store/agentStore";
import { Tool, Message } from "../types/agent";
```

### 2. Initialize Groq Client

```typescript
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // StackBlitz only - don't use in production!
});
```

**⚠️ Security Note:** `dangerouslyAllowBrowser: true` exposes your API key to the client. This is **only acceptable for workshops and demos**. In production, use a backend proxy.

### 3. Call Groq API

```typescript
async function callGroqAPI(
  messages: Message[],
  tools: Tool[],
  gatewayUrl?: string
) {
  // Convert messages to Groq format
  const groqMessages = messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Convert tools to Groq format
  const groqTools = tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));

  // Call Groq API (or Portkey gateway if provided)
  const client = gatewayUrl ? createPortkeyClient(gatewayUrl) : groq;

  const response = await client.chat.completions.create({
    model: "mixtral-8x7b-32768",
    messages: groqMessages,
    tools: groqTools,
    system: `You are an AI agent helping participants understand how agents work.
You have access to tools to look up employee benefits and calculate salaries.
Use tools when the user asks for specific information.
Always explain your reasoning.`,
  });

  return {
    stop_reason: response.choices[0].finish_reason,
    content: response.choices[0].message.content || "",
    tool_calls: response.choices[0].message.tool_calls || [],
  };
}
```

### 4. Main Orchestration Loop

```typescript
export async function orchestrate(
  userQuery: string,
  tools: Tool[],
  gatewayUrl?: string
) {
  const { addMessage, messages } = useAgentStore.getState();

  try {
    // Step 1: Add user message
    addMessage({
      role: "user",
      content: userQuery,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Step 2: Call LLM
    let response = await callGroqAPI(messages, tools, gatewayUrl);

    // Step 3: Handle tool use (loop)
    while (response.stop_reason === "tool_use") {
      const toolCall = response.tool_calls[0];

      // Add assistant message with tool call
      addMessage({
        role: "assistant",
        content: response.content,
        timestamp: new Date().toLocaleTimeString(),
        toolCall: {
          id: toolCall.id,
          name: toolCall.function.name,
          input: toolCall.function.arguments,
          status: "completed",
        },
      });

      // Dispatch tool
      const tool = tools.find((t) => t.name === toolCall.function.name);
      if (!tool) throw new Error(`Tool not found: ${toolCall.function.name}`);

      const result = await tool.execute(toolCall.function.arguments);

      // Add tool result
      addMessage({
        role: "tool",
        content: JSON.stringify(result),
        timestamp: new Date().toLocaleTimeString(),
        toolResult: {
          toolCallId: toolCall.id,
          toolName: tool.name,
          result: result,
        },
      });

      // Loop: Call LLM again with result
      response = await callGroqAPI(messages, tools, gatewayUrl);
    }

    // Step 4: Add final response
    addMessage({
      role: "assistant",
      content: response.content,
      timestamp: new Date().toLocaleTimeString(),
    });
  } catch (error) {
    console.error("Orchestration error:", error);
    addMessage({
      role: "assistant",
      content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp: new Date().toLocaleTimeString(),
    });
  }
}
```

## How to Add New Tools

To add a new tool to the orchestrator:

### 1. Define the Tool

```typescript
// src/services/tools.ts

const myNewTool: Tool = {
  name: "my_tool",
  description: "Does something useful",
  inputSchema: {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "First parameter",
      },
      param2: {
        type: "number",
        description: "Second parameter",
      },
    },
    required: ["param1", "param2"],
  },
  execute: async (input: { param1: string; param2: number }) => {
    // Implement tool logic
    return {
      success: true,
      result: `Processed ${input.param1} with ${input.param2}`,
    };
  },
};

export const mockTools = [benefitsLookup, salaryCalc, myNewTool];
```

### 2. Use in Orchestrator

```typescript
// src/App.tsx

import { mockTools } from "./services/tools";

export function App() {
  const handleToolDispatch = async (toolName: string, input: any) => {
    await orchestrate(`Use ${toolName} with ${JSON.stringify(input)}`, mockTools);
  };

  return (
    <div>
      <ToolDispatcher tools={mockTools} onDispatch={handleToolDispatch} />
    </div>
  );
}
```

### 3. Add UI for the Tool

```typescript
// src/components/ToolDispatcher.tsx

export function ToolDispatcher({ tools }: { tools: Tool[] }) {
  return (
    <div>
      {tools.map((tool) => (
        <button
          key={tool.name}
          onClick={() => handleDispatch(tool.name)}
        >
          {tool.name}
        </button>
      ))}
    </div>
  );
}
```

## Session 2 vs Session 3

### Session 2: Raw Groq (State & Orchestration)

- Uses Groq API directly
- Demonstrates stateless LLM calls
- Shows how messages array maintains context
- Participants observe tool dispatch and results

```typescript
// Session 2: Direct Groq
const response = await groq.chat.completions.create({
  model: "mixtral-8x7b-32768",
  messages: messages,
  tools: tools,
});
```

### Session 3: Portkey Gateway (Governance & FinOps)

- Wraps Groq client with Portkey gateway
- Adds PII masking (SSN, email, credit card detection)
- Tracks cost per turn
- Implements rate limiting

```typescript
// Session 3: Portkey-wrapped Groq
const portkeyClient = createPortkeyClient(
  import.meta.env.VITE_PORTKEY_API_KEY
);

const response = await portkeyClient.chat.completions.create({
  model: "mixtral-8x7b-32768",
  messages: messages,
  tools: tools,
  // Portkey adds:
  // - PII masking
  // - Cost tracking
  // - Rate limiting
  // - Request logging
});
```

## Debugging Tips

### 1. Inspect Messages Array

Open browser DevTools and check the Zustand store:

```typescript
// In browser console
import { useAgentStore } from "./store/agentStore";
const { messages } = useAgentStore.getState();
console.log(JSON.stringify(messages, null, 2));
```

### 2. Log Each Step

The orchestrator logs each step to console:

```
User: "What are Alice's benefits?"
→ Added to messages (1 message)
→ Calling Groq API with 1 message and 2 tools
→ LLM response: tool_use (benefits_lookup)
→ Dispatching tool: benefits_lookup({ employee_id: "EMP001" })
→ Tool result: { success: true, ... }
→ Added tool result to messages (3 messages)
→ Calling Groq API again with 3 messages
→ LLM response: end_turn
→ Final response added (4 messages)
```

### 3. Check Tool Execution

Each tool logs its input and output:

```typescript
// In tools.ts
execute: async (input) => {
  console.log(`[${this.name}] Input:`, input);
  const result = { /* ... */ };
  console.log(`[${this.name}] Output:`, result);
  return result;
};
```

## Key Takeaways

1. **Stateless LLM:** The model has no memory; the orchestrator maintains the messages array
2. **Two-Step Handshake:** Request → Tool Use → Execute → Result → Loop
3. **Full Context:** Each API call includes the entire conversation history
4. **Application Logic:** Memory, tool dispatch, and orchestration are application-level, not model capabilities
5. **Extensible:** New tools can be added by defining the schema and execute function

---

**Next Steps:**
- Session 2: Run the orchestrator and observe the messages array
- Session 3: Add Portkey gateway to track costs and PII masking
- Advanced: Implement custom tools for your domain

**Related Files:**
- `src/types/agent.ts` - Type definitions
- `src/store/agentStore.ts` - Zustand store
- `src/services/orchestrator.ts` - Orchestrator implementation
- `src/services/tools.ts` - Tool definitions
- `src/components/MessageHistory.tsx` - Message display
- `src/components/ToolDispatcher.tsx` - Tool UI

---

**Last Updated:** 2024
**Workshop Version:** Session 2 & 3
