import { EntityCreateForm } from "../../../components/EntityCreateForm";
import { Shell } from "../../../components/Shell";

export default function NewChannelPartnerPage() {
  return (
    <Shell title="新增渠道商 / Novo parceiro de canal">
      <EntityCreateForm
        endpoint="/channel-partners"
        redirectTo="/partners"
        fields={[
          { name: "partner_type", label: "类型 / Tipo", type: "select", defaultValue: "company", options: [{ value: "company", label: "企业 / Empresa" }, { value: "individual", label: "个人 / Pessoa física" }], required: true },
          { name: "legal_name", label: "名称 / Nome", required: true },
          { name: "cnpj", label: "CNPJ", mask: "cnpj" },
          { name: "cpf", label: "CPF", mask: "cpf" },
          { name: "contact_name", label: "联系人 / Contato" },
          { name: "postal_code", label: "CEP / CEP", mask: "cep", autoFillAddress: true },
          { name: "street", label: "街道 / Logradouro" },
          { name: "address_number", label: "门牌号 / Número" },
          { name: "address_complement", label: "补充地址 / Complemento" },
          { name: "district", label: "区域 / Bairro" },
          { name: "city", label: "城市 / Cidade" },
          { name: "state", label: "州 / UF" },
          { name: "default_share_type", label: "默认分成类型 / Tipo de repasse", type: "select", options: [{ value: "rate", label: "比例 / Percentual" }, { value: "fixed", label: "固定金额 / Valor fixo" }] },
          { name: "default_share_rate", label: "默认比例 / Percentual padrão", type: "number" },
          { name: "default_fixed_amount", label: "默认固定金额 / Valor fixo padrão", type: "number" },
          { name: "payment_terms_days", label: "付款周期（天） / Prazo (dias)", type: "number" },
          { name: "importance_level", label: "重要等级 / Importância", type: "select", options: [{ value: "普通", label: "普通 / Normal" }, { value: "重要", label: "重要 / Importante" }, { value: "VIP", label: "VIP" }] },
          { name: "maintenance_frequency_days", label: "维护频率（天） / Frequência (dias)", type: "number" },
          { name: "status", label: "状态 / Status", type: "select", defaultValue: "active", options: [{ value: "active", label: "活跃 / Ativo" }, { value: "inactive", label: "停用 / Inativo" }], required: true }
        ]}
      />
    </Shell>
  );
}
