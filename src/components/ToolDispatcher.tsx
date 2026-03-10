"use client";

import { useState } from "react";
import { benefitsLookupTool } from "../services/tools";

export function ToolDispatcher() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Benefits lookup state
  const [employeeId, setEmployeeId] = useState("");
  const [benefitsResult, setBenefitsResult] = useState<string | null>(null);

  const handleBenefitsLookup = async () => {
    if (!employeeId.trim()) {
      setError("Please enter an employee ID");
      return;
    }
    setError(null);
    setBenefitsResult(null);
    setIsLoading(true);
    try {
      const result = await benefitsLookupTool.execute({ employee_id: employeeId });
      setBenefitsResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to lookup benefits");
    } finally {
      setIsLoading(false);
    }
  };

  const prettyJSON = (raw: string) => {
    try { return JSON.stringify(JSON.parse(raw), null, 2); }
    catch { return raw; }
  };

  const T = '#dce8d4';
  const B = '#00e5ff';

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {error && (
        <div className="pkd-alert" style={{ color: '#ff4444', borderColor: '#ff4444' }}>
          ⚠ {error}
        </div>
      )}

      {/* Benefits Lookup */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="pkd-heading pkd-heading-3 pkd-text-secondary" style={{ fontSize: '0.875rem' }}>
          ▶ BENEFITS LOOKUP
        </div>
        <div className="pkd-text-mono" style={{ fontSize: '0.75rem', color: T }}>
          Enter an employee ID to retrieve benefits data. Try: EMP001 – EMP004
        </div>
        <label className="pkd-text-mono" style={{ fontSize: '0.75rem', color: T }}>
          EMPLOYEE ID
        </label>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBenefitsLookup()}
          placeholder="e.g., EMP001"
          className="pkd-input"
          style={{ width: '100%', boxSizing: 'border-box' }}
          disabled={isLoading}
        />
        <button
          onClick={handleBenefitsLookup}
          disabled={isLoading}
          className="pkd-button pkd-button-primary"
          style={{ width: '100%', opacity: isLoading ? 0.5 : 1 }}
        >
          {isLoading ? '[ QUERYING... ]' : '[ LOOKUP BENEFITS ]'}
        </button>
        {benefitsResult && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: 'rgba(6,182,212,0.08)',
            border: '1px solid rgba(6,182,212,0.35)',
            borderRadius: '2px',
          }}>
            <div className="pkd-text-mono" style={{ fontSize: '0.75rem', color: B, marginBottom: '0.4rem', letterSpacing: '0.08em' }}>
              ↳ RAW TOOL OUTPUT
            </div>
            <pre style={{
              margin: 0,
              fontSize: '0.875rem',
              color: T,
              fontFamily: 'var(--pkd-font-mono)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {prettyJSON(benefitsResult)}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
}
