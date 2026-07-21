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
      const separator = endpoint.includes("?") ? "&" : "?";
      apiFetch<PageResult | Record<string, string>[]>(`${endpoint}${separator}search=${encodeURIComponent(search)}`)
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

  function valueFor(item: Record<string, string>, key: string) {
    return item[key] || "-";
  }

  function compactColumns() {
    const codeColumn = columns.find((column) => column.key.includes("code") || column.key.endsWith("_number"));
    const statusColumn = columns.find((column) => column.key === "status");
    const primaryColumn = columns.find((column) => column !== codeColumn && column.key !== "status") || columns[0];
    const metaColumns = columns.filter((column) => column !== primaryColumn && column !== statusColumn).slice(0, 3);
    return { codeColumn, metaColumns, primaryColumn, statusColumn };
  }

  const { codeColumn, metaColumns, primaryColumn, statusColumn } = compactColumns();

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
      <div className="record-list">
        {(data?.items || []).map((item) => (
          <button key={item.id} className={`record-row ${rowHref ? "clickable" : ""}`} type="button" onClick={() => rowHref && router.push(rowHref(item))} disabled={!rowHref}>
            <span className="record-main">
              <strong>{valueFor(item, primaryColumn.key)}</strong>
              {codeColumn ? <span>{valueFor(item, codeColumn.key)}</span> : null}
            </span>
            <span className="record-meta">
              {metaColumns.map((column) => (
                <span key={column.key}>
                  <em>{column.label}</em>
                  {valueFor(item, column.key)}
                </span>
              ))}
            </span>
            {statusColumn ? <span className="status record-status">{valueFor(item, statusColumn.key)}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
