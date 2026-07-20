"use client";

import { useEffect, useState } from "react";
import { DeleteButton } from "../../components/DeleteButton";
import { apiFetch } from "../../lib/api";
import { applyMask, lookupCep, onlyDigits, validateMaskedValue, type FieldConfig } from "../../components/EntityCreateForm";

const cnpjField: FieldConfig = { name: "cnpj", label: "CNPJ", mask: "cnpj" };
const cepField: FieldConfig = { name: "postal_code", label: "CEP / CEP", mask: "cep", autoFillAddress: true };

export function ClientLegalEntities({ clientId }: { clientId: string }) {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [form, setForm] = useState({
    legal_name: "",
    trade_name: "",
    cnpj: "",
    unit_type: "filial",
    is_headquarters: false,
    postal_code: "",
    street: "",
    address_number: "",
    address_complement: "",
    district: "",
    city: "",
    state: "",
    status: "active",
    notes: ""
  });
  const [error, setError] = useState("");
  const [cepStatus, setCepStatus] = useState("");

  async function load() {
    setRows(await apiFetch<Record<string, string>[]>(`/clients/${clientId}/legal-entities`));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [clientId]);

  function setValue(key: string, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function fillCep() {
    if (onlyDigits(form.postal_code).length !== 8) return;
    setCepStatus("正在查询 CEP / Consultando CEP");
    const address = await lookupCep(form.postal_code);
    if (!address) {
      setCepStatus("未找到 CEP / CEP não encontrado");
      return;
    }
    setForm((current) => ({ ...current, ...Object.fromEntries(Object.entries(address).filter(([key, value]) => value && !current[key as keyof typeof current])) }));
    setCepStatus("地址已自动填写 / Endereço preenchido");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const cnpjError = validateMaskedValue(cnpjField, form.cnpj);
    const cepError = validateMaskedValue(cepField, form.postal_code);
    if (cnpjError || cepError) {
      setError(cnpjError || cepError);
      return;
    }
    setError("");
    await apiFetch(`/clients/${clientId}/legal-entities`, { method: "POST", body: JSON.stringify(Object.fromEntries(Object.entries(form).filter(([, value]) => value !== ""))) });
    setForm({ legal_name: "", trade_name: "", cnpj: "", unit_type: "filial", is_headquarters: false, postal_code: "", street: "", address_number: "", address_complement: "", district: "", city: "", state: "", status: "active", notes: "" });
    await load();
  }

  return (
    <section className="panel">
      <div className="toolbar">
        <div className="toolbar-left">
          <strong>CNPJ 单位 / Unidades CNPJ</strong>
          <span className="muted">共 / Total {rows.length}</span>
        </div>
      </div>
      <table className="table">
        <thead><tr><th>法定名称 / Razão social</th><th>CNPJ</th><th>类型 / Tipo</th><th>城市 / Cidade</th><th>状态 / Status</th><th>操作 / Ação</th></tr></thead>
        <tbody>
          {rows.map((row) => <tr key={row.id}><td>{row.legal_name}</td><td>{row.cnpj}</td><td>{row.is_headquarters === "True" || row.is_headquarters === "true" ? "总部 / Matriz" : row.unit_type || "分支 / Filial"}</td><td>{row.city || "-"}</td><td><span className="status">{row.status}</span></td><td><DeleteButton endpoint={`/client-legal-entities/${row.id}`} label="删除 / Excluir" confirmMessage="确认删除这个 CNPJ 单位吗？ / Confirmar exclusão desta unidade CNPJ?" onDeleted={load} /></td></tr>)}
        </tbody>
      </table>
      <form className="form form-panel" onSubmit={submit}>
        <div className="form-grid">
          <div className="field"><label>法定名称 / Razão social</label><input required value={form.legal_name} onChange={(event) => setValue("legal_name", event.target.value)} /></div>
          <div className="field"><label>商业名称 / Nome fantasia</label><input value={form.trade_name} onChange={(event) => setValue("trade_name", event.target.value)} /></div>
          <div className="field"><label>CNPJ</label><input required inputMode="numeric" value={form.cnpj} onChange={(event) => setValue("cnpj", applyMask(event.target.value, "cnpj"))} /></div>
          <div className="field"><label>单位类型 / Tipo da unidade</label><select value={form.unit_type} onChange={(event) => setValue("unit_type", event.target.value)}><option value="matriz">总部 / Matriz</option><option value="filial">分支 / Filial</option><option value="subsidiaria">子公司 / Subsidiária</option></select></div>
          <div className="field"><label>CEP / CEP</label><input inputMode="numeric" value={form.postal_code} onBlur={fillCep} onChange={(event) => setValue("postal_code", applyMask(event.target.value, "cep"))} />{cepStatus ? <span className="muted">{cepStatus}</span> : null}</div>
          <div className="field"><label>街道 / Logradouro</label><input value={form.street} onChange={(event) => setValue("street", event.target.value)} /></div>
          <div className="field"><label>门牌号 / Número</label><input value={form.address_number} onChange={(event) => setValue("address_number", event.target.value)} /></div>
          <div className="field"><label>区域 / Bairro</label><input value={form.district} onChange={(event) => setValue("district", event.target.value)} /></div>
          <div className="field"><label>城市 / Cidade</label><input value={form.city} onChange={(event) => setValue("city", event.target.value)} /></div>
          <div className="field"><label>州 / UF</label><input value={form.state} onChange={(event) => setValue("state", event.target.value)} /></div>
          <div className="field full"><label>备注 / Observações</label><textarea value={form.notes} onChange={(event) => setValue("notes", event.target.value)} /></div>
        </div>
        {error ? <div className="error">{error}</div> : null}
        <button className="button" type="submit">添加 CNPJ 单位 / Adicionar unidade</button>
      </form>
    </section>
  );
}
