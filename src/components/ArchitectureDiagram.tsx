export function ArchitectureDiagram() {
  // SVG presentation attributes don't support CSS var() — hex values kept in sync with Alpine Spring tokens
  const G = '#2d6a4f'; // --pkd-primary  (alpine forest green)
  const B = '#2a7fa5'; // --pkd-secondary (glacier blue)
  const A = '#92400e'; // --pkd-warning  (golden rod)
  const bg = '#f7f5f0'; // --pkd-background
  const border = '#d4d8ce'; // --pkd-border-color
  const mono = "'JetBrains Mono', 'ui-monospace', monospace";

  return (
    <svg
      viewBox="0 0 640 300"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '6px' }}
      aria-label="Agent architecture: UI → Orchestrator ↔ Groq API, Orchestrator ↔ Tool"
    >
      {/* Background */}
      <rect x="0" y="0" width="640" height="300" fill={bg} rx="6" />

      <defs>
        <marker id="arch-ag" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill={G} />
        </marker>
        <marker id="arch-ab" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill={B} />
        </marker>
        <marker id="arch-aa" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
          <polygon points="0 0, 7 3.5, 0 7" fill={A} />
        </marker>
      </defs>

      {/* ── BOXES ──────────────────────────────────────── */}

      {/* MessageComposer (warning/amber, top-left) */}
      <rect x="15" y="20" width="155" height="42" fill="rgba(146,64,14,0.07)" stroke={A} strokeWidth="1.5" rx="5" />
      <text x="92" y="37" textAnchor="middle" fill={A} fontFamily={mono} fontSize="10" fontWeight="bold" letterSpacing="0">MessageComposer</text>
      <text x="92" y="52" textAnchor="middle" fill="rgba(146,64,14,0.55)" fontFamily={mono} fontSize="9">UI · user input</text>

      {/* MessageHistory (warning/amber, bottom-left) */}
      <rect x="15" y="238" width="155" height="42" fill="rgba(146,64,14,0.07)" stroke={A} strokeWidth="1.5" rx="5" />
      <text x="92" y="255" textAnchor="middle" fill={A} fontFamily={mono} fontSize="10" fontWeight="bold" letterSpacing="0">MessageHistory</text>
      <text x="92" y="270" textAnchor="middle" fill="rgba(146,64,14,0.55)" fontFamily={mono} fontSize="9">UI · trace view</text>

      {/* ORCHESTRATOR (primary/green, center) */}
      <rect x="228" y="119" width="185" height="48" fill="rgba(45,106,79,0.08)" stroke={G} strokeWidth="2" rx="5" />
      <text x="320" y="138" textAnchor="middle" fill={G} fontFamily={mono} fontSize="11" fontWeight="bold" letterSpacing="1">ORCHESTRATOR</text>
      <text x="320" y="154" textAnchor="middle" fill="rgba(45,106,79,0.6)" fontFamily={mono} fontSize="8.5">orchestrator.ts · owns the loop</text>

      {/* GROQ API (secondary/blue, top-right) */}
      <rect x="480" y="119" width="145" height="48" fill="rgba(42,127,165,0.07)" stroke={B} strokeWidth="1.5" rx="5" />
      <text x="552" y="138" textAnchor="middle" fill={B} fontFamily={mono} fontSize="10" fontWeight="bold" letterSpacing="0.5">MODEL</text>
      <text x="552" y="154" textAnchor="middle" fill="rgba(42,127,165,0.6)" fontFamily={mono} fontSize="9">Groq · LLM inference</text>

      {/* benefits_lookup (secondary/blue, bottom-center-right) */}
      <rect x="290" y="238" width="160" height="42" fill="rgba(42,127,165,0.07)" stroke={B} strokeWidth="1.5" rx="5" />
      <text x="370" y="255" textAnchor="middle" fill={B} fontFamily={mono} fontSize="10" fontWeight="bold" letterSpacing="0">benefits_lookup</text>
      <text x="370" y="270" textAnchor="middle" fill="rgba(42,127,165,0.6)" fontFamily={mono} fontSize="9">tool · tools.ts</text>

      {/* ── ARROWS ─────────────────────────────────────── */}

      {/* 1 · MessageComposer → ORCHESTRATOR */}
      <line x1="170" y1="41" x2="227" y2="133" stroke={A} strokeWidth="1.5" markerEnd="url(#arch-aa)" />
      <text x="210" y="79" textAnchor="start" fill={A} fontFamily={mono} fontSize="8.5">orchestrate(msg)</text>

      {/* 2 · ORCHESTRATOR → MessageHistory (via Zustand store) */}
      <line x1="228" y1="153" x2="170" y2="237" stroke={A} strokeWidth="1.5" markerEnd="url(#arch-aa)" />
      <text x="192" y="198" textAnchor="middle" fill={A} fontFamily={mono} fontSize="8.5">addMessage()</text>
      <text x="192" y="210" textAnchor="middle" fill="rgba(146,64,14,0.5)" fontFamily={mono} fontSize="8">[Zustand store]</text>

      {/* 3a · ORCHESTRATOR → GROQ: messages[] */}
      <line x1="413" y1="136" x2="479" y2="136" stroke={G} strokeWidth="1.5" markerEnd="url(#arch-ag)" />
      <text x="446" y="112" textAnchor="middle" fill={G} fontFamily={mono} fontSize="8.5">messages[ ]</text>

      {/* 3b · GROQ → ORCHESTRATOR: response */}
      <line x1="479" y1="150" x2="413" y2="150" stroke={B} strokeWidth="1.5" markerEnd="url(#arch-ab)" />
      <text x="446" y="180" textAnchor="middle" fill={B} fontFamily={mono} fontSize="8">finish_reason: stop | tool_calls</text>

      {/* 4a · ORCHESTRATOR → benefits_lookup: call tool */}
      <line x1="355" y1="167" x2="355" y2="237" stroke={G} strokeWidth="1.5" markerEnd="url(#arch-ag)" />
      <text x="361" y="208" textAnchor="start" fill={G} fontFamily={mono} fontSize="8.5">call tool</text>

      {/* 4b · benefits_lookup → ORCHESTRATOR: JSON result */}
      <line x1="335" y1="237" x2="335" y2="167" stroke={B} strokeWidth="1.5" markerEnd="url(#arch-ab)" />
      <text x="329" y="208" textAnchor="end" fill={B} fontFamily={mono} fontSize="8.5">JSON result</text>

      {/* loop hint */}
      <text x="500" y="208" textAnchor="middle" fill="rgba(45,106,79,0.45)" fontFamily={mono} fontSize="8">↻ loops until stop</text>
    </svg>
  );
}

