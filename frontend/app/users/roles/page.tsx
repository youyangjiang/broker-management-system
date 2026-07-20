"use client";

import { useEffect, useMemo, useState } from "react";
import { Shell } from "../../components/Shell";
import { apiFetch } from "../../lib/api";

type Permission = {
  id: string;
  code: string;
  name: string;
};

type Role = {
  id: string;
  code: string;
  name: string;
  description?: string;
  permission_codes?: string[];
  all_permissions?: Permission[];
};

const permissionLabels: Record<string, string> = {
  "clients.read": "查看客户 / Ver clientes",
  "clients.write": "新增、编辑、删除客户 / Criar, editar e excluir clientes",
  "opportunities.read": "查看商机 / Ver oportunidades",
  "opportunities.write": "新增、编辑、删除商机 / Criar, editar e excluir oportunidades",
  "requirements.read": "查看需求、报价、分配 / Ver necessidades, cotações e distribuições",
  "requirements.write": "管理需求、报价、分配和保单 / Gerenciar necessidades, cotações, distribuições e apólices",
  "tasks.read": "查看任务 / Ver tarefas",
  "tasks.write": "新增、编辑、删除任务 / Criar, editar e excluir tarefas",
  "users.read": "查看用户和分组 / Ver usuários e grupos",
  "users.write": "管理用户、分组和权限 / Gerenciar usuários, grupos e permissões",
  "audit.read": "查看审计记录 / Ver auditoria"
};

const groupLabels: Record<string, string> = {
  clients: "客户 / Clientes",
  opportunities: "商机 / Oportunidades",
  requirements: "需求、报价、保单 / Necessidades, cotações e apólices",
  tasks: "任务 / Tarefas",
  users: "用户与权限 / Usuários e permissões",
  audit: "审计 / Auditoria",
  other: "其他 / Outros"
};

function permissionGroup(code: string) {
  return code.split(".")[0] || "other";
}

function emptyRoleForm() {
  return { code: "", name: "", description: "" };
}

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [form, setForm] = useState(emptyRoleForm());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load(preferredRoleId?: string) {
    const rows = await apiFetch<Role[]>("/roles");
    setRoles(rows);
    const selected = rows.find((role) => role.id === preferredRoleId) || rows.find((role) => role.id === selectedRoleId) || rows[0];
    if (selected) {
      chooseRoleFromRows(selected.id, rows);
    }
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const permissions = selectedRole?.all_permissions || roles[0]?.all_permissions || [];
  const groupedPermissions = useMemo(() => {
    return permissions.reduce<Record<string, Permission[]>>((groups, permission) => {
      const group = permissionGroup(permission.code);
      groups[group] = [...(groups[group] || []), permission];
      return groups;
    }, {});
  }, [permissions]);

  function chooseRoleFromRows(roleId: string, sourceRows = roles) {
    const role = sourceRows.find((item) => item.id === roleId);
    setSelectedRoleId(roleId);
    setSelectedCodes(role?.permission_codes || []);
    setForm({
      code: role?.code || "",
      name: role?.name || "",
      description: role?.description || ""
    });
    setMessage("");
    setError("");
  }

  function toggle(code: string) {
    setSelectedCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  }

  async function createGroup(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const created = await apiFetch<Role>("/roles", { method: "POST", body: JSON.stringify(form) });
      await load(created.id);
      setMessage("用户分组已创建 / Grupo criado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建失败 / Falha ao criar");
    } finally {
      setSaving(false);
    }
  }

  async function saveGroup() {
    if (!selectedRoleId) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await apiFetch(`/roles/${selectedRoleId}`, { method: "PATCH", body: JSON.stringify(form) });
      await apiFetch(`/roles/${selectedRoleId}/permissions`, { method: "PATCH", body: JSON.stringify({ permission_codes: selectedCodes }) });
      await load(selectedRoleId);
      setMessage("用户分组权限策略已保存 / Política salva");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败 / Falha ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function deleteGroup() {
    if (!selectedRole || selectedRole.code === "admin") return;
    const confirmed = window.confirm("确认停用这个用户分组吗？已有用户使用的分组不能停用。 / Confirmar desativação deste grupo?");
    if (!confirmed) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await apiFetch(`/roles/${selectedRoleId}`, { method: "DELETE" });
      await load();
      setMessage("用户分组已停用 / Grupo desativado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "停用失败 / Falha ao desativar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell title="用户分组权限策略 / Políticas de grupos de usuários">
      <div className="stack">
        <section className="panel form-panel">
          <div className="toolbar">
            <div className="toolbar-left">
              <strong>分组资料 / Dados do grupo</strong>
              <span className="muted">新增或选择一个分组后配置权限 / Crie ou selecione um grupo</span>
            </div>
          </div>
          <form className="form-grid" onSubmit={createGroup}>
            <div className="field">
              <label>选择分组 / Selecionar grupo</label>
              <select value={selectedRoleId} onChange={(event) => chooseRoleFromRows(event.target.value)}>
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name || role.code}</option>)}
              </select>
            </div>
            <div className="field">
              <label>分组代码 / Código do grupo</label>
              <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="sales_manager" required />
            </div>
            <div className="field">
              <label>分组名称 / Nome do grupo</label>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="业务经理 / Gerente comercial" required />
            </div>
            <div className="field full">
              <label>说明 / Descrição</label>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
            <div className="toolbar-right field full">
              <button className="button secondary" type="button" onClick={() => { setSelectedRoleId(""); setSelectedCodes([]); setForm(emptyRoleForm()); }}>准备新增 / Novo grupo</button>
              <button className="button" type="submit" disabled={saving}>创建分组 / Criar grupo</button>
              <button className="button" type="button" onClick={saveGroup} disabled={saving || !selectedRoleId}>保存策略 / Salvar política</button>
              <button className="button danger" type="button" onClick={deleteGroup} disabled={saving || !selectedRole || selectedRole.code === "admin"}>停用分组 / Desativar</button>
            </div>
          </form>
          {message ? <p className="muted">{message}</p> : null}
          {error ? <p className="error">{error}</p> : null}
        </section>

        <section className="panel form-panel">
          <div className="toolbar">
            <div className="toolbar-left">
              <strong>权限策略 / Política de permissões</strong>
              <span className="muted">{selectedRole ? `${selectedRole.name} (${selectedRole.code})` : "请选择分组 / Selecione um grupo"}</span>
            </div>
          </div>
          <div className="stack">
            {Object.entries(groupedPermissions).map(([group, groupPermissions]) => (
              <div key={group} className="permission-section">
                <h3>{groupLabels[group] || groupLabels.other}</h3>
                <div className="permission-grid">
                  {groupPermissions.map((permission) => (
                    <label key={permission.code} className="checkbox-row">
                      <input type="checkbox" checked={selectedCodes.includes(permission.code)} onChange={() => toggle(permission.code)} />
                      <span>{permissionLabels[permission.code] || permission.name || permission.code}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
