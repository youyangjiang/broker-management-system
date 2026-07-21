"use client";

import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { Shell } from "../components/Shell";

const tabs = [
  { key: "open", label: "未完成 / Pendentes" },
  { key: "in_progress", label: "进行中 / Em andamento" },
  { key: "overdue", label: "超时 / Atrasadas" },
  { key: "done", label: "已完成 / Concluídas" }
];

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState("open");

  return (
    <Shell title="任务 / Tarefas">
      <div className="stack">
        <div className="tabs" role="tablist" aria-label="任务状态 / Status da tarefa">
          {tabs.map((tab) => (
            <button key={tab.key} className={activeTab === tab.key ? "active" : ""} type="button" role="tab" aria-selected={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>
        <DataTable
          endpoint={`/tasks?bucket=${activeTab}`}
          createHref="/tasks/new"
          rowHref={(item) => `/tasks/${item.id}`}
          columns={[
            { key: "title", label: "标题 / Título" },
            { key: "due_date", label: "预计完成 / Prazo" },
            { key: "priority", label: "优先级 / Prioridade" },
            { key: "status", label: "状态 / Status" }
          ]}
        />
      </div>
    </Shell>
  );
}
