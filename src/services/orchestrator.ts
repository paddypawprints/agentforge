import { useAgentStore } from "../store/agentStore";
import { Tool, Message } from "../types/agent";

// Initialize Groq client (lazy loaded to avoid issues with missing API key at startup)
let groq: any = null;

async function getGroqClient() {
  if (!groq) {
    // Dynamically import Groq to avoid issues at startup
    const { Groq } = await import("groq-sdk");
    groq = new Groq({
      apiKey: (import.meta as any).env.VITE_GROQ_API_KEY,
      dangerouslyAllowBrowser: true, // StackBlitz only - don't use in production!
    });
  }
  return groq;
}

/**
 * Call Groq API with messages and tools
 * Supports both raw Groq (Session 2) and Portkey-wrapped (Session 3)
 */
async function callGroqAPI(
  messages: Message[],
  tools: Tool[],
  gatewayUrl?: string
) {
  // Convert messages to Groq format
  const groqMessages = messages.map((msg) => ({
    role: msg.role as "user" | "assistant" | "tool",
    content: msg.content,
  }));

  // Convert tools to Groq format
  const groqTools = tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));

  // Use Portkey gateway if provided, otherwise use raw Groq
  const client = gatewayUrl ? createPortkeyClient(gatewayUrl) : await getGroqClient();

  console.log(
    `[Orchestrator] Calling ${gatewayUrl ? "Portkey" : "Groq"} API with ${messages.length} messages and ${tools.length} tools`
  );

  const response = await client.chat.completions.create({
    model: "mixtral-8x7b-32768",
    messages: groqMessages,
    tools: groqTools,
    system: `You are an AI agent helping participants understand how agents work in production systems.
You have access to tools to look up employee benefits and calculate salaries.
Use tools when the user asks for specific information.
Always explain your reasoning and be concise.
When using tools, explain what you're doing and why.`,
  });

  const choice = response.choices[0];
  const toolCalls = choice.message.tool_calls || [];

  return {
    stop_reason: choice.finish_reason,
    content: choice.message.content || "",
    tool_calls: toolCalls.map((tc: any) => ({
      id: tc.id,
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments,
      },
    })),
  };
}

/**
 * Create Portkey-wrapped Groq client (Session 3)
 * This is a placeholder - actual implementation in portkey.ts
 */
function createPortkeyClient(gatewayUrl: string) {
  // For now, return raw Groq client
  // This will be replaced with actual Portkey integration in portkey.ts
  console.log(`[Orchestrator] Using Portkey gateway: ${gatewayUrl}`);
  return groq;
}

/**
 * Main orchestration function
 * Implements the two-step MCP handshake:
 * 1. User query → add to messages
 * 2. Call LLM with tools
 * 3. If tool_use: dispatch tool, add result, loop back
 * 4. If end_turn: add final response
 */
export async function orchestrate(
  userQuery: string,
  tools: Tool[],
  gatewayUrl?: string
) {
  const { addMessage, messages } = useAgentStore.getState();

  try {
    console.log(`[Orchestrator] Starting orchestration for query: "${userQuery}"`);

    // Step 1: Add user message to history
    addMessage({
      role: "user",
      content: userQuery,
      timestamp: new Date(),
    });

    console.log(`[Orchestrator] Added user message (total: ${messages.length + 1})`);

    // Step 2: Call LLM with tools
    let response = await callGroqAPI(messages, tools, gatewayUrl);

    console.log(
      `[Orchestrator] LLM response: stop_reason=${response.stop_reason}, tool_calls=${response.tool_calls.length}`
    );

    // Step 3: Handle tool use (loop until end_turn)
    let loopCount = 0;
    while (response.stop_reason === "tool_use" && loopCount < 5) {
      loopCount++;
      console.log(`[Orchestrator] Tool use detected (loop ${loopCount})`);

      const toolCall = response.tool_calls[0];
      if (!toolCall) break;

      const toolName = toolCall.function.name;
      const toolInput = toolCall.function.arguments;

      console.log(`[Orchestrator] Dispatching tool: ${toolName}`, toolInput);

      // Add assistant message with tool call info
      addMessage({
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        toolCall: {
          id: toolCall.id,
          name: toolName,
          input: toolInput,
          status: "completed",
        },
      });

      // Find and execute the tool
      const tool = tools.find((t) => t.name === toolName);
      if (!tool) {
        throw new Error(`Tool not found: ${toolName}`);
      }

      const result = await tool.execute(toolInput);

      console.log(`[Orchestrator] Tool result:`, result);

      // Add tool result to history
      addMessage({
        role: "tool",
        content: JSON.stringify(result),
        timestamp: new Date(),
      });

      // Loop: Call LLM again with result in context
      console.log(`[Orchestrator] Calling LLM again with tool result...`);
      response = await callGroqAPI(messages, tools, gatewayUrl);

      console.log(
        `[Orchestrator] LLM response: stop_reason=${response.stop_reason}, tool_calls=${response.tool_calls.length}`
      );
    }

    // Step 4: Add final response
    console.log(`[Orchestrator] Adding final response`);
    addMessage({
      role: "assistant",
      content: response.content,
      timestamp: new Date(),
    });

    console.log(`[Orchestrator] Orchestration complete (${messages.length} messages)`);
  } catch (error) {
    console.error("[Orchestrator] Error:", error);

    const { addMessage } = useAgentStore.getState();
    addMessage({
      role: "assistant",
      content: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      timestamp: new Date(),
    });
  }
}

/**
 * Export for testing/debugging
 */
export { callGroqAPI, createPortkeyClient };
