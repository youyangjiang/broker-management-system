"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export function RequirementAssignments({ requirementId }: { requirementId: string }) {
  const [assignments, setAssignments] = useState<Record<string, string>[]>([]);
  const [partners, setPartners] = useState<Record<string, string>[]>([]);
  const [users, setUsers] = useState<Record<string, string>[]>([]);
  const [form, setForm] = useState({
    broker_partner_id: "",
    assigned_internal_user_id: "",
    assignment_date: new Date().toISOString().slice(0, 10),
    expected_quote_date: "",
    status: "assigned",
    internal_notes: ""
  });
  const [error, setError] = useState("");

  async function load() {
    const [assignmentRows, partnerRows, userRows] = await Promise.all([
      apiFetch<Record<string, string>[]>(`/requirements/${requirementId}/assignments`),
      apiFetch<Record<string, string>[]>("/broker-partners"),
      apiFetch<Record<string, string>[]>("/users")
    ]);
    setAssignments(assignmentRows);
    setPartners(partnerRows);
    setUsers(userRows);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [requirementId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ""));
    try {
      await apiFetch(`/requirements/${requirementId}/assignments`, { method: "POST", body: JSON.stringify(payload) });
      setForm({ broker_partner_id: "", assigned_internal_user_id: "", assignment_date: new Date().toISOString().slice(0, 10), expected_quote_date: "", status: "assigned", internal_notes: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败 / Falha ao salvar");
    }
  }

  return (
    <section className="panel">
      <div className="toolbar">
        <div className="toolbar-left">
          <strong>合作方分配 / Distribuição a parceiros</strong>
          <span className="muted">共 {assignments.length} 条 / {assignments.length} registros</span>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>合作方 / Parceiro</th>
            <th>分配日 / Data de envio</th>
            <th>预计报价日 / Previsão da cotação</th>
            <th>状态 / Status</th>
            <th>备注 / Observações</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => {
            const partner = partners.find((row) => row.id === assignment.broker_partner_id);
            return (
              <tr key={assignment.id}>
                <td>{partner?.legal_name || assignment.broker_partner_id}</td>
                <td>{assignment.assignment_date || "-"}</td>
                <td>{assignment.expected_quote_date || "-"}</td>
                <td><span className="status">{assignment.status}</span></td>
                <td>{assignment.internal_notes || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <form className="form form-panel" onSubmit={submit}>
        <div className="form-grid">
          <div className="field">
            <label>合作经纪公司 / Corretora parceira</label>
            <select required value={form.broker_partner_id} onChange={(event) => setForm({ ...form, broker_partner_id: event.target.value })}>
              <option value="">请选择 / Selecione</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.legal_name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>内部经办人 / Responsável interno</label>
            <select value={form.assigned_internal_user_id} onChange={(event) => setForm({ ...form, assigned_internal_user_id: event.target.value })}>
              <option value="">请选择 / Selecione</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>分配日期 / Data de envio</label>
            <input type="date" required value={form.assignment_date} onChange={(event) => setForm({ ...form, assignment_date: event.target.value })} />
          </div>
          <div className="field">
            <label>预计报价日 / Previsão da cotação</label>
            <input type="date" value={form.expected_quote_date} onChange={(event) => setForm({ ...form, expected_quote_date: event.target.value })} />
          </div>
          <div className="field">
            <label>状态 / Status</label>
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="assigned">已分配 / Atribuído</option>
              <option value="submitted">已提交 / Enviado</option>
              <option value="waiting_for_quote">等待报价 / Aguardando cotação</option>
              <option value="quote_received">已收报价 / Cotação recebida</option>
              <option value="declined">已拒绝 / Recusado</option>
            </select>
          </div>
          <div className="field">
            <label>内部备注 / Observações internas</label>
            <input value={form.internal_notes} onChange={(event) => setForm({ ...form, internal_notes: event.target.value })} />
          </div>
        </div>
        {error ? <div className="error">{error}</div> : null}
        <button className="button" type="submit">
          新增分配 / Adicionar distribuição
        </button>
      </form>
    </section>
  );
}
