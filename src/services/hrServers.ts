import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

type Row = Record<string, string | number>;

export const SALARY: Record<string, Row> = {
  EMP001: { name: "Alice Johnson", base_pay: 145000, bonus_percent: 15, band: "L5" },
  EMP002: { name: "Bob Smith", base_pay: 98000, bonus_percent: 8, band: "L3" },
  EMP003: { name: "Carol Davis", base_pay: 172000, bonus_percent: 20, band: "L6" },
  EMP004: { name: "David Wilson", base_pay: 112000, bonus_percent: 10, band: "L4" },
};

export const RETIREMENT: Record<string, Row> = {
  EMP001: { name: "Alice Johnson", current_age: 46, plan: "401(k)", employee_contribution: "6%", employer_match: "6%", vested_balance: 84200 },
  EMP002: { name: "Bob Smith", current_age: 34, plan: "401(k)", employee_contribution: "4%", employer_match: "4%", vested_balance: 31000 },
  EMP003: { name: "Carol Davis", current_age: 54, plan: "401(k)", employee_contribution: "10%", employer_match: "8%", vested_balance: 156000 },
  EMP004: { name: "David Wilson", current_age: 41, plan: "401(k)", employee_contribution: "5%", employer_match: "5%", vested_balance: 47800 },
};

function lookup(table: Record<string, Row>, employeeId: string): string {
  const row = table[employeeId];
  if (!row) {
    return JSON.stringify({
      error: `Employee ${employeeId} was not found.`,
      available_ids: Object.keys(table),
    });
  }
  return JSON.stringify({ employee_id: employeeId, ...row });
}

function lookupByName(table: Record<string, Row>, name: string): string {
  const query = name.trim().toLowerCase();
  const names = Object.values(table).map((row) => String(row.name));
  if (!query) {
    return JSON.stringify({ error: "A name is required.", available_names: names });
  }
  const matches = Object.entries(table)
    .filter(([, row]) => String(row.name).toLowerCase().includes(query))
    .map(([employee_id]) => ({ employee_id }));
  if (!matches.length) {
    return JSON.stringify({
      error: `No employee named ${name.trim()} was found.`,
      available_names: names,
    });
  }
  return JSON.stringify({ matches });
}

/** Salary tools. Runs in the page, not on a network server. */
export function createSalaryServer(): McpServer {
  const server = new McpServer({ name: "salary", version: "1.0.0" });
  server.registerTool(
    "salary_lookup",
    {
      description: "Look up one employee's salary: base pay, bonus percent, and band.",
      inputSchema: { employee_id: z.string().describe("Employee id, for example EMP001") },
    },
    async ({ employee_id }) => ({
      content: [{ type: "text", text: lookup(SALARY, employee_id) }],
    }),
  );
  server.registerTool(
    "employee_lookup",
    {
      description: "Look up employees by name and return each match's employee id. A partial name matches, for example Alice or Johnson.",
      inputSchema: { name: z.string().describe("Employee name, for example Alice Johnson") },
    },
    async ({ name }) => ({
      content: [{ type: "text", text: lookupByName(SALARY, name) }],
    }),
  );
  return server;
}

/** Retirement tools. Runs in the page, not on a network server. */
export function createRetirementServer(): McpServer {
  const server = new McpServer({ name: "retirement", version: "1.0.0" });
  server.registerTool(
    "retirement_lookup",
    {
      description: "Look up one employee's retirement account: current age, plan, contribution, match, and vested balance.",
      inputSchema: { employee_id: z.string().describe("Employee id, for example EMP001") },
    },
    async ({ employee_id }) => ({
      content: [{ type: "text", text: lookup(RETIREMENT, employee_id) }],
    }),
  );
  return server;
}
