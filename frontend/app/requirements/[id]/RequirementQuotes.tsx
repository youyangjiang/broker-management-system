"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export function RequirementQuotes({ requirementId }: { requirementId: string }) {
  const [quotes, setQuotes] = useState<Record<string, string>[]>([]);
  const [partners, setPartners] = useState<Record<string, string>[]>([]);
  const [insurers, setInsurers] = useState<Record<string, string>[]>([]);
  const [form, setForm] = useState({
    broker_partner_id: "",
    insurer_id: "",
    quote_number: "",
    premium_total: "",
    commission_rate: "",
    our_share_rate: "",
    valid_until: "",
    is_recommended: false,
    recommendation_reason: ""
  });
  const [error, setError] = useState("");

  async function load() {
    const [quoteRows, partnerRows, insurerRows] = await Promise.all([
      apiFetch<Record<string, string>[]>(`/requirements/${requirementId}/quotes`),
      apiFetch<Record<string, string>[]>("/broker-partners"),
      apiFetch<Record<string, string>[]>("/insurers")
    ]);
    setQuotes(quoteRows);
    setPartners(partnerRows);
    setInsurers(insurerRows);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [requirementId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const payload = Object.fromEntries(Object.entries(form).filter(([, value]) => value !== "" && value !== false));
    try {
      await apiFetch(`/requirements/${requirementId}/quotes`, { method: "POST", body: JSON.stringify(payload) });
      setForm({ broker_partner_id: "", insurer_id: "", quote_number: "", premium_total: "", commission_rate: "", our_share_rate: "", valid_until: "", is_recommended: false, recommendation_reason: "" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败 / Falha ao salvar");
    }
  }

  async function acceptQuote(quoteId: string) {
    const start = new Date();
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    await apiFetch(`/quotes/${quoteId}/accept`, {
      method: "POST",
      body: JSON.stringify({
        policy_start_date: start.toISOString().slice(0, 10),
        policy_end_date: end.toISOString().slice(0, 10),
        renewal_reminder_date: new Date(end.getTime() - 90 * 86400000).toISOString().slice(0, 10)
      })
    });
    await load();
  }

  return (
    <section className="panel">
      <div className="toolbar">
        <div className="toolbar-left">
          <strong>报价 / Cotações</strong>
          <span className="muted">共 {quotes.length} 条 / {quotes.length} registros</span>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>报价编号 / Código</th>
            <th>保险公司 / Seguradora</th>
            <th>合作方 / Parceiro</th>
            <th>总保费 / Prêmio total</th>
            <th>有效期 / Validade</th>
            <th>状态 / Status</th>
            <th>操作 / Ação</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => {
            const partner = partners.find((row) => row.id === quote.broker_partner_id);
            const insurer = insurers.find((row) => row.id === quote.insurer_id);
            return (
              <tr key={quote.id}>
                <td>{quote.quote_code}</td>
                <td>{insurer?.legal_name || "-"}</td>
                <td>{partner?.legal_name || "-"}</td>
                <td>{quote.premium_total}</td>
                <td>{quote.valid_until || "-"}</td>
                <td><span className="status">{quote.status}</span></td>
                <td>
                  {quote.status !== "accepted" ? (
                    <button className="button" type="button" onClick={() => acceptQuote(quote.id)}>
                      接受 / Aceitar
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <form className="form form-panel" onSubmit={submit}>
        <div className="form-grid">
          <div className="field">
            <label>合作经纪公司 / Corretora parceira</label>
            <select value={form.broker_partner_id} onChange={(event) => setForm({ ...form, broker_partner_id: event.target.value })}>
              <option value="">请选择 / Selecione</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>{partner.legal_name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>保险公司 / Seguradora</label>
            <select value={form.insurer_id} onChange={(event) => setForm({ ...form, insurer_id: event.target.value })}>
              <option value="">请选择 / Selecione</option>
              {insurers.map((insurer) => (
                <option key={insurer.id} value={insurer.id}>{insurer.legal_name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>外部报价号 / Número externo</label>
            <input value={form.quote_number} onChange={(event) => setForm({ ...form, quote_number: event.target.value })} />
          </div>
          <div className="field">
            <label>总保费 / Prêmio total</label>
            <input type="number" required value={form.premium_total} onChange={(event) => setForm({ ...form, premium_total: event.target.value })} />
          </div>
          <div className="field">
            <label>佣金率 / Comissão</label>
            <input type="number" step="0.000001" value={form.commission_rate} onChange={(event) => setForm({ ...form, commission_rate: event.target.value })} />
          </div>
          <div className="field">
            <label>我方分成率 / Participação própria</label>
            <input type="number" step="0.000001" value={form.our_share_rate} onChange={(event) => setForm({ ...form, our_share_rate: event.target.value })} />
          </div>
          <div className="field">
            <label>有效期 / Validade</label>
            <input type="date" value={form.valid_until} onChange={(event) => setForm({ ...form, valid_until: event.target.value })} />
          </div>
          <div className="field">
            <label>推荐理由 / Motivo da recomendação</label>
            <input value={form.recommendation_reason} onChange={(event) => setForm({ ...form, recommendation_reason: event.target.value })} />
          </div>
        </div>
        {error ? <div className="error">{error}</div> : null}
        <button className="button" type="submit">
          新增报价 / Adicionar cotação
        </button>
      </form>
    </section>
  );
}
