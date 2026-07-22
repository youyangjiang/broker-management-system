import { EntityEditForm } from "../../../components/EntityEditForm";
import { Shell } from "../../../components/Shell";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="编辑用户 / Editar usuário">
      <EntityEditForm
        endpoint={`/users/${id}`}
        redirectTo="/users"
        fields={[
          { name: "full_name", label: "姓名 / Nome", required: true },
          { name: "email", label: "邮箱 / E-mail", type: "email", required: true },
          { name: "password", label: "新密码（留空不修改） / Nova senha", type: "password" },
          { name: "phone", label: "手机 / Celular", mask: "phone" },
          { name: "role_id", label: "用户组 / Grupo de usuário", type: "select", optionsEndpoint: "/roles", optionLabelKey: "name", required: true },
          { name: "status", label: "状态 / Status", type: "select", options: [{ value: "active", label: "启用 / Ativo" }, { value: "inactive", label: "停用 / Inativo" }], required: true },
          { name: "language", label: "语言 / Idioma", type: "select", options: [{ value: "zh-CN", label: "中文 / Chinês" }, { value: "pt-BR", label: "Português / 葡语" }] }
        ]}
      />
    </Shell>
  );
}
