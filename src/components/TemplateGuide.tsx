import { TEMPLATE_GUIDE } from "../services/templates";

/** What a prompt can insert with a Mustache tag. */
export function TemplateGuide() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p className="pkd-text-mono" style={{ margin: 0, fontSize: "var(--pkd-text-xs)", color: "var(--pkd-foreground-muted)" }}>
        Write a tag in the chatbot, agent, planner, worker, or summarizer prompt. It is replaced when the message is built. If that prompt already contains the tag, the same text is not added again as its own message.
      </p>
      {TEMPLATE_GUIDE.map((item) => (
        <div key={item.tag}>
          <p className="pkd-text-mono" style={{ margin: 0, fontSize: "var(--pkd-text-sm)", color: "var(--pkd-primary)", fontWeight: 700 }}>
            {`{{${item.tag}}}`}
          </p>
          <p className="pkd-text-mono" style={{ margin: "0.15rem 0 0", fontSize: "var(--pkd-text-xs)", color: "var(--pkd-foreground)" }}>
            {item.inserts}
          </p>
          <p className="pkd-text-mono" style={{ margin: "0.1rem 0 0", fontSize: "var(--pkd-text-xs)", color: "var(--pkd-foreground-muted)" }}>
            {item.empty}
          </p>
        </div>
      ))}
      <p className="pkd-text-mono" style={{ margin: 0, fontSize: "var(--pkd-text-xs)", color: "var(--pkd-foreground-muted)" }}>
        {`{{#memory}}...{{/memory}}`} keeps the block only when memory has text. {`{{^memory}}...{{/memory}}`} keeps it when that text is empty. The same works for every tag above. Triple braces insert the same text. {`{{#tools}}`} … {`{{/tools}}`} is the tools array for that call. It offers the tools named in {`{{task}}`} whose schema is in {`{{mcp}}`} or {`{{tool}}`}.
      </p>
    </div>
  );
}
