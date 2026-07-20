import Link from "next/link";
import { DeleteButton } from "../../../components/DeleteButton";
import { EntityDetail } from "../../../components/EntityDetail";
import { Shell } from "../../../components/Shell";

export default async function BrokerPartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="联合经纪公司详情 / Detalhes da corretora">
      <div className="stack">
        <div className="toolbar-right">
          <Link className="button" href={`/partners/brokers/${id}/edit`}>编辑 / Editar</Link>
          <Link className="button secondary" href="/partners">返回合作伙伴 / Voltar</Link>
          <DeleteButton endpoint={`/broker-partners/${id}`} label="删除伙伴 / Excluir" confirmMessage="确认删除这个经纪伙伴吗？ / Confirmar exclusão desta corretora parceira?" redirectTo="/partners" />
        </div>
        <EntityDetail endpoint={`/broker-partners/${id}`} fields={[
          { key: "partner_code", label: "编号 / Código" },
          { key: "legal_name", label: "法定名称 / Razão social" },
          { key: "trade_name", label: "商业名称 / Nome fantasia" },
          { key: "cnpj", label: "CNPJ" },
          { key: "postal_code", label: "CEP / CEP" },
          { key: "street", label: "街道 / Logradouro" },
          { key: "address_number", label: "门牌号 / Número" },
          { key: "address_complement", label: "补充地址 / Complemento" },
          { key: "district", label: "区域 / Bairro" },
          { key: "city", label: "城市 / Cidade" },
          { key: "state", label: "州 / UF" },
          { key: "payment_terms_days", label: "付款周期 / Prazo" },
          { key: "default_commission_share_rate", label: "默认分佣比例 / Participação padrão" },
          { key: "status", label: "状态 / Status" },
          { key: "notes", label: "备注 / Observações" }
        ]} />
      </div>
    </Shell>
  );
}
