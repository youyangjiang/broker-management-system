"use client";
import { DataTable } from "../components/DataTable";
import { Shell } from "../components/Shell";
export default function PoliciesPage() { return <Shell title="保单 / Apólices"><DataTable endpoint="/policies" rowHref={(item) => `/policies/${item.id}`} columns={[{ key: "policy_code", label: "保单编号 / Código" }, { key: "policy_number", label: "外部保单号 / Nº externo" }, { key: "premium_total", label: "总保费 / Prêmio total" }, { key: "policy_start_date", label: "起保日 / Início" }, { key: "policy_end_date", label: "到期日 / Fim" }, { key: "status", label: "状态 / Status" }]} /></Shell>; }
