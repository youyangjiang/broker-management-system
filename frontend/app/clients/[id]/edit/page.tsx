import { EntityEditForm } from "../../../components/EntityEditForm";
import { Shell } from "../../../components/Shell";

const industryOptions = [
  ["能源", "Energia"], ["汽车", "Automotivo"], ["物流", "Logística"], ["科技", "Tecnologia"], ["进出口", "Importação e exportação"], ["金融", "Financeiro"], ["零售", "Varejo"],
  ["制造业", "Indústria"], ["建筑工程", "Construção"], ["房地产", "Imobiliário"], ["医疗健康", "Saúde"], ["教育", "Educação"], ["餐饮酒店", "Hotelaria e alimentação"],
  ["农业", "Agronegócio"], ["矿业", "Mineração"], ["化工", "Químico"], ["电商", "E-commerce"], ["咨询服务", "Consultoria"], ["法律会计", "Jurídico e contábil"], ["旅游", "Turismo"]
].map(([value, pt]) => ({ value, label: `${value} / ${pt}` }));

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="编辑客户 / Editar cliente">
      <EntityEditForm
        endpoint={`/clients/${id}`}
        redirectTo={`/clients/${id}`}
        fields={[
          { name: "legal_name", label: "法定名称 / Razão social", required: true },
          { name: "trade_name", label: "商业名称 / Nome fantasia" },
          { name: "cnpj", label: "CNPJ", mask: "cnpj" },
          { name: "cpf", label: "CPF", mask: "cpf" },
          { name: "industry", label: "行业 / Setor", type: "select", options: industryOptions },
          { name: "email", label: "邮箱 / E-mail", type: "email" },
          { name: "phone", label: "手机 / Celular", mask: "phone" },
          { name: "postal_code", label: "CEP / CEP", mask: "cep", autoFillAddress: true },
          { name: "street", label: "街道 / Logradouro" },
          { name: "address_number", label: "门牌号 / Número" },
          { name: "address_complement", label: "补充地址 / Complemento" },
          { name: "district", label: "区域 / Bairro" },
          { name: "city", label: "城市 / Cidade" },
          { name: "state", label: "州 / UF" },
          { name: "importance_level", label: "重要等级 / Importância", type: "select", options: [{ value: "普通", label: "普通 / Normal" }, { value: "重要", label: "重要 / Importante" }, { value: "VIP", label: "VIP" }] },
          { name: "status", label: "状态 / Status", type: "select", options: [{ value: "lead", label: "潜在 / Lead" }, { value: "active", label: "活跃 / Ativo" }, { value: "inactive", label: "暂停 / Inativo" }, { value: "lost", label: "流失 / Perdido" }], required: true },
          { name: "notes", label: "备注 / Observações", type: "textarea", full: true }
        ]}
      />
    </Shell>
  );
}
