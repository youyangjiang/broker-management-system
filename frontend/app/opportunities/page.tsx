"use client";
import { DataTable } from "../components/DataTable";
import { Shell } from "../components/Shell";
export default function OpportunitiesPage() { return <Shell title="商机 / Oportunidades"><DataTable endpoint="/opportunities" createHref="/opportunities/new" rowHref={(item) => `/opportunities/${item.id}`} columns={[{ key: "opportunity_code", label: "商机编号 / Código" }, { key: "title", label: "标题 / Título" }, { key: "priority", label: "优先级 / Prioridade" }, { key: "next_action_date", label: "下一步日期 / Próxima ação" }, { key: "status", label: "状态 / Status" }]} /></Shell>; }
