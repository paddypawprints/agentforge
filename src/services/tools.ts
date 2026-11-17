/*
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  tools.ts  —  THE TOOLS                                          ║
 * ║                                                                  ║
 * ║  This file defines what tools the agent can use.  Each tool     ║
 * ║  has two parts:                                                  ║
 * ║                                                                  ║
 * ║    1. A JSON schema  — describes the tool and its parameters     ║
 * ║       to the LLM.  The LLM reads this and decides when to call   ║
 * ║       the tool and what arguments to pass.  It never sees the    ║
 * ║       execute() code — only the description and parameter spec.  ║
 * ║                                                                  ║
 * ║    2. An execute() function  — the actual code that runs when    ║
 * ║       the tool is called (by you manually in step 3, or          ║
 * ║       automatically by the agent in step 6).                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

/* ═══════════════════════════════════════════════════════════════════
 * THE DATABASE
 *
 * This is the mock employee benefits database the tool queries.
 * In a real system this would be a database call, an internal API,
 * or a file read.  For the workshop it is an in-memory object.
 * ═══════════════════════════════════════════════════════════════════ */
// Mock employee benefits data from Employee_Benefits_2026.md
export const employeeBenefitsData: Record<string, Record<string, string | number>> = {
  EMP001: {
    name: "Alice Johnson",
    ssn: "101-00-0001",
    health_insurance: "Premium PPO",
    dental: "Full Coverage",
    vision: "Full Coverage",
    retirement_match: "6%",
    pto_days: 25,
    wellness_stipend: 1500,
  },
  EMP002: {
    name: "Bob Smith",
    ssn: "101-00-0002",
    health_insurance: "Standard HMO",
    dental: "Basic Coverage",
    vision: "Basic Coverage",
    retirement_match: "4%",
    pto_days: 20,
    wellness_stipend: 1000,
  },
  EMP003: {
    name: "Carol Davis",
    ssn: "101-00-0003",
    health_insurance: "Premium PPO",
    dental: "Full Coverage",
    vision: "Full Coverage",
    retirement_match: "8%",
    pto_days: 30,
    wellness_stipend: 2000,
  },
  EMP004: {
    name: "David Wilson",
    ssn: "101-00-0004",
    health_insurance: "Standard HMO",
    dental: "Full Coverage",
    vision: "Basic Coverage",
    retirement_match: "5%",
    pto_days: 22,
    wellness_stipend: 1200,
  },
};

// Tool interface definitions
export interface ToolInputSchema {
  type: string;
  properties: Record<string, unknown>;
  required: string[];
}

/** The JSON-RPC exchange behind one MCP tool call. */
export interface McpTrace {
  server: string;
  transport: string;
  request: unknown;
  response: unknown;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  execute: (input: Record<string, unknown>) => Promise<string>;
  /** Set by an MCP tool while execute runs, then copied onto the round. */
  mcpTrace?: McpTrace;
}

/* ═══════════════════════════════════════════════════════════════════
 * EXERCISE STEP 3 — THE TOOL DEFINITION
 *
 * `benefitsLookupTool` is the tool object passed to the LLM on every
 * orchestrator call.  It has two parts:
 *
 *   inputSchema  —  JSON Schema describing the tool to the LLM.
 *                   The LLM reads this to know the tool exists, what
 *                   it does, and what arguments to include.
 *                   The LLM never sees the execute() code.
 *
 *   execute()    —  The function that actually runs when the tool is
 *                   called.  Takes the arguments the LLM chose as input,
 *                   and returns a JSON string.  You can call this directly
 *                   in the Tool Dispatcher sandbox (step 3), and the
 *                   agent calls it automatically in step 6.
 * ═══════════════════════════════════════════════════════════════════ */
const BENEFITS_DESCRIPTION =
  "Look up employee benefits information by employee ID. Returns a summary of health insurance, dental, vision, retirement match, PTO days, and wellness stipend.";

