"use client";

import { DataTable } from "../components/DataTable";
import { Shell } from "../components/Shell";

export default function UsersPage() {
  return (
    <Shell title="用户与分组权限 / Usuários e grupos de permissões">
      <div className="stack">
        <DataTable
          endpoint="/users"
          createHref="/users/new"
          rowHref={(item) => `/users/${item.id}/edit`}
          columns={[
            { key: "full_name", label: "姓名 / Nome" },
            { key: "email", label: "邮箱 / E-mail" },
            { key: "phone", label: "手机 / Celular" },
            { key: "status", label: "状态 / Status" }
          ]}
        />
        <a className="button secondary" href="/users/roles">用户分组权限策略 / Políticas de grupos</a>
      </div>
    </Shell>
  );
}
