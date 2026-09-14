import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { CaseSummary } from "../types";

const SEVERITY_LEVEL: Record<string, string> = { CRITICAL: "critical", HIGH: "high", MEDIUM: "medium", LOW: "low" };

export default function CasesListPage() {
  const [cases, setCases] = useState<CaseSummary[]>([]);

  useEffect(() => {
    api.get("/cases").then((res) => setCases(res.data));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold text-slate-100">Investigation Cases</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {cases.map((c) => (
          <Link key={c.id} to={`/cases/${c.id}`} className="panel p-5 hover:border-forensic-accent transition">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-slate-500">{c.caseNumber}</span>
              <span className={`badge badge-${SEVERITY_LEVEL[c.severity]}`}>{c.severity}</span>
            </div>
            <h2 className="text-slate-200 font-medium mb-2">{c.title}</h2>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Status: {c.status}</span>
              <span>{c._count?.emails ?? 0} emails · {c._count?.evidence ?? 0} evidence</span>
            </div>
          </Link>
        ))}
        {cases.length === 0 && <p className="text-slate-500">No cases yet. Create one from an analyzed email.</p>}
      </div>
    </div>
  );
}
