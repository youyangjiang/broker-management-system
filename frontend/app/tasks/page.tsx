"use client";
import { DataTable } from "../components/DataTable";
import { Shell } from "../components/Shell";
export default function TasksPage() { return <Shell title="任务 / Tarefas"><DataTable endpoint="/tasks" createHref="/tasks/new" rowHref={(item) => `/tasks/${item.id}`} columns={[{ key: "title", label: "标题 / Título" }, { key: "priority", label: "优先级 / Prioridade" }, { key: "due_date", label: "截止时间 / Prazo" }, { key: "status", label: "状态 / Status" }]} /></Shell>; }
