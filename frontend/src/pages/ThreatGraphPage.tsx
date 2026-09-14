import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";
import { api } from "../lib/api";

interface GraphNode { id: string; type: string; label: string }
interface GraphEdge { source: string; target: string; relationship: string }

const NODE_COLORS: Record<string, string> = {
  EMAIL: "#22d3ee",
  SENDER: "#818cf8",
  IP: "#f97316",
  URL: "#ef4444",
  DOMAIN: "#eab308",
  CAMPAIGN: "#a855f7",
  CASE: "#22c55e",
};

export default function ThreatGraphPage() {
  const [params] = useSearchParams();
  const emailId = params.get("emailId");
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!emailId) return;
    api
      .get(`/campaigns/threat-graph?emailId=${emailId}`)
      .then((res) => setGraph(res.data))
      .catch(() => setError("Could not load threat graph for this email."));
  }, [emailId]);

  const { nodes, edges } = useMemo(() => {
    if (!graph) return { nodes: [] as Node[], edges: [] as Edge[] };
    const radius = 220;
    const center = { x: 400, y: 300 };
    const nodes: Node[] = graph.nodes.map((n, i) => {
      const angle = (i / graph.nodes.length) * Math.PI * 2;
      const isCenter = n.type === "EMAIL";
      return {
        id: n.id,
        data: { label: `${n.type}\n${n.label}` },
        position: isCenter ? center : { x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) },
        style: {
          background: "#0f1520",
          border: `1px solid ${NODE_COLORS[n.type] ?? "#334155"}`,
          color: "#e2e8f0",
          borderRadius: 8,
          fontSize: 11,
          padding: 8,
          width: 160,
          whiteSpace: "pre-wrap",
        },
      };
    });
    const edges: Edge[] = graph.edges.map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      label: e.relationship,
      style: { stroke: "#334155" },
      labelStyle: { fill: "#64748b", fontSize: 10 },
    }));
    return { nodes, edges };
  }, [graph]);

  if (!emailId) {
    return <div className="p-8 text-slate-500">Select an email from Investigate → All Emails to view its threat graph.</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-5 border-b border-forensic-border">
        <h1 className="text-xl font-semibold text-slate-100">Interactive Threat Graph</h1>
        <p className="text-sm text-slate-500">Nodes: email, sender, IPs, domains, URLs, campaigns, case. Click a node to inspect it.</p>
      </div>
      {error && <div className="p-6 text-red-400 text-sm">{error}</div>}
      <div className="flex-1">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background color="#1e2733" gap={24} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
