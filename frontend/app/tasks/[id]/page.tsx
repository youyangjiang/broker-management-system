import Link from "next/link";
import { DeleteButton } from "../../components/DeleteButton";
import { EntityDetail } from "../../components/EntityDetail";
import { Shell } from "../../components/Shell";
import { TaskActions } from "./TaskActions";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="任务详情 / Detalhes da tarefa">
      <div className="stack">
        <div className="toolbar-right">
          <Link className="button" href={`/tasks/${id}/edit`}>编辑任务 / Editar</Link>
          <TaskActions taskId={id} />
          <Link className="button secondary" href="/tasks">返回任务列表 / Voltar</Link>
          <DeleteButton endpoint={`/tasks/${id}`} label="删除任务 / Excluir" confirmMessage="确认删除这个任务吗？ / Confirmar exclusão desta tarefa?" redirectTo="/tasks" />
        </div>
        <EntityDetail endpoint={`/tasks/${id}`} fields={[
          { key: "title", label: "标题 / Título" },
          { key: "priority", label: "优先级 / Prioridade" },
          { key: "status", label: "状态 / Status" },
          { key: "due_date", label: "截止时间 / Prazo" },
          { key: "reminder_at", label: "提醒时间 / Lembrete" },
          { key: "completed_at", label: "完成时间 / Conclusão" },
          { key: "description", label: "说明 / Descrição" }
        ]} />
      </div>
    </Shell>
  );
}
