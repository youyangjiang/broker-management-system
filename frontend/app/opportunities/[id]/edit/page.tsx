import { EntityEditForm } from "../../../components/EntityEditForm";
import { Shell } from "../../../components/Shell";

const opportunityTypes = [
  { value: "beneficio", label: "员工福利 / Benefício" },
  { value: "patrimonial", label: "企业财产 / Patrimonial" },
  { value: "frota", label: "车队保险 / Frota" },
  { value: "transporte", label: "货运运输 / Transporte" },
  { value: "responsabilidade", label: "责任险 / Responsabilidade civil" },
  { value: "cyber", label: "网络安全 / Cyber" },
  { value: "garantia", label: "保证保险 / Garantia" },
  { value: "outros", label: "其他 / Outros" }
];

export default async function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="编辑商机 / Editar oportunidade">
      <EntityEditForm
        endpoint={`/opportunities/${id}`}
        redirectTo={`/opportunities/${id}`}
        fields={[
          { name: "title", label: "商机名称 / Nome da oportunidade", required: true },
          { name: "client_legal_entity_id", label: "客户 CNPJ 单位 / Unidade CNPJ", type: "select", optionsEndpoint: "/client-legal-entities", optionLabelKey: "legal_name" },
          { name: "opportunity_type", label: "商机类型 / Tipo da oportunidade", type: "select", options: opportunityTypes, required: true },
          { name: "broker_partner_id", label: "经纪公司伙伴 / Corretora parceira", type: "select", optionsEndpoint: "/broker-partners", optionLabelKey: "legal_name" },
          { name: "channel_partner_id", label: "渠道 / Canal", type: "select", optionsEndpoint: "/channel-partners", optionLabelKey: "legal_name" },
          { name: "source_type", label: "来源 / Origem" },
          { name: "estimated_total_premium", label: "预计总保费 / Prêmio estimado", type: "number" },
          { name: "estimated_total_commission", label: "预计佣金 / Comissão estimada", type: "number" },
          { name: "probability", label: "成交概率 / Probabilidade", type: "number" },
          { name: "priority", label: "优先级 / Prioridade", type: "select", options: [{ value: "low", label: "低 / Baixa" }, { value: "medium", label: "中 / Média" }, { value: "high", label: "高 / Alta" }], required: true },
          { name: "status", label: "状态 / Status", type: "select", options: [{ value: "new", label: "新建 / Nova" }, { value: "qualification", label: "资格确认 / Qualificação" }, { value: "information_collection", label: "资料收集 / Coleta" }, { value: "quotation", label: "报价中 / Cotação" }, { value: "negotiation", label: "谈判中 / Negociação" }, { value: "partially_won", label: "部分成交 / Parcialmente ganha" }, { value: "won", label: "已成交 / Ganha" }, { value: "lost", label: "已丢失 / Perdida" }, { value: "on_hold", label: "暂停 / Em espera" }], required: true },
          { name: "expected_close_date", label: "预计成交日 / Fechamento previsto", type: "date" },
          { name: "next_action", label: "下一步 / Próxima ação", type: "textarea", full: true },
          { name: "next_action_date", label: "下一步日期 / Próxima ação", type: "date" },
          { name: "description", label: "说明 / Descrição", type: "textarea", full: true }
        ]}
      />
    </Shell>
  );
}
