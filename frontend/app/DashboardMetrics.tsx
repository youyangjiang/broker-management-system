"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "./lib/api";

type Summary = { clients: number; opportunities: number; requirements: number; policies: number; open_tasks: number; audit_logs: number; };
export function DashboardMetrics() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { apiFetch<Summary>("/dashboard/summary").then(setSummary).catch((err) => setError(err.message)); }, []);
  if (error) return <div className="panel form-panel error">{error}</div>;
  const metrics = [["客户 / Clientes", summary?.clients ?? "-"], ["商机 / Oportunidades", summary?.opportunities ?? "-"], ["保险需求 / Necessidades", summary?.requirements ?? "-"], ["保单 / Apólices", summary?.policies ?? "-"], ["未完成任务 / Tarefas abertas", summary?.open_tasks ?? "-"], ["审计日志 / Auditoria", summary?.audit_logs ?? "-"]];
  return <div className="grid">{metrics.map(([label, value]) => <div className="panel metric" key={label}><span className="muted">{label}</span><strong>{value}</strong></div>)}</div>;
}
