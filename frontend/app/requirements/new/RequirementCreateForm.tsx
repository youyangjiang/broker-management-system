"use client";

import { useSearchParams } from "next/navigation";
import { EntityCreateForm } from "../../components/EntityCreateForm";

export function RequirementCreateForm() {
  const searchParams = useSearchParams();
  const opportunityId = searchParams.get("opportunity_id") || "";

  return (
    <EntityCreateForm
      endpoint="/opportunities/required/requirements"
      endpointFromValues={(values) => `/opportunities/${values.opportunity_id}/requirements`}
      redirectTo="/requirements"
      redirectFromValues={(values) => (values.opportunity_id ? `/opportunities/${values.opportunity_id}` : "/requirements")}
      transform={(values) => Object.fromEntries(Object.entries(values).filter(([key, value]) => key !== "opportunity_id" && value !== ""))}
      fields={[
        { name: "opportunity_id", label: "所属商机 / Oportunidade vinculada", type: "select", optionsEndpoint: "/opportunities", optionLabelKey: "title", defaultValue: opportunityId, required: true },
        { name: "insurance_product_id", label: "保险产品 / Produto de seguro", type: "select", optionsEndpoint: "/insurance-products", optionLabelKey: "product_name_zh", required: true },
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
        { name: "description", label: "需求描述 / Descrição da necessidade", type: "textarea", full: true },
        { name: "next_action", label: "下一步 / Próxima ação", type: "textarea", full: true }
      ]}
    />
  );
}
