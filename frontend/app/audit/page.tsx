"use client";
import { DataTable } from "../components/DataTable";
import { Shell } from "../components/Shell";
export default function AuditPage() { return <Shell title="审计日志 / Logs de auditoria"><DataTable endpoint="/audit-logs" columns={[{ key: "created_at", label: "时间 / Horário" }, { key: "action_type", label: "动作 / Ação" }, { key: "entity_type", label: "对象类型 / Entidade" }, { key: "entity_id", label: "对象 ID / ID" }, { key: "source_channel", label: "来源 / Origem" }]} /></Shell>; }
