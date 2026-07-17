"use client";
import { DataTable } from "../components/DataTable";
import { Shell } from "../components/Shell";
export default function ClientsPage() { return <Shell title="客户 / Clientes"><DataTable endpoint="/clients" createHref="/clients/new" rowHref={(item) => `/clients/${item.id}`} columns={[{ key: "client_code", label: "客户编号 / Código" }, { key: "legal_name", label: "法定名称 / Razão social" }, { key: "city", label: "城市 / Cidade" }, { key: "importance_level", label: "等级 / Nível" }, { key: "status", label: "状态 / Status" }]} /></Shell>; }
