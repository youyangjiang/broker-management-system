"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export function EntityDetail({ endpoint, fields }: { endpoint: string; fields: { key: string; label: string }[] }) {
  const [item, setItem] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { apiFetch<Record<string, string>>(endpoint).then(setItem).catch((err) => setError(err.message)); }, [endpoint]);
  if (error) return <div className="panel form-panel error">{error}</div>;
  if (!item) return <div className="panel form-panel muted">加载中 / Carregando</div>;
  return <div className="detail-grid">{fields.map((field) => <div className="detail-item" key={field.key}><span>{field.label}</span><strong>{item[field.key] || "-"}</strong></div>)}</div>;
}
