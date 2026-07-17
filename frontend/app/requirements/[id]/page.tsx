import Link from "next/link";
import { EntityDetail } from "../../components/EntityDetail";
import { Shell } from "../../components/Shell";
import { RequirementAssignments } from "./RequirementAssignments";
import { RequirementQuotes } from "./RequirementQuotes";

export default async function RequirementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="保险需求详情 / Detalhe da necessidade">
      <div className="stack">
        <div className="toolbar-right">
          <Link className="button" href={`/requirements/${id}/edit`}>
            编辑需求 / Editar
          </Link>
          <Link className="button secondary" href="/requirements">
            返回需求列表 / Voltar
          </Link>
        </div>
        <EntityDetail
          endpoint={`/requirements/${id}`}
          fields={[
            { key: "requirement_code", label: "需求编号 / Código" },
            { key: "title", label: "标题 / Título" },
            { key: "requirement_type", label: "需求类型 / Tipo" },
            { key: "current_insurer_name", label: "现保险公司 / Seguradora atual" },
            { key: "contract_end_date", label: "合同到期日 / Vencimento" },
            { key: "company_size_type", label: "PJ/PME" },
            { key: "insured_lives_count", label: "在保人数 / Vidas seguradas" },
            { key: "vehicle_count", label: "车辆数量 / Veículos" },
            { key: "insured_items_count", label: "标的数量 / Itens segurados" },
            { key: "annual_revenue", label: "年营收 / Faturamento anual" },
            { key: "estimated_premium", label: "预计保费 / Prêmio estimado" },
            { key: "sum_insured", label: "保险金额 / Valor segurado" },
            { key: "desired_start_date", label: "期望起保日 / Início desejado" },
            { key: "deadline", label: "截止日 / Prazo" },
            { key: "status", label: "状态 / Status" },
            { key: "next_action_date", label: "下一步日期 / Próxima ação" },
            { key: "next_action", label: "下一步 / Próxima ação" }
          ]}
        />
        <RequirementAssignments requirementId={id} />
        <RequirementQuotes requirementId={id} />
      </div>
    </Shell>
  );
}
