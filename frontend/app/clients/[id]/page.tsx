import Link from "next/link";
import { EntityDetail } from "../../components/EntityDetail";
import { Shell } from "../../components/Shell";
import { ClientContacts } from "./ClientContacts";
import { ClientLegalEntities } from "./ClientLegalEntities";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="客户详情 / Detalhes do cliente">
      <div className="stack">
        <div className="toolbar-right">
          <Link className="button" href={`/clients/${id}/edit`}>编辑客户 / Editar cliente</Link>
          <Link className="button" href={`/opportunities/new?client_id=${id}`}>创建商机 / Criar oportunidade</Link>
          <Link className="button secondary" href={`/tasks/new?client_id=${id}`}>创建任务 / Criar tarefa</Link>
          <Link className="button secondary" href={`/activities/new?client_id=${id}`}>记录活动 / Registrar atividade</Link>
          <Link className="button secondary" href="/clients">返回客户列表 / Voltar</Link>
        </div>
        <EntityDetail
          endpoint={`/clients/${id}`}
          fields={[
            { key: "client_code", label: "客户编号 / Código" },
            { key: "legal_name", label: "客户名称 / Nome do cliente" },
            { key: "trade_name", label: "商业名称 / Nome fantasia" },
            { key: "cnpj", label: "主 CNPJ / CNPJ principal" },
            { key: "cpf", label: "CPF" },
            { key: "phone", label: "手机 / Celular" },
            { key: "industry", label: "行业 / Setor" },
            { key: "importance_level", label: "重要等级 / Importância" },
            { key: "status", label: "状态 / Status" },
            { key: "notes", label: "备注 / Observações" }
          ]}
        />
        <ClientLegalEntities clientId={id} />
        <ClientContacts clientId={id} />
      </div>
    </Shell>
  );
}
