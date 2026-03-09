import React, { useEffect, useState } from "react";
import { getPortkeyLogs, getTotalCost, getPIISummary, isPortkeyEnabled } from "../services/portkey";
import { PortkeyLog } from "../services/portkey";

/**
 * CostMonitor Component
 * Displays Portkey gateway logs for Session 3: Governance & FinOps
 * Shows:
 * - Cost per turn
 * - Total cost for session
 * - PII masking events
 * - Rate limit status
 */
export function CostMonitor() {
  const [logs, setLogs] = useState<PortkeyLog[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [piiSummary, setPiiSummary] = useState({ ssn: 0, email: 0, creditCard: 0, phone: 0 });
  const [expanded, setExpanded] = useState(false);

  // Update logs every time component renders
  useEffect(() => {
    const updateLogs = () => {
      setLogs(getPortkeyLogs());
      setTotalCost(getTotalCost());
      setPiiSummary(getPIISummary());
    };

    updateLogs();

    // Poll for updates every 500ms
    const interval = setInterval(updateLogs, 500);
    return () => clearInterval(interval);
  }, []);

  if (!isPortkeyEnabled()) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Portkey gateway is disabled. Enable it in Session 3 to see cost monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Card */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Cost Monitor</h3>
            <p className="mt-1 text-xs text-muted-foreground">Portkey Gateway - Session 3</p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
          >
            {expanded ? "Hide" : "Show"} Details
          </button>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {/* Total Cost */}
          <div className="rounded bg-muted p-3">
            <p className="text-xs text-muted-foreground">Total Cost</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              ${totalCost.toFixed(4)}
            </p>
          </div>

          {/* Requests */}
          <div className="rounded bg-muted p-3">
            <p className="text-xs text-muted-foreground">Requests</p>
            <p className="mt-1 text-lg font-bold text-foreground">{logs.length}</p>
          </div>

          {/* PII Detected */}
          <div className="rounded bg-muted p-3">
            <p className="text-xs text-muted-foreground">PII Masked</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {piiSummary.ssn + piiSummary.email + piiSummary.creditCard + piiSummary.phone}
            </p>
          </div>

          {/* Rate Limit */}
          <div className="rounded bg-muted p-3">
            <p className="text-xs text-muted-foreground">Rate Limit</p>
            <p className="mt-1 text-lg font-bold text-foreground">
              {logs.length > 0 ? logs[logs.length - 1].rateLimitRemaining : 30}/30
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Logs */}
      {expanded && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="mb-3 text-sm font-semibold text-foreground">Request Logs</h4>

          {logs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No requests yet</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log, idx) => (
                <div key={idx} className="rounded border border-border/50 bg-muted/50 p-3">
                  {/* Request Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp instanceof Date ? log.timestamp.toLocaleTimeString() : log.timestamp}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">
                      ${log.costUSD.toFixed(4)}
                    </span>
                  </div>

                  {/* Request Details */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Model:</span>
                      <span className="ml-1 font-mono text-foreground">{log.model}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tokens:</span>
                      <span className="ml-1 font-mono text-foreground">
                        {log.inputTokens} in, {log.outputTokens} out
                      </span>
                    </div>
                  </div>

                  {/* PII Detection */}
                  {(log.piiMasked.ssn > 0 ||
                    log.piiMasked.email > 0 ||
                    log.piiMasked.creditCard > 0 ||
                    log.piiMasked.phone > 0) && (
                    <div className="mt-2 rounded bg-yellow-500/10 p-2">
                      <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                        PII Detected & Masked:
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {log.piiMasked.ssn > 0 && (
                          <span className="rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-700 dark:text-yellow-400">
                            SSN ×{log.piiMasked.ssn}
                          </span>
                        )}
                        {log.piiMasked.email > 0 && (
                          <span className="rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-700 dark:text-yellow-400">
                            Email ×{log.piiMasked.email}
                          </span>
                        )}
                        {log.piiMasked.creditCard > 0 && (
                          <span className="rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-700 dark:text-yellow-400">
                            Card ×{log.piiMasked.creditCard}
                          </span>
                        )}
                        {log.piiMasked.phone > 0 && (
                          <span className="rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-700 dark:text-yellow-400">
                            Phone ×{log.piiMasked.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PII Summary */}
      {(piiSummary.ssn > 0 ||
        piiSummary.email > 0 ||
        piiSummary.creditCard > 0 ||
        piiSummary.phone > 0) && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
          <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
            Session PII Summary
          </h4>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            {piiSummary.ssn > 0 && (
              <div>
                <p className="text-muted-foreground">SSN Masked</p>
                <p className="mt-1 font-bold text-yellow-700 dark:text-yellow-400">
                  {piiSummary.ssn}
                </p>
              </div>
            )}
            {piiSummary.email > 0 && (
              <div>
                <p className="text-muted-foreground">Email Masked</p>
                <p className="mt-1 font-bold text-yellow-700 dark:text-yellow-400">
                  {piiSummary.email}
                </p>
              </div>
            )}
            {piiSummary.creditCard > 0 && (
              <div>
                <p className="text-muted-foreground">Cards Masked</p>
                <p className="mt-1 font-bold text-yellow-700 dark:text-yellow-400">
                  {piiSummary.creditCard}
                </p>
              </div>
            )}
            {piiSummary.phone > 0 && (
              <div>
                <p className="text-muted-foreground">Phones Masked</p>
                <p className="mt-1 font-bold text-yellow-700 dark:text-yellow-400">
                  {piiSummary.phone}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
