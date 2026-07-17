"use client";
import { DataTable } from "../components/DataTable";
import { Shell } from "../components/Shell";
export default function ActivitiesPage() { return <Shell title="活动 / Atividades"><DataTable endpoint="/activities" createHref="/activities/new" rowHref={(item) => `/activities/${item.id}`} columns={[{ key: "activity_date", label: "时间 / Horário" }, { key: "activity_type", label: "类型 / Tipo" }, { key: "subject", label: "主题 / Assunto" }, { key: "outcome", label: "结果 / Resultado" }, { key: "next_action_date", label: "下一步日期 / Próxima ação" }]} /></Shell>; }
