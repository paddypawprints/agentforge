/**
 * Portkey Gateway Integration
 * Wraps Groq client with Portkey for:
 * - PII masking (SSN, email, credit card detection)
 * - Cost tracking per turn
 * - Rate limiting
 * - Request/response logging
 *
 * Session 3: Governance & FinOps
 */

export interface PortkeyConfig {
  groqApiKey: string;
  portkeyApiKey: string;
  portkeyBaseUrl?: string;
}

interface CostLog {
  timestamp: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  piiDetected: string[];
}

interface PortkeyLog {
  requestId: string;
  timestamp: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
  piiMasked: {
    ssn: number;
    email: number;
    creditCard: number;
    phone: number;
  };
  rateLimitRemaining: number;
}

// Global state for Portkey logs
let portkeyLogs: PortkeyLog[] = [];
let portkeyEnabled = false;
let portkeyConfig: PortkeyConfig | null = null;

/**
 * Create Portkey-wrapped Groq client
 * In a real implementation, this would use Portkey's SDK
 * For the workshop, we simulate Portkey behavior
 */
export function createPortkeyClient(config: PortkeyConfig): any {
  portkeyConfig = config;
  portkeyEnabled = true;

  console.log("[Portkey] Client created with API key:", config.portkeyApiKey.slice(0, 10) + "...");

  // For now, return a mock client
  // In production, this would wrap with Portkey middleware
  return {
    chat: {
      completions: {
        create: async (params: any) => {
          // Mock implementation - in production this would call Portkey API
          console.log("[Portkey] Intercepting request:", params);
          return {
            choices: [
              {
                finish_reason: "end_turn",
                message: {
                  content: "Mock response from Portkey",
                  tool_calls: [],
                },
              },
            ],
          };
        },
      },
    },
  };
}

/**
 * Simulate Portkey cost calculation
 * Real implementation would get this from Portkey API
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string = "mixtral-8x7b-32768"
): number {
  // Mixtral 8x7B pricing (approximate)
  // Input: $0.27 per 1M tokens
  // Output: $0.81 per 1M tokens
  const inputCost = (inputTokens / 1_000_000) * 0.27;
  const outputCost = (outputTokens / 1_000_000) * 0.81;
  return inputCost + outputCost;
}

/**
 * Detect PII in text
 * Simple regex-based detection for workshop demo
 */
export function detectPII(text: string): {
  ssn: number;
  email: number;
  creditCard: number;
  phone: number;
} {
  const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2}\b/g;
  const creditCardRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;

  return {
    ssn: (text.match(ssnRegex) || []).length,
    email: (text.match(emailRegex) || []).length,
    creditCard: (text.match(creditCardRegex) || []).length,
    phone: (text.match(phoneRegex) || []).length,
  };
}

/**
 * Mask PII in text
 */
export function maskPII(text: string): string {
  let masked = text;

  // Mask SSN
  masked = masked.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "***-**-****");

  // Mask email
  masked = masked.replace(/\b([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Z|a-z]{2})\b/g, "[EMAIL_MASKED]");

  // Mask credit card
  masked = masked.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "****-****-****-****");

  // Mask phone
  masked = masked.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "***-***-****");

  return masked;
}

/**
 * Log a Portkey event (simulated)
 * In production, this would call Portkey API
 */
export function logPortkeyEvent(
  requestId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  content: string
): PortkeyLog {
  const costUSD = calculateCost(inputTokens, outputTokens, model);
  const piiDetected = detectPII(content);

  const log: PortkeyLog = {
    requestId,
    timestamp: new Date(),
    model,
    inputTokens,
    outputTokens,
    costUSD,
    piiMasked: piiDetected,
    rateLimitRemaining: 30, // Simulated
  };

  portkeyLogs.push(log);

  console.log("[Portkey] Event logged:", {
    requestId,
    cost: `$${costUSD.toFixed(4)}`,
    pii: piiDetected,
  });

  return log;
}

/**
 * Get all Portkey logs for the session
 */
export function getPortkeyLogs(): PortkeyLog[] {
  return portkeyLogs;
}

/**
 * Get total cost for the session
 */
export function getTotalCost(): number {
  return portkeyLogs.reduce((sum, log) => sum + log.costUSD, 0);
}

/**
 * Get PII summary for the session
 */
export function getPIISummary(): {
  ssn: number;
  email: number;
  creditCard: number;
  phone: number;
} {
  return portkeyLogs.reduce(
    (sum, log) => ({
      ssn: sum.ssn + log.piiMasked.ssn,
      email: sum.email + log.piiMasked.email,
      creditCard: sum.creditCard + log.piiMasked.creditCard,
      phone: sum.phone + log.piiMasked.phone,
    }),
    { ssn: 0, email: 0, creditCard: 0, phone: 0 }
  );
}

/**
 * Clear all logs (for session reset)
 */
export function clearPortkeyLogs(): void {
  portkeyLogs = [];
  console.log("[Portkey] Logs cleared");
}

/**
 * Toggle Portkey on/off
 */
export function togglePortkey(enabled: boolean): void {
  portkeyEnabled = enabled;
  console.log(`[Portkey] ${enabled ? "Enabled" : "Disabled"}`);
}

/**
 * Check if Portkey is enabled
 */
export function isPortkeyEnabled(): boolean {
  return portkeyEnabled;
}

/**
 * Get Portkey configuration
 */
export function getPortkeyConfig(): PortkeyConfig | null {
  return portkeyConfig;
}

/**
 * Export types for testing
 */
export type { PortkeyLog, CostLog };
