import { EntityEditForm } from "../../../components/EntityEditForm";
import { Shell } from "../../../components/Shell";

export default async function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="编辑活动 / Editar atividade">
      <EntityEditForm
        endpoint={`/activities/${id}`}
        redirectTo={`/activities/${id}`}
        fields={[
          { name: "activity_type", label: "活动类型 / Tipo", type: "select", options: [{ value: "phone", label: "电话 / Telefone" }, { value: "email", label: "邮件 / E-mail" }, { value: "whatsapp", label: "WhatsApp" }, { value: "wechat", label: "WeChat" }, { value: "meeting", label: "会议 / Reunião" }, { value: "visit", label: "拜访 / Visita" }, { value: "note", label: "备注 / Nota" }], required: true },
          { name: "subject", label: "主题 / Assunto", required: true },
          { name: "activity_date", label: "发生时间 / Data e hora", type: "datetime-local", required: true },
          { name: "client_id", label: "关联客户 / Cliente vinculado", type: "select", optionsEndpoint: "/clients", optionLabelKey: "legal_name" },
          { name: "opportunity_id", label: "关联商机 / Oportunidade vinculada", type: "select", optionsEndpoint: "/opportunities", optionLabelKey: "title" },
          { name: "insurance_requirement_id", label: "关联需求 / Necessidade vinculada", type: "select", optionsEndpoint: "/requirements", optionLabelKey: "title" },
          { name: "next_action_date", label: "下一步日期 / Próxima ação", type: "date" },
          { name: "description", label: "内容 / Conteúdo", type: "textarea", full: true },
          { name: "outcome", label: "结果 / Resultado", type: "textarea", full: true },
          { name: "next_action", label: "下一步 / Próxima ação", type: "textarea", full: true }
        ]}
      />
    </Shell>
  );
}
