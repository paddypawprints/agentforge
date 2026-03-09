// Mock employee benefits data from Employee_Benefits_2026.md
const employeeBenefitsData: Record<string, Record<string, string | number>> = {
  EMP001: {
    name: "Alice Johnson",
    health_insurance: "Premium PPO",
    dental: "Full Coverage",
    vision: "Full Coverage",
    retirement_match: "6%",
    pto_days: 25,
    wellness_stipend: 1500,
  },
  EMP002: {
    name: "Bob Smith",
    health_insurance: "Standard HMO",
    dental: "Basic Coverage",
    vision: "Basic Coverage",
    retirement_match: "4%",
    pto_days: 20,
    wellness_stipend: 1000,
  },
  EMP003: {
    name: "Carol Davis",
    health_insurance: "Premium PPO",
    dental: "Full Coverage",
    vision: "Full Coverage",
    retirement_match: "8%",
    pto_days: 30,
    wellness_stipend: 2000,
  },
  EMP004: {
    name: "David Wilson",
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

export interface Tool {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  execute: (input: Record<string, unknown>) => Promise<string>;
}

// Benefits Lookup Tool
export const benefitsLookupTool: Tool = {
  name: "benefits_lookup",
  description:
    "Look up employee benefits information by employee ID. Returns a summary of health insurance, dental, vision, retirement match, PTO days, and wellness stipend.",
  inputSchema: {
    type: "object",
    properties: {
      employee_id: {
        type: "string",
        description: "The unique employee ID (e.g., EMP001)",
      },
    },
    required: ["employee_id"],
  },
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

// Salary Calculator Tool
export const salaryCalcTool: Tool = {
  name: "salary_calc",
  description:
    "Calculate total compensation based on base salary and bonus percentage. Returns base salary, bonus amount, and total compensation.",
  inputSchema: {
    type: "object",
    properties: {
      base_salary: {
        type: "number",
        description: "The base annual salary in USD",
      },
      bonus_percentage: {
        type: "number",
        description: "The bonus percentage (e.g., 15 for 15%)",
      },
    },
    required: ["base_salary", "bonus_percentage"],
  },
  execute: async (input: Record<string, unknown>): Promise<string> => {
    const startTime = performance.now();
    const baseSalary = input.base_salary as number;
    const bonusPercentage = input.bonus_percentage as number;

    console.log(
      `[salary_calc] Invoked with base_salary: ${baseSalary}, bonus_percentage: ${bonusPercentage}%`
    );

    // Validate inputs
    if (typeof baseSalary !== "number" || baseSalary < 0) {
      const result = JSON.stringify({
        success: false,
        error: "base_salary must be a non-negative number",
      });
      const duration = performance.now() - startTime;
      console.log(
        `[salary_calc] Completed in ${duration.toFixed(2)}ms with validation error`
      );
      return result;
    }

    if (typeof bonusPercentage !== "number" || bonusPercentage < 0) {
      const result = JSON.stringify({
        success: false,
        error: "bonus_percentage must be a non-negative number",
      });
      const duration = performance.now() - startTime;
      console.log(
        `[salary_calc] Completed in ${duration.toFixed(2)}ms with validation error`
      );
      return result;
    }

    const bonusAmount = baseSalary * (bonusPercentage / 100);
    const totalCompensation = baseSalary + bonusAmount;

    const result = JSON.stringify({
      success: true,
      base_salary: baseSalary,
      bonus_percentage: bonusPercentage,
      bonus_amount: bonusAmount,
      total_compensation: totalCompensation,
    });

    const duration = performance.now() - startTime;
    console.log(
      `[salary_calc] Completed in ${duration.toFixed(2)}ms with success`
    );

    return result;
  },
};

// Export all tools as an array for easy iteration
export const allTools: Tool[] = [benefitsLookupTool, salaryCalcTool];

// Helper function to get a tool by name
export function getToolByName(name: string): Tool | undefined {
  return allTools.find((tool) => tool.name === name);
}

// Convenience functions for direct tool invocation
export async function benefitsLookup(employeeId: string): Promise<Record<string, unknown>> {
  const result = await benefitsLookupTool.execute({ employee_id: employeeId });
  return JSON.parse(result);
}

export async function salaryCalc(baseSalary: number, bonusPercentage: number): Promise<Record<string, unknown>> {
  const result = await salaryCalcTool.execute({ base_salary: baseSalary, bonus_percentage: bonusPercentage });
  return JSON.parse(result);
}
