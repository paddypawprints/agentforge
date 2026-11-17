export function ArchitectureDiagram() {
  const title = "var(--pkd-font-mono)";
  return (
    <svg
      viewBox="0 0 560 360"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="The user sends a message to the harness and reads the answer. Memory sends prior turns and stores this turn. Grounding is the document the harness inserts. The harness calls the model, an embedded tool in the page, and MCP in the page."
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <defs>
        <marker id="af-arch-primary" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" fill="var(--pkd-primary)" />
        </marker>
        <marker id="af-arch-secondary" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" fill="var(--pkd-secondary)" />
        </marker>
      </defs>

      <Box x={8} y={8} w={140} h={52} tone="secondary" titleFont={title} label="GROUNDING" detail="the document" />
      <Box x={220} y={8} w={160} h={52} tone="warning" titleFont={title} label="MEMORY" detail="stored turns" />
      <Box x={8} y={148} w={140} h={56} tone="warning" titleFont={title} label="USER" detail="asks and reads" />
      <Box x={220} y={148} w={160} h={64} tone="primary" titleFont={title} label="HARNESS" detail="owns the loop" />
      <Box x={416} y={48} w={136} h={52} tone="secondary" titleFont={title} label="MODEL" detail="Ollama or OpenAI" />
      <Box x={8} y={276} w={168} h={56} tone="secondary" titleFont={title} label="EMBEDDED TOOL" detail="in the page" />
      <Box x={400} y={272} w={152} h={64} tone="secondary" titleFont={title} label="MCP" detail="in the page" />

      <Arrow x1={148} y1={34} x2={220} y2={170} marker="af-arch-primary" />
      <Label x={16} y={92} tone="primary">document</Label>

      <Arrow x1={270} y1={60} x2={270} y2={148} marker="af-arch-primary" />
      <Label x={278} y={108} tone="primary">turns</Label>

      <Arrow x1={330} y1={148} x2={330} y2={60} marker="af-arch-secondary" />
      <Label x={338} y={108} tone="secondary">write</Label>

      <Arrow x1={148} y1={168} x2={220} y2={168} marker="af-arch-primary" />
      <Label x={156} y={160} tone="primary">message</Label>

      <Arrow x1={220} y1={192} x2={148} y2={192} marker="af-arch-secondary" />
      <Label x={156} y={228} tone="secondary">answer</Label>

      <Arrow x1={360} y1={148} x2={440} y2={100} marker="af-arch-primary" />
      <Label x={392} y={124} tone="primary">messages</Label>

      <Arrow x1={500} y1={100} x2={380} y2={168} marker="af-arch-secondary" />
      <Label x={456} y={140} tone="secondary">reply</Label>

      <Arrow x1={280} y1={212} x2={120} y2={276} marker="af-arch-primary" />
      <Label x={168} y={248} tone="primary">call</Label>

      <Arrow x1={100} y1={276} x2={250} y2={212} marker="af-arch-secondary" />
      <Label x={16} y={258} tone="secondary">result</Label>

      <Arrow x1={370} y1={196} x2={450} y2={272} marker="af-arch-primary" />
      <Label x={388} y={236} tone="primary">JSON-RPC</Label>

      <Arrow x1={480} y1={272} x2={380} y2={200} marker="af-arch-secondary" />
      <Label x={484} y={248} tone="secondary">result</Label>
    </svg>
  );
}

function Box({
  x, y, w, h, tone, titleFont, label, detail,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  tone: "primary" | "secondary" | "warning";
  titleFont: string;
  label: string;
  detail: string;
}) {
  const color = `var(--pkd-${tone})`;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={5}
        fill={`var(--pkd-${tone}-bg)`}
        stroke={color}
        strokeWidth={tone === "primary" ? 2 : 1.5}
      />
      <text x={x + w / 2} y={y + 22} textAnchor="middle" fill={color} fontFamily={titleFont} fontSize={12} fontWeight={700}>
        {label}
      </text>
      <text x={x + w / 2} y={y + 40} textAnchor="middle" fill="var(--pkd-foreground-muted)" fontFamily={titleFont} fontSize={10}>
        {detail}
      </text>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, marker }: { x1: number; y1: number; x2: number; y2: number; marker: string }) {
  const tone = marker.endsWith("primary") ? "var(--pkd-primary)" : "var(--pkd-secondary)";
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={tone} strokeWidth={1.5} markerEnd={`url(#${marker})`} />;
}

function Label({ x, y, tone, children }: { x: number; y: number; tone: "primary" | "secondary"; children: string }) {
  return (
    <text x={x} y={y} fill={`var(--pkd-${tone})`} fontFamily="var(--pkd-font-mono)" fontSize={10}>
      {children}
    </text>
  );
}
