"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";
import { applyMask, lookupCep, onlyDigits, validateMaskedValue, type FieldConfig } from "./EntityCreateForm";

export function EntityEditForm({ endpoint, fields, redirectTo, transform }: { endpoint: string; fields: FieldConfig[]; redirectTo: string; transform?: (values: Record<string, string>) => Record<string, unknown>; }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cepStatus, setCepStatus] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => { apiFetch<Record<string, string>>(endpoint).then(setValues).catch((err) => setError(err.message)); }, [endpoint]);
  useEffect(() => { fields.filter((field) => field.optionsEndpoint).forEach((field) => { apiFetch<Record<string, string>[] | { items: Record<string, string>[] }>(field.optionsEndpoint || "").then((data) => { const rows = Array.isArray(data) ? data : data.items; setDynamicOptions((current) => ({ ...current, [field.name]: rows.map((row) => ({ value: row.id, label: row[field.optionLabelKey || "legal_name"] || row.full_name || row.title || row.id })) })); }).catch((err) => setError(err.message)); }); }, [fields]);
  function updateValue(field: FieldConfig, value: string) {
    const maskedValue = applyMask(value, field.mask);
    setValues((current) => ({ ...current, [field.name]: maskedValue }));
    setFieldErrors((current) => ({ ...current, [field.name]: validateMaskedValue(field, maskedValue) }));
  }
  async function handleCepBlur(field: FieldConfig, value: string) {
    if (!field.autoFillAddress || onlyDigits(value).length !== 8) return;
    setCepStatus("正在查询 CEP / Consultando CEP");
    const address = await lookupCep(value);
    if (!address) { setCepStatus("未找到 CEP / CEP não encontrado"); return; }
    setValues((current) => ({ ...current, ...Object.fromEntries(Object.entries(address).filter(([key, addressValue]) => addressValue && !current[key])) }));
    setCepStatus("地址已自动填写 / Endereço preenchido");
  }
  async function submit(event: React.FormEvent) { event.preventDefault(); setSaving(true); setError(""); const nextErrors = Object.fromEntries(fields.map((field) => [field.name, validateMaskedValue(field, values[field.name] || "")]).filter(([, message]) => message)); setFieldErrors(nextErrors); if (Object.keys(nextErrors).length) { setSaving(false); return; } const payload = transform ? transform(values) : Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "")); try { await apiFetch(endpoint, { method: "PATCH", body: JSON.stringify(payload) }); router.push(redirectTo); } catch (err) { setError(err instanceof Error ? err.message : "保存失败 / Falha ao salvar"); } finally { setSaving(false); } }
  return <form className="panel form form-panel" onSubmit={submit}><div className="form-grid">{fields.map((field) => { const options = field.options || dynamicOptions[field.name] || []; return <div className={`field ${field.full ? "full" : ""}`} key={field.name}><label htmlFor={field.name}>{field.label}</label>{field.type === "textarea" ? <textarea id={field.name} value={values[field.name] || ""} required={field.required} onChange={(event) => updateValue(field, event.target.value)} /> : field.type === "select" ? <select id={field.name} value={values[field.name] || ""} required={field.required} onChange={(event) => updateValue(field, event.target.value)}><option value="">请选择 / Selecione</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input id={field.name} type={field.type || "text"} inputMode={field.mask ? "numeric" : undefined} value={values[field.name] || ""} required={field.required} onChange={(event) => updateValue(field, event.target.value)} onBlur={(event) => handleCepBlur(field, event.target.value)} />}{fieldErrors[field.name] ? <span className="error">{fieldErrors[field.name]}</span> : null}{field.autoFillAddress && cepStatus ? <span className="muted">{cepStatus}</span> : null}</div>; })}</div>{error ? <div className="error">{error}</div> : null}<div className="toolbar-right"><button className="button" type="submit" disabled={saving}>{saving ? "保存中 / Salvando" : "保存修改 / Salvar alterações"}</button><button className="button secondary" type="button" onClick={() => router.push(redirectTo)}>取消 / Cancelar</button></div></form>;
}
