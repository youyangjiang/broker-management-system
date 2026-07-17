import { EntityCreateForm } from "../../../components/EntityCreateForm";
import { Shell } from "../../../components/Shell";

export default function NewBrokerPartnerPage() {
  return (
    <Shell title="新增联合经纪公司 / Nova corretora parceira">
      <EntityCreateForm
        endpoint="/broker-partners"
        redirectTo="/partners"
        fields={[
          { name: "legal_name", label: "法定名称 / Razão social", required: true },
          { name: "trade_name", label: "商业名称 / Nome fantasia" },
          { name: "cnpj", label: "CNPJ", mask: "cnpj" },
          { name: "postal_code", label: "CEP / CEP", mask: "cep", autoFillAddress: true },
          { name: "street", label: "街道 / Logradouro" },
          { name: "address_number", label: "门牌号 / Número" },
          { name: "address_complement", label: "补充地址 / Complemento" },
          { name: "district", label: "区域 / Bairro" },
          { name: "city", label: "城市 / Cidade" },
          { name: "state", label: "州 / UF" },
          { name: "payment_terms_days", label: "默认付款周期（天） / Prazo padrão (dias)", type: "number" },
          { name: "default_commission_share_rate", label: "默认我方分佣比例 / Participação padrão", type: "number" },
          { name: "status", label: "状态 / Status", type: "select", defaultValue: "active", options: [{ value: "active", label: "活跃 / Ativo" }, { value: "inactive", label: "停用 / Inativo" }], required: true },
          { name: "notes", label: "备注 / Observações", type: "textarea", full: true }
        ]}
      />
    </Shell>
  );
}
