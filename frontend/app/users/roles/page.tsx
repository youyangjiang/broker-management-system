"use client";

import { useEffect, useState } from "react";
import { Shell } from "../../components/Shell";
import { apiFetch } from "../../lib/api";

type Role = {
  id: string;
  code: string;
  name: string;
  permission_codes?: string[];
  all_permissions?: Record<string, string>[];
};

const permissionLabels: Record<string, string> = {
  "clients.read": "查看客户 / Ver clientes",
  "clients.write": "编辑客户 / Editar clientes",
  "opportunities.read": "查看商机 / Ver oportunidades",
  "opportunities.write": "编辑商机 / Editar oportunidades",
  "requirements.read": "查看需求 / Ver necessidades",
  "requirements.write": "编辑需求 / Editar necessidades",
  "tasks.read": "查看任务 / Ver tarefas",
  "tasks.write": "编辑任务 / Editar tarefas",
  "users.read": "查看用户 / Ver usuários",
  "users.write": "编辑用户与权限 / Editar usuários e permissões",
  "audit.read": "查看审计 / Ver auditoria"
};

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch<Role[]>("/roles").then((rows) => {
      setRoles(rows);
      const first = rows[0];
      if (first) {
        setSelectedRoleId(first.id);
        setSelectedCodes(first.permission_codes || []);
      }
    }).catch((err) => setMessage(err.message));
  }, []);

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const permissions = selectedRole?.all_permissions || [];

  function chooseRole(roleId: string) {
    const role = roles.find((item) => item.id === roleId);
    setSelectedRoleId(roleId);
    setSelectedCodes(role?.permission_codes || []);
    setMessage("");
  }

  function toggle(code: string) {
    setSelectedCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  }

  async function save() {
    if (!selectedRoleId) return;
    await apiFetch(`/roles/${selectedRoleId}/permissions`, { method: "PATCH", body: JSON.stringify({ permission_codes: selectedCodes }) });
    setRoles((current) => current.map((role) => role.id === selectedRoleId ? { ...role, permission_codes: selectedCodes } : role));
    setMessage("权限已保存 / Permissões salvas");
  }

  return (
    <Shell title="权限设置 / Configuração de permissões">
      <section className="panel form-panel">
        <div className="form-grid">
          <div className="field">
            <label>角色 / Perfil</label>
            <select value={selectedRoleId} onChange={(event) => chooseRole(event.target.value)}>
              {roles.map((role) => <option key={role.id} value={role.id}>{role.name || role.code}</option>)}
            </select>
          </div>
        </div>
        <div className="permission-grid">
          {permissions.map((permission) => (
            <label key={permission.code} className="checkbox-row">
              <input type="checkbox" checked={selectedCodes.includes(permission.code)} onChange={() => toggle(permission.code)} />
              <span>{permissionLabels[permission.code] || permission.code}</span>
            </label>
          ))}
        </div>
        {message ? <p className="muted">{message}</p> : null}
        <button className="button" type="button" onClick={save}>保存权限 / Salvar permissões</button>
      </section>
    </Shell>
  );
}
