import { EntityEditForm } from "../../../components/EntityEditForm";
import { Shell } from "../../../components/Shell";

export default async function EditPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="编辑保单 / Editar apólice">
      <EntityEditForm
        endpoint={`/policies/${id}`}
        redirectTo={`/policies/${id}`}
        fields={[
          { name: "policy_number", label: "外部保单号 / Nº externo" },
          { name: "premium_total", label: "总保费 / Prêmio total", type: "number", required: true },
          { name: "commission_rate", label: "佣金比例 / Comissão", type: "number" },
          { name: "total_commission_amount", label: "总佣金 / Comissão total", type: "number" },
          { name: "our_share_rate", label: "我方分成比例 / Nossa participação", type: "number" },
          { name: "expected_our_commission", label: "我方预计佣金 / Nossa comissão", type: "number" },
          { name: "policy_start_date", label: "起保日 / Início", type: "date", required: true },
          { name: "policy_end_date", label: "到期日 / Fim", type: "date", required: true },
          { name: "renewal_reminder_date", label: "续保提醒日 / Renovação", type: "date" },
          { name: "status", label: "状态 / Status", type: "select", options: [{ value: "pending_issue", label: "待出单 / Pendente" }, { value: "active", label: "有效 / Ativa" }, { value: "cancelled", label: "取消 / Cancelada" }, { value: "expired", label: "到期 / Vencida" }], required: true },
          { name: "renewal_status", label: "续保状态 / Status renovação", type: "select", options: [{ value: "not_started", label: "未开始 / Não iniciada" }, { value: "in_progress", label: "处理中 / Em andamento" }, { value: "renewed", label: "已续保 / Renovada" }, { value: "lost", label: "流失 / Perdida" }] }
        ]}
      />
    </Shell>
  );
}
