import { EntityEditForm } from "../../../components/EntityEditForm";
import { Shell } from "../../../components/Shell";

export default async function EditRequirementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="编辑保险需求 / Editar necessidade">
      <EntityEditForm
        endpoint={`/requirements/${id}`}
        redirectTo={`/requirements/${id}`}
        fields={[
          { name: "title", label: "需求标题 / Título da necessidade", required: true },
          { name: "requirement_type", label: "需求类型 / Tipo da necessidade", type: "select", options: [{ value: "beneficio", label: "员工福利 / Benefício" }, { value: "patrimonial", label: "企业财产 / Patrimonial" }, { value: "frota", label: "车队保险 / Frota" }, { value: "transporte", label: "货运运输 / Transporte" }, { value: "responsabilidade", label: "责任险 / Responsabilidade civil" }, { value: "cyber", label: "网络安全 / Cyber" }, { value: "garantia", label: "保证保险 / Garantia" }, { value: "outros", label: "其他 / Outros" }] },
          { name: "current_insurer_name", label: "现保险公司 / Seguradora atual" },
          { name: "contract_end_date", label: "合同到期日 / Vencimento do contrato", type: "date" },
          { name: "company_size_type", label: "类型 PJ/PME / Tipo PJ/PME", type: "select", options: [{ value: "PJ", label: "PJ" }, { value: "PME", label: "PME" }] },
          { name: "insured_lives_count", label: "在保人数 / Vidas seguradas", type: "number" },
          { name: "vehicle_count", label: "车辆数量 / Quantidade de veículos", type: "number" },
          { name: "insured_items_count", label: "标的数量 / Itens segurados", type: "number" },
          { name: "annual_revenue", label: "年营收 / Faturamento anual", type: "number" },
          { name: "estimated_premium", label: "预计保费 / Prêmio estimado", type: "number" },
          { name: "sum_insured", label: "保险金额 / Valor segurado", type: "number" },
          { name: "desired_start_date", label: "期望起保日 / Início desejado", type: "date" },
          { name: "deadline", label: "截止日 / Prazo", type: "date" },
          { name: "next_action_date", label: "下一步日期 / Próxima ação", type: "date" },
          {
            name: "status",
            label: "状态 / Status",
            type: "select",
            options: [
              { value: "draft", label: "草稿 / Rascunho" },
              { value: "collecting_information", label: "收集资料 / Coletando informações" },
              { value: "ready_for_market", label: "可提交市场 / Pronto para mercado" },
              { value: "submitted_to_partner", label: "已提交合作方 / Enviado ao parceiro" },
              { value: "waiting_for_quote", label: "等待报价 / Aguardando cotação" },
              { value: "quote_received", label: "已收报价 / Cotação recebida" },
              { value: "quote_presented", label: "已展示报价 / Cotação apresentada" },
              { value: "negotiating", label: "谈判中 / Em negociação" },
              { value: "won", label: "已成交 / Ganho" },
              { value: "lost", label: "已丢失 / Perdido" },
              { value: "cancelled", label: "已取消 / Cancelado" },
              { value: "renewal_pending", label: "待续保 / Renovação pendente" }
            ],
            required: true
          },
          { name: "description", label: "需求描述 / Descrição da necessidade", type: "textarea", full: true },
          { name: "next_action", label: "下一步 / Próxima ação", type: "textarea", full: true }
        ]}
      />
    </Shell>
  );
}
