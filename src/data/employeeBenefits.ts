/**
 * Employee Benefits Data
 * Derived from Employee_Benefits_2026.md
 * Used by the benefits_lookup tool for agent orchestration
 */

export interface EmployeeBenefits {
  id: string;
  name: string;
  health_plan: string;
  deductible: number;
  dental_coverage: string;
  vision_coverage: string;
  retirement_match: string;
  pto_days: number;
  wellness_stipend?: number;
}

export const employeeBenefits: Record<string, EmployeeBenefits> = {
  EMP001: {
    id: "EMP001",
    name: "Alice Johnson",
    health_plan: "Premium PPO",
    deductible: 500,
    dental_coverage: "Full Coverage",
    vision_coverage: "Full Coverage",
    retirement_match: "6%",
    pto_days: 25,
    wellness_stipend: 1500,
  },
  EMP002: {
    id: "EMP002",
    name: "Bob Smith",
    health_plan: "Standard HMO",
    deductible: 1000,
    dental_coverage: "Basic Coverage",
    vision_coverage: "Basic Coverage",
    retirement_match: "4%",
    pto_days: 20,
    wellness_stipend: 1000,
  },
  EMP003: {
    id: "EMP003",
    name: "Carol Davis",
    health_plan: "Premium PPO",
    deductible: 500,
    dental_coverage: "Full Coverage",
    vision_coverage: "Full Coverage",
    retirement_match: "8%",
    pto_days: 30,
    wellness_stipend: 2000,
  },
  EMP004: {
    id: "EMP004",
    name: "David Wilson",
    health_plan: "Standard HMO",
    deductible: 1000,
    dental_coverage: "Full Coverage",
    vision_coverage: "Basic Coverage",
    retirement_match: "5%",
    pto_days: 22,
    wellness_stipend: 1200,
  },
  EMP005: {
    id: "EMP005",
    name: "Emma Martinez",
    health_plan: "Premium PPO",
    deductible: 500,
    dental_coverage: "Full Coverage",
    vision_coverage: "Full Coverage",
    retirement_match: "7%",
    pto_days: 28,
    wellness_stipend: 1800,
  },
  EMP006: {
    id: "EMP006",
    name: "Frank Chen",
    health_plan: "Standard HMO",
    deductible: 1000,
    dental_coverage: "Basic Coverage",
    vision_coverage: "Basic Coverage",
    retirement_match: "4%",
    pto_days: 20,
    wellness_stipend: 1000,
  },
};

/**
 * Helper function to look up employee benefits by ID
 * @param employeeId - The employee ID to look up
 * @returns The employee benefits object or undefined if not found
 */
export function getBenefitsByEmployeeId(
  employeeId: string
): EmployeeBenefits | undefined {
  return employeeBenefits[employeeId];
}

/**
 * Helper function to get all employee IDs
 * @returns Array of all employee IDs
 */
export function getAllEmployeeIds(): string[] {
  return Object.keys(employeeBenefits);
}

/**
 * Helper function to get all employees
 * @returns Array of all employee benefits objects
 */
export function getAllEmployees(): EmployeeBenefits[] {
  return Object.values(employeeBenefits);
}
