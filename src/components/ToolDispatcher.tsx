"use client";

import { useState } from "react";
import { useAgentStore } from "../store/agentStore";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { benefitsLookup, salaryCalc } from "../services/tools";

interface ToolDispatcherProps {
  className?: string;
}

export function ToolDispatcher({ className }: ToolDispatcherProps) {
  const { addMessage, isLoading, setLoading } = useAgentStore();
  const [error, setError] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [bonusPercentage, setBonusPercentage] = useState("");

  const handleBenefitsLookup = async () => {
    if (!employeeId.trim()) {
      setError("Please enter an employee ID");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Add user message
      addMessage({
        role: "user",
        content: `Look up benefits for employee ${employeeId}`,
        timestamp: new Date(),
      });

      // Execute tool
      const result = await benefitsLookup(employeeId);

      // Add tool result message
      addMessage({
        role: "assistant",
        content: JSON.stringify(result),
        timestamp: new Date(),
        toolCall: {
          id: "benefits_" + Date.now(),
          name: "benefits_lookup",
          input: { employee_id: employeeId },
          status: "completed",
        },
      });

      console.log("Benefits lookup result:", result);
      setEmployeeId("");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to lookup benefits";
      setError(errorMsg);
      addMessage({
        role: "assistant",
        content: `Error: ${errorMsg}`,
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalaryCalculation = async () => {
    if (!baseSalary.trim() || !bonusPercentage.trim()) {
      setError("Please enter both base salary and bonus percentage");
      return;
    }

    const salary = parseFloat(baseSalary);
    const bonus = parseFloat(bonusPercentage);

    if (isNaN(salary) || isNaN(bonus)) {
      setError("Please enter valid numbers");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Add user message
      addMessage({
        role: "user",
        content: `Calculate salary with base $${salary} and ${bonus}% bonus`,
        timestamp: new Date(),
      });

      // Execute tool
      const result = await salaryCalc(salary, bonus);

      // Add tool result message
      addMessage({
        role: "assistant",
        content: JSON.stringify(result),
        timestamp: new Date(),
        toolCall: {
          id: "salary_" + Date.now(),
          name: "salary_calc",
          input: { base_salary: salary, bonus_percentage: bonus },
          status: "completed",
        },
      });

      console.log("Salary calculation result:", result);
      setBaseSalary("");
      setBonusPercentage("");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to calculate salary";
      setError(errorMsg);
      addMessage({
        role: "assistant",
        content: `Error: ${errorMsg}`,
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("space-y-4 p-4 border rounded-lg bg-card", className)}>
      <h2 className="text-lg font-semibold">Tool Dispatcher</h2>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Benefits Lookup Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Employee ID</label>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="e.g., EMP001"
          className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
          disabled={isLoading}
        />
        <Button
          onClick={handleBenefitsLookup}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Loading..." : "Lookup Benefits"}
        </Button>
      </div>

      <div className="border-t pt-4">
        {/* Salary Calculation Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Base Salary ($)</label>
          <input
            type="number"
            value={baseSalary}
            onChange={(e) => setBaseSalary(e.target.value)}
            placeholder="e.g., 100000"
            className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
            disabled={isLoading}
          />

          <label className="block text-sm font-medium mt-3">Bonus Percentage (%)</label>
          <input
            type="number"
            value={bonusPercentage}
            onChange={(e) => setBonusPercentage(e.target.value)}
            placeholder="e.g., 10"
            className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
            disabled={isLoading}
          />

          <Button
            onClick={handleSalaryCalculation}
            disabled={isLoading}
            className="w-full mt-3"
          >
            {isLoading ? "Loading..." : "Calculate Salary"}
          </Button>
        </div>
      </div>
    </div>
  );
}
