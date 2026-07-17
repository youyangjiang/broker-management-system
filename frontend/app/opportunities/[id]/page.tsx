import Link from "next/link";
import { EntityDetail } from "../../components/EntityDetail";
import { Shell } from "../../components/Shell";
import { OpportunityRequirements } from "./OpportunityRequirements";

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="商机详情 / Detalhes da oportunidade">
      <div className="stack">
        <div className="toolbar-right">
          <Link className="button" href={`/opportunities/${id}/edit`}>编辑商机 / Editar</Link>
          <Link className="button secondary" href={`/tasks/new?opportunity_id=${id}`}>创建任务 / Criar tarefa</Link>
          <Link className="button secondary" href={`/activities/new?opportunity_id=${id}`}>记录活动 / Registrar atividade</Link>
          <Link className="button secondary" href="/opportunities">返回商机列表 / Voltar</Link>
        </div>
        <EntityDetail
          endpoint={`/opportunities/${id}`}
          fields={[
            { key: "opportunity_code", label: "商机编号 / Código" },
            { key: "title", label: "标题 / Título" },
            { key: "opportunity_type", label: "商机类型 / Tipo" },
            { key: "client_legal_entity_id", label: "客户 CNPJ 单位 / Unidade CNPJ" },
            { key: "broker_partner_id", label: "经纪公司伙伴 / Corretora parceira" },
            { key: "channel_partner_id", label: "渠道 / Canal" },
            { key: "priority", label: "优先级 / Prioridade" },
            { key: "status", label: "状态 / Status" },
            { key: "estimated_total_premium", label: "预计总保费 / Prêmio estimado" },
            { key: "estimated_total_commission", label: "预计佣金 / Comissão estimada" },
            { key: "expected_close_date", label: "预计成交日 / Fechamento previsto" },
            { key: "next_action_date", label: "下一步日期 / Próxima ação" },
            { key: "next_action", label: "下一步 / Próxima ação" }
          ]}
        />
        <OpportunityRequirements opportunityId={id} />
      </div>
    </Shell>
  );
}
