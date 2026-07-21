import Link from "next/link";
import { DeleteButton } from "../../components/DeleteButton";
import { EntityDetail } from "../../components/EntityDetail";
import { Shell } from "../../components/Shell";

export default async function PolicyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="保单详情 / Detalhes da apólice">
      <div className="stack">
        <div className="toolbar-right">
          <Link className="button" href={`/policies/${id}/edit`}>编辑保单 / Editar</Link>
          <Link className="button secondary" href="/policies">返回保单列表 / Voltar</Link>
          <DeleteButton endpoint={`/policies/${id}`} label="删除保单 / Excluir" confirmMessage="确认删除这张保单吗？ / Confirmar exclusão desta apólice?" redirectTo="/policies" />
        </div>
        <EntityDetail endpoint={`/policies/${id}`} fields={[
          { key: "policy_code", label: "保单编号 / Código" },
          { key: "policy_number", label: "外部保单号 / Nº externo" },
          { key: "premium_total", label: "总保费 / Prêmio total" },
          { key: "commission_rate", label: "佣金率 / Comissão" },
          { key: "expected_our_commission", label: "我方预计佣金 / Nossa comissão" },
          { key: "policy_start_date", label: "起保日 / Início" },
          { key: "policy_end_date", label: "到期日 / Fim" },
          { key: "renewal_reminder_date", label: "续保提醒日 / Renovação" },
          { key: "status", label: "状态 / Status" }
        ]} />
      </div>
    </Shell>
  );
}