export const BENEFITS_PARAMETERS: ToolInputSchema = {
  type: "object",
  properties: {
    employee_id: {
      type: "string",
      description: "The unique employee ID (e.g., EMP001)",
    },
  },
  required: ["employee_id"],
};

/** The tool prompt. The box edits this JSON, and the message includes it as JSON. */
export function formatToolPrompt(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) return "";
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object") return JSON.stringify(parsed, null, 2);
  } catch {
    /* Prose is wrapped into the tool prompt object. */
  }
  return JSON.stringify(
    { name: "benefits_lookup", description: trimmed, parameters: BENEFITS_PARAMETERS },
    null,
    2,
  );
}

function toolFields(description: string): { description: string; parameters: ToolInputSchema } {
  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed === "object") {
      const prompt = parsed as { description?: unknown; parameters?: ToolInputSchema };
      return {
        description: typeof prompt.description === "string" ? prompt.description : description,
        parameters: prompt.parameters?.type ? prompt.parameters : BENEFITS_PARAMETERS,
      };
    }
  } catch {
    /* The box is prose, so the schema stays the built-in one. */
  }
  return { description, parameters: BENEFITS_PARAMETERS };
}

export const DEFAULT_EMBEDDED_TOOL_DESCRIPTION = formatToolPrompt(BENEFITS_DESCRIPTION);

let runtimeToolDescription = DEFAULT_EMBEDDED_TOOL_DESCRIPTION;

/** The description included in the message to the model, and on the tool schema. */
export function getEmbeddedToolDescription(): string {
  return runtimeToolDescription;
}

export function setEmbeddedToolDescription(value: string) {
  runtimeToolDescription = value;
}

export function getDefaultEmbeddedToolDescription(): string {
  return DEFAULT_EMBEDDED_TOOL_DESCRIPTION;
}

/** The tool the model is offered. The JSON prompt supplies the description and parameters. */
export function withEmbeddedToolDescription(tool: Tool): Tool {
  if (tool.name !== "benefits_lookup") return tool;
  const fields = toolFields(runtimeToolDescription);
  return { ...tool, description: fields.description, inputSchema: fields.parameters };
}
export const benefitsLookupTool: Tool = {
  name: "benefits_lookup",
  description: BENEFITS_DESCRIPTION,
  inputSchema: BENEFITS_PARAMETERS,
  execute: async (input: Record<string, unknown>): Promise<string> => {
    const startTime = performance.now();
    const employeeId = input.employee_id as string;

    console.log(`[benefits_lookup] Invoked with employee_id: ${employeeId}`);

    const benefits = employeeBenefitsData[employeeId];

    if (!benefits) {
      const result = JSON.stringify({
        success: false,
        error: `Employee ID ${employeeId} not found in benefits database`,
        available_ids: Object.keys(employeeBenefitsData),
      });
      const duration = performance.now() - startTime;
      console.log(
        `[benefits_lookup] Completed in ${duration.toFixed(2)}ms with error`
      );
      return result;
    }

    const result = JSON.stringify({
      success: true,
      employee_id: employeeId,
      benefits: benefits,
    });

    const duration = performance.now() - startTime;
    console.log(
      `[benefits_lookup] Completed in ${duration.toFixed(2)}ms with success`
    );

    return result;
  },
};

/* ═══════════════════════════════════════════════════════════════════
 * TOOL REGISTRY
 *
 * allTools is the array passed to orchestrate() and forwarded to the
 * LLM as tool definitions on every call.  Add new tools here to make
 * them available to the agent.  The LLM will see all of them and
 * decide which (if any) to call based on the user's question.
 * ═══════════════════════════════════════════════════════════════════ */
// Export all tools as an array for easy iteration
export const allTools: Tool[] = [benefitsLookupTool];

// Helper function to get a tool by name
export function getToolByName(name: string): Tool | undefined {
  return allTools.find((tool) => tool.name === name);
}

// Convenience functions for direct tool invocation
export async function benefitsLookup(employeeId: string): Promise<Record<string, unknown>> {
  const result = await benefitsLookupTool.execute({ employee_id: employeeId });
  return JSON.parse(result);
}


