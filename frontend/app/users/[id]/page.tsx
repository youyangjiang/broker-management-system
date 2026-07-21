import Link from "next/link";
import { DeleteButton } from "../../components/DeleteButton";
import { EntityDetail } from "../../components/EntityDetail";
import { Shell } from "../../components/Shell";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Shell title="用户详情 / Detalhes do usuário">
      <div className="stack">
        <div className="toolbar-right">
          <Link className="button" href={`/users/${id}/edit`}>编辑用户 / Editar usuário</Link>
          <Link className="button secondary" href="/users">返回用户列表 / Voltar</Link>
          <DeleteButton endpoint={`/users/${id}`} label="删除用户 / Excluir" confirmMessage="确认删除这个用户吗？ / Confirmar exclusão deste usuário?" redirectTo="/users" />
        </div>
        <EntityDetail endpoint={`/users/${id}`} fields={[
          { key: "full_name", label: "姓名 / Nome" },
          { key: "email", label: "邮箱 / E-mail" },
          { key: "phone", label: "手机 / Celular" },
          { key: "role_id", label: "用户组 / Grupo" },
          { key: "status", label: "状态 / Status" },
          { key: "language", label: "语言 / Idioma" },
          { key: "timezone", label: "时区 / Fuso horário" },
          { key: "last_login_at", label: "最后登录 / Último acesso" }
        ]} />
      </div>
    </Shell>
  );
}
