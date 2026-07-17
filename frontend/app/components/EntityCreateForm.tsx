"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";

export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "date" | "datetime-local" | "textarea" | "select";
  required?: boolean;
  full?: boolean;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  optionsEndpoint?: string;
  optionLabelKey?: string;
  mask?: "cep" | "cnpj" | "cpf" | "phone";
  autoFillAddress?: boolean;
};

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

function formatCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d{0,3}).*/, (_, first, second) => (second ? `${first}-${second}` : first));
}

function formatCpf(value: string) {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

function formatCnpj(value: string) {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
}

function formatPhone(value: string) {
  let digits = onlyDigits(value).slice(0, 13);
  if (digits.startsWith("55")) digits = digits.slice(2);
  digits = digits.slice(0, 11);
  if (digits.length <= 2) return digits ? `+55 (${digits}` : "";
  if (digits.length <= 10) return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 6)}${digits.length > 6 ? `-${digits.slice(6)}` : ""}`;
  return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 7)}${digits.length > 7 ? `-${digits.slice(7)}` : ""}`;
}

export function applyMask(value: string, mask?: FieldConfig["mask"]) {
  if (mask === "cep") return formatCep(value);
  if (mask === "cnpj") return formatCnpj(value);
  if (mask === "cpf") return formatCpf(value);
  if (mask === "phone") return formatPhone(value);
  return value;
}

function isValidCpf(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  const calc = (size: number) => {
    const sum = digits.slice(0, size).split("").reduce((total, digit, index) => total + Number(digit) * (size + 1 - index), 0);
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };
  return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10]);
}

function isValidCnpj(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;
  const calc = (weights: number[]) => {
    const sum = weights.reduce((total, weight, index) => total + Number(digits[index]) * weight, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return calc([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(digits[12]) && calc([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(digits[13]);
}

export function validateMaskedValue(field: FieldConfig, value: string) {
  if (!value) return "";
  const digits = onlyDigits(value);
  if (field.mask === "cep" && digits.length !== 8) return `${field.label} 无效 / inválido`;
  if (field.mask === "cpf" && !isValidCpf(value)) return `${field.label} 无效 / inválido`;
  if (field.mask === "cnpj" && !isValidCnpj(value)) return `${field.label} 无效 / inválido`;
  if (field.mask === "phone") {
    const localDigits = digits.startsWith("55") && [12, 13].includes(digits.length) ? digits.slice(2) : digits;
    if (![10, 11].includes(localDigits.length)) return `${field.label} 无效 / inválido`;
  }
  return "";
}

export async function lookupCep(cep: string) {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;
  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!response.ok) return null;
  const data = await response.json();
  if (data.erro) return null;
  return {
    street: data.logradouro || "",
    district: data.bairro || "",
    city: data.localidade || "",
    state: data.uf || "",
    address_complement: data.complemento || ""
  };
}

export function EntityCreateForm({ endpoint, fields, redirectTo, endpointFromValues, redirectFromValues, transform }: { endpoint: string; fields: FieldConfig[]; redirectTo: string; endpointFromValues?: (values: Record<string, string>) => string; redirectFromValues?: (values: Record<string, string>) => string; transform?: (values: Record<string, string>) => Record<string, unknown>; }) {
  const router = useRouter();
  const initialValues = useMemo(() => Object.fromEntries(fields.map((field) => [field.name, field.defaultValue || ""])), [fields]);
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [cepStatus, setCepStatus] = useState("");
  const [saving, setSaving] = useState(false);

  const fieldOptionsKey = useMemo(() => fields.map((field) => `${field.name}:${field.optionsEndpoint || ""}`).join("|"), [fields]);

  useEffect(() => {
    fields.filter((field) => field.optionsEndpoint).forEach((field) => {
      apiFetch<Record<string, string>[] | { items: Record<string, string>[] }>(field.optionsEndpoint || "").then((data) => {
        const rows = Array.isArray(data) ? data : data.items;
        setDynamicOptions((current) => ({ ...current, [field.name]: rows.map((row) => ({ value: row.id, label: row[field.optionLabelKey || "legal_name"] || row.full_name || row.title || row.id })) }));
      }).catch((err) => setError(err.message));
    });
  }, [fieldOptionsKey]);

  function updateValue(field: FieldConfig, value: string) {
    const maskedValue = applyMask(value, field.mask);
    setValues((current) => ({ ...current, [field.name]: maskedValue }));
    setFieldErrors((current) => ({ ...current, [field.name]: validateMaskedValue(field, maskedValue) }));
  }

  async function handleCepBlur(field: FieldConfig, value: string) {
    if (!field.autoFillAddress) return;
    if (onlyDigits(value).length !== 8) return;
    setCepStatus("正在查询 CEP / Consultando CEP");
    const address = await lookupCep(value);
    if (!address) {
      setCepStatus("未找到 CEP / CEP não encontrado");
      return;
    }
    setValues((current) => ({
      ...current,
      ...Object.fromEntries(Object.entries(address).filter(([key, addressValue]) => addressValue && !current[key]))
    }));
    setCepStatus("地址已自动填写 / Endereço preenchido");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const nextErrors = Object.fromEntries(fields.map((field) => [field.name, validateMaskedValue(field, values[field.name] || "")]).filter(([, message]) => message));
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) { setSaving(false); return; }
    const payload = transform ? transform(values) : Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));
    try { await apiFetch(endpointFromValues ? endpointFromValues(values) : endpoint, { method: "POST", body: JSON.stringify(payload) }); router.push(redirectFromValues ? redirectFromValues(values) : redirectTo); }
    catch (err) { setError(err instanceof Error ? err.message : "保存失败 / Falha ao salvar"); }
    finally { setSaving(false); }
  }

  return <form className="panel form form-panel" onSubmit={submit}><div className="form-grid">{fields.map((field) => {
    const options = field.options || dynamicOptions[field.name] || [];
    return <div className={`field ${field.full ? "full" : ""}`} key={field.name}><label htmlFor={field.name}>{field.label}</label>{field.type === "textarea" ? <textarea id={field.name} value={values[field.name] || ""} required={field.required} onChange={(event) => updateValue(field, event.target.value)} /> : field.type === "select" ? <select id={field.name} value={values[field.name] || ""} required={field.required} onChange={(event) => updateValue(field, event.target.value)}><option value="">请选择 / Selecione</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input id={field.name} type={field.type || "text"} inputMode={field.mask ? "numeric" : undefined} value={values[field.name] || ""} required={field.required} onChange={(event) => updateValue(field, event.target.value)} onBlur={(event) => handleCepBlur(field, event.target.value)} />}{fieldErrors[field.name] ? <span className="error">{fieldErrors[field.name]}</span> : null}{field.autoFillAddress && cepStatus ? <span className="muted">{cepStatus}</span> : null}</div>;
  })}</div>{error ? <div className="error">{error}</div> : null}<div className="toolbar-right"><button className="button" type="submit" disabled={saving}>{saving ? "保存中 / Salvando" : "保存 / Salvar"}</button><button className="button secondary" type="button" onClick={() => router.push(redirectTo)}>取消 / Cancelar</button></div></form>;
}
