import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldAlert, AlertOctagon, FolderKanban, Globe2, Archive } from "lucide-react";
import { api } from "../lib/api";
import { DashboardSummary } from "../types";
import { ClassificationBadge, ScoreBadge } from "../components/Badges";

const METRIC_CARDS = [
  { key: "emailsAnalyzed", label: "Emails Analyzed", icon: Mail },
  { key: "threatsDetected", label: "Threats Detected", icon: ShieldAlert },
  { key: "criticalThreats", label: "Critical Threats", icon: AlertOctagon },
  { key: "activeCases", label: "Active Cases", icon: FolderKanban },
  { key: "activeCampaigns", label: "Active Campaigns", icon: Globe2 },
  { key: "evidenceItems", label: "Evidence Items", icon: Archive },
] as const;

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load dashboard data. Check that the backend and database are running."));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">SOC Dashboard</h1>
          <p className="text-sm text-slate-500">Real-time overview of email threat detection and investigations.</p>
        </div>
        <Link to="/investigate/upload" className="btn-primary">Analyze Email</Link>
      </div>

      {error && <div className="panel p-4 text-sm text-red-400">{error}</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {METRIC_CARDS.map((m) => (
              <div key={m.key} className="panel p-4">
                <m.icon className="text-forensic-accent mb-2" size={18} />
                <div className="text-2xl font-mono font-bold text-slate-100">{data.metrics[m.key]}</div>
                <div className="text-xs text-slate-500">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="panel p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">Recent Investigations</h2>
              <div className="space-y-2">
                {data.recentInvestigations.length === 0 && (
                  <p className="text-sm text-slate-500">No emails analyzed yet. Try loading a demo investigation.</p>
                )}
                {data.recentInvestigations.map((e) => (
                  <Link
                    key={e.id}
                    to={`/investigate/emails/${e.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-white/5 border border-transparent hover:border-forensic-border"
                  >
                    <div className="min-w-0">
                      <div className="text-sm text-slate-200 truncate">{e.subject}</div>
                      <div className="text-xs text-slate-500 truncate">{e.fromAddress}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <ClassificationBadge classification={e.threatClassification} />
                      <ScoreBadge score={e.threatScore} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="panel p-5">
              <h2 className="text-sm font-semibold text-slate-200 mb-4">Recent Alerts</h2>
              <div className="space-y-2">
                {data.recentAlerts.length === 0 && <p className="text-sm text-slate-500">No alerts yet.</p>}
                {data.recentAlerts.map((a) => (
                  <div key={a.id} className="px-3 py-2 rounded-md border border-forensic-border">
                    <div className="flex items-center justify-between">
                      <span className={`badge badge-${a.severity.toLowerCase()}`}>{a.severity}</span>
                      <span className="text-[11px] text-slate-500">{new Date(a.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-slate-200 mt-1">{a.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel p-5">
            <h2 className="text-sm font-semibold text-slate-200 mb-2">System Health</h2>
            <div className="flex gap-6 text-sm">
              <span className={data.systemHealth.database ? "text-green-400" : "text-red-400"}>
                ● PostgreSQL {data.systemHealth.database ? "connected" : "unreachable"}
              </span>
              <span className={data.systemHealth.aiService ? "text-green-400" : "text-red-400"}>
                ● AI Service {data.systemHealth.aiService ? "connected" : "unreachable (rule-engine fallback active)"}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
