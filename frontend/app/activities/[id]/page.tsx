import Link from "next/link";
import { DeleteButton } from "../../components/DeleteButton";
import { EntityDetail } from "../../components/EntityDetail";
import { Shell } from "../../components/Shell";

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="活动详情 / Detalhes da atividade">
      <div className="stack">
        <div className="toolbar-right">
          <Link className="button secondary" href="/activities">返回活动列表 / Voltar</Link>
          <DeleteButton endpoint={`/activities/${id}`} label="删除活动 / Excluir" confirmMessage="确认删除这条活动记录吗？ / Confirmar exclusão desta atividade?" redirectTo="/activities" />
        </div>
        <EntityDetail endpoint={`/activities/${id}`} fields={[
          { key: "activity_date", label: "发生时间 / Data e hora" },
          { key: "activity_type", label: "活动类型 / Tipo" },
          { key: "subject", label: "主题 / Assunto" },
          { key: "description", label: "内容 / Conteúdo" },
          { key: "outcome", label: "结果 / Resultado" },
          { key: "next_action", label: "下一步 / Próxima ação" },
          { key: "next_action_date", label: "下一步日期 / Próxima ação" }
        ]} />
      </div>
    </Shell>
  );
}
