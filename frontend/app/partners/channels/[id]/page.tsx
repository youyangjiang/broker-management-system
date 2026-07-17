import Link from "next/link";
import { EntityDetail } from "../../../components/EntityDetail";
import { Shell } from "../../../components/Shell";

export default async function ChannelPartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="渠道商详情 / Detalhes do parceiro de canal">
      <div className="stack">
        <div className="toolbar-right">
          <Link className="button" href={`/partners/channels/${id}/edit`}>编辑 / Editar</Link>
          <Link className="button secondary" href="/partners">返回合作伙伴 / Voltar</Link>
        </div>
        <EntityDetail
          endpoint={`/channel-partners/${id}`}
          fields={[
            { key: "channel_code", label: "编号 / Código" },
            { key: "legal_name", label: "名称 / Nome" },
            { key: "partner_type", label: "类型 / Tipo" },
            { key: "cnpj", label: "CNPJ" },
            { key: "cpf", label: "CPF" },
            { key: "contact_name", label: "联系人 / Contato" },
            { key: "postal_code", label: "CEP / CEP" },
            { key: "street", label: "街道 / Logradouro" },
            { key: "address_number", label: "门牌号 / Número" },
            { key: "address_complement", label: "补充地址 / Complemento" },
            { key: "district", label: "区域 / Bairro" },
            { key: "city", label: "城市 / Cidade" },
            { key: "state", label: "州 / UF" },
            { key: "default_share_type", label: "默认分成类型 / Tipo de repasse" },
            { key: "default_share_rate", label: "默认比例 / Percentual padrão" },
            { key: "default_fixed_amount", label: "默认固定金额 / Valor fixo padrão" },
            { key: "importance_level", label: "重要等级 / Importância" },
            { key: "status", label: "状态 / Status" }
          ]}
        />
      </div>
    </Shell>
  );
}
