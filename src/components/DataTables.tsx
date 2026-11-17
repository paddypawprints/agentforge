import { employeeBenefitsData } from "../services/tools";
import { RETIREMENT, SALARY } from "../services/hrServers";

type Table = Record<string, Record<string, string | number>>;

const TABLES: { title: string; detail: string; table: Table }[] = [
  {
    title: "BENEFITS",
    detail: "benefits_lookup reads this table.",
    table: employeeBenefitsData,
  },
  {
    title: "SALARY",
    detail: "salary_lookup and employee_lookup read this table. A name lookup returns only the employee id.",
    table: SALARY,
  },
  {
    title: "RETIREMENT",
    detail: "retirement_lookup reads this table.",
    table: RETIREMENT,
  },
];

function columnsOf(table: Table): string[] {
  const sample = Object.values(table)[0] ?? {};
  return ["employee_id", ...Object.keys(sample)];
}

function DataTable({ title, detail, table }: { title: string; detail: string; table: Table }) {
  const columns = columnsOf(table);
  const rows = Object.entries(table);

  return (
    <div>
      <p className="pkd-text-mono" style={{ margin: 0, color: "var(--pkd-primary)", fontWeight: 700, fontSize: "var(--pkd-text-xs)", letterSpacing: "0.06em" }}>
        {title}
      </p>
      <p className="pkd-text-mono" style={{ margin: "0.15rem 0 0.45rem", color: "var(--pkd-foreground-muted)", fontSize: "var(--pkd-text-xs)", lineHeight: 1.45 }}>
        {detail}
      </p>
      <div style={{ overflowX: "auto" }}>
        <table className="pkd-text-mono" style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--pkd-text-xs)" }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  style={{
                    textAlign: "left",
                    padding: "0.35rem 0.55rem",
                    borderBottom: "1px solid var(--pkd-primary-border)",
                    color: "var(--pkd-primary)",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([employeeId, row]) => (
              <tr key={employeeId}>
                {columns.map((column) => (
                  <td
                    key={column}
                    style={{
                      padding: "0.35rem 0.55rem",
                      borderBottom: "1px solid var(--pkd-border-color)",
                      color: "var(--pkd-foreground)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {column === "employee_id" ? employeeId : String(row[column] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** The records the tools read. */
export function DataTables() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
      {TABLES.map((table) => (
        <DataTable key={table.title} {...table} />
      ))}
    </div>
  );
}
