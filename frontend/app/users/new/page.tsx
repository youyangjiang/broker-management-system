import { EntityCreateForm } from "../../components/EntityCreateForm";
import { Shell } from "../../components/Shell";

export default function NewUserPage() {
  return (
    <Shell title="新增用户 / Novo usuário">
      <EntityCreateForm
        endpoint="/users"
        redirectTo="/users"
        fields={[
          { name: "full_name", label: "姓名 / Nome", required: true },
          { name: "email", label: "邮箱 / E-mail", type: "email", required: true },
          { name: "password", label: "密码 / Senha", type: "password", required: true },
          { name: "phone", label: "手机 / Celular", mask: "phone" },
          { name: "role_id", label: "用户组 / Grupo de usuário", type: "select", optionsEndpoint: "/roles", optionLabelKey: "name", required: true },
          { name: "status", label: "状态 / Status", type: "select", defaultValue: "active", options: [{ value: "active", label: "启用 / Ativo" }, { value: "inactive", label: "停用 / Inativo" }], required: true },
          { name: "language", label: "语言 / Idioma", type: "select", defaultValue: "zh-CN", options: [{ value: "zh-CN", label: "中文 / Chinês" }, { value: "pt-BR", label: "Português / 葡语" }] }
        ]}
      />
    </Shell>
  );
}
