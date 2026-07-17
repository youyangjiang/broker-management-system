"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";

export function OpportunityRequirements({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Record<string, string>[]>(`/opportunities/${opportunityId}/requirements`).then(setRows).catch((err) => setError(err.message));
  }, [opportunityId]);

  return (
    <section className="panel">
      <div className="toolbar">
        <div className="toolbar-left">
          <strong>需求子项 / Necessidades vinculadas</strong>
          <span className="muted">共 / Total {rows.length}</span>
        </div>
        <button className="button" type="button" onClick={() => router.push(`/requirements/new?opportunity_id=${opportunityId}`)}>新增需求 / Nova necessidade</button>
      </div>
      {error ? <p className="error" style={{ padding: 14 }}>{error}</p> : null}
      <table className="table">
        <thead>
          <tr>
            <th>编号 / Código</th>
            <th>标题 / Título</th>
            <th>类型 / Tipo</th>
            <th>保险公司 / Seguradora</th>
            <th>人数 / Vidas</th>
            <th>到期日 / Vencimento</th>
            <th>状态 / Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="clickable" onClick={() => router.push(`/requirements/${row.id}`)}>
              <td>{row.requirement_code}</td>
              <td>{row.title}</td>
              <td>{row.requirement_type || "-"}</td>
              <td>{row.current_insurer_name || "-"}</td>
              <td>{row.insured_lives_count || "-"}</td>
              <td>{row.contract_end_date || row.deadline || "-"}</td>
              <td><span className="status">{row.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
