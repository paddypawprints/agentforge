import { McpTrace } from "../services/tools";

/**
 * Agent Orchestration Types
 * 
 * Defines the core types for message history, tool calls, and tool execution
 * in the agent orchestration system.
 */

/**
 * Message role type for agent communication
 * - 'user' / 'assistant' / 'tool': standard conversation roles sent to the LLM
 * - 'status': UI-only event (not sent to LLM) — shows orchestration steps
 */
export type MessageRole = 'user' | 'assistant' | 'tool' | 'status';

/**
 * Tool call status during execution
 */
export type ToolCallStatus = 'pending' | 'executing' | 'completed' | 'failed';

/**
 * Represents a single message in the conversation history
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;
  
  /** Role of the message sender */
  role: MessageRole;
  
  /** Content of the message */
  content: string;
  
  /** Timestamp when the message was created */
  timestamp: Date;
  
  /** Optional tool call associated with this message (for assistant messages) */
  toolCall?: ToolCall;

  /** For tool-result messages: the ID of the tool call being responded to */
  tool_call_id?: string;
}

/**
 * Represents a tool invocation request
 */
export interface ToolCall {
  /** Unique identifier for this tool call */
  id: string;
  
  /** Name of the tool being invoked */
  name: string;
  
  /** Input parameters for the tool (as JSON object) */
  input: Record<string, unknown>;
  
  /** Current status of the tool call execution */
  status: ToolCallStatus;
  
  /** Optional error message if the tool call failed */
  error?: string;
  
  /** Optional result from tool execution */
  result?: string;
}

/**
 * JSON Schema for tool input validation
 */
export interface InputSchema {
  /** JSON Schema type */
  type: string;
  
  /** Schema properties */
  properties: Record<string, unknown>;
  
  /** Required properties */
  required?: string[];
  
  /** Additional schema metadata */
  [key: string]: unknown;
}

/**
 * Represents a tool that can be invoked by the agent
 */
export interface Tool {
  /** Name of the tool */
  name: string;
  
  /** Human-readable description of what the tool does */
  description: string;
  
  /** JSON Schema describing the tool's input parameters */
  inputSchema: InputSchema;
  
  /**
   * Execute the tool with the given input
   * @param input The input parameters for the tool
   * @returns A promise that resolves to the tool result as a string
   */
  execute: (input: Record<string, unknown>) => Promise<string>;

  /** Set by an MCP tool while execute runs, then copied onto the round. */
  mcpTrace?: McpTrace;
}

/**
 * Represents the result of a tool execution
 */
export interface ToolResult {
  /** ID of the tool call that produced this result */
  toolCallId: string;
  
  /** Name of the tool that was executed */
  toolName: string;
  
  /** The result content as a string */
  content: string;
  
  /** Whether the tool execution was successful */
  success: boolean;
  
  /** Optional error message if execution failed */
  error?: string;
  
  /** Timestamp when the result was generated */
  timestamp: Date;
}

/**
 * Source label for every message in the prompt array.
 * Replaces the old index-position hack for identifying memory vs user vs tool messages.
 */
export type PromptMessageSource =
  | 'system'
  | 'chatbot'           // the chatbot's own prompt
  | 'memory_user'       // injected from conversation memory — user half
  | 'memory_assistant'  // injected from conversation memory — assistant half
  | 'user'              // current user query
  | 'assistant'         // LLM text response (stop finish_reason)
  | 'tool_call'         // LLM requested a tool (assistant turn with tool_calls)
  | 'tool_response'     // tool result injected back into context
  | 'plan'              // the planner's plan, sent with the loop that follows
  | 'worker'            // the worker prompt for the current task
  | 'task'              // task memory, or the current task instruction
  | 'summary'           // the summarizer prompt
  | 'embedded_tool';    // description of a tool written in this app

/**
 * A single message in the typed prompt representation.
 * Convert to chat-completions wire format with toWire() before sending.
 */
export type PromptMessage = {
  source: PromptMessageSource;
  text: string;
  toolName?: string;
  toolCallId?: string;
  toolInput?: Record<string, unknown>;
  toolCalls?: any[];   // raw tool_calls array, needed for toWire()
};

/**
 * One round of the agent loop: what was compiled and sent, what came back,
 * and (if a tool was called) the tool result.
 */
export interface Round {
  request: PromptMessage[];
  finish_reason: 'stop' | 'tool_calls';
  text: string | null;
  toolName?: string;
  toolInput?: Record<string, unknown>;
  toolResult?: string;
  /** Present when the tool ran on an MCP server. */
  mcp?: McpTrace;
  /** `agent` chooses the route. `plan` lists tasks. `task` is a worker call. `summary` writes the reply. `loop` is a chatbot tool round. */
  step?: 'agent' | 'plan' | 'task' | 'summary' | 'loop';
  /** The choice object returned by the model, before this app rewrites it. */
  response?: unknown;
  /** The JSON body posted for this call: every message, and tools when they were sent. */
  sent?: unknown;
}

/**
 * The complete result of one user turn — returned directly by orchestrate()
 * and sendMessage() rather than being pushed through a store.
 */
export interface Exchange {
  userQuery: string;
  rounds: Round[];
  finalAnswer: string;
}

/**
 * Agent orchestration state
 */
export interface AgentState {
  /** Array of messages in the conversation history */
  messages: Message[];
  
  /** Available tools for the agent */
  tools: Tool[];
  
  /** Current tool calls in progress */
  activeToolCalls: ToolCall[];
  
  /** Whether the agent is currently processing */
  isProcessing: boolean;
}
