"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, PageResult } from "../lib/api";

export function DataTable({ endpoint, columns, createHref, rowHref }: { endpoint: string; columns: { key: string; label: string }[]; createHref?: string; rowHref?: (item: Record<string, string>) => string; }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [data, setData] = useState<PageResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      apiFetch<PageResult | Record<string, string>[]>(`${endpoint}?search=${encodeURIComponent(search)}`)
        .then((result) => {
          if (Array.isArray(result)) {
            const filtered = search ? result.filter((item) => Object.values(item).some((value) => String(value || "").toLowerCase().includes(search.toLowerCase()))) : result;
            setData({ items: filtered, total: filtered.length, page: 1, page_size: filtered.length || 25 });
          } else {
            setData(result);
          }
        })
        .catch((err) => setError(err.message));
    }, 200);
    return () => clearTimeout(timer);
  }, [endpoint, search]);

  return (
    <div className="panel">
      <div className="toolbar">
        <div className="toolbar-left">
          <input className="search" placeholder="搜索编号、名称或状态 / Buscar código, nome ou status" value={search} onChange={(event) => setSearch(event.target.value)} />
          <span className="muted">共 / Total {data?.total ?? 0}</span>
        </div>
        {createHref ? <button className="button" onClick={() => router.push(createHref)}>新增 / Novo</button> : null}
      </div>
      {error ? <p className="error" style={{ padding: 14 }}>{error}</p> : null}
      <table className="table">
        <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
        <tbody>
          {(data?.items || []).map((item) => (
            <tr key={item.id} className={rowHref ? "clickable" : undefined} onClick={() => rowHref && router.push(rowHref(item))}>
              {columns.map((column) => <td key={column.key}>{column.key === "status" ? <span className="status">{item[column.key]}</span> : item[column.key] || "-"}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
