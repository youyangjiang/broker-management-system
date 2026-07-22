"use client";

import { useEffect, useMemo, useState } from "react";
import { Shell } from "../../components/Shell";
import { groupLabels, groupPermissions, permissionLabel, type Permission } from "../../components/PermissionLabels";
import { apiFetch } from "../../lib/api";

type Role = {
  id: string;
  code: string;
  name: string;
  description?: string;
  permission_codes?: string[];
  all_permissions?: Permission[];
};

type RoleForm = {
  code: string;
  name: string;
  description: string;
};

function emptyRoleForm(): RoleForm {
  return { code: "", name: "", description: "" };
}

function normalizeCode(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  try {
    const parsed = JSON.parse(error.message);
    return parsed.detail || fallback;
  } catch {
    return error.message || fallback;
  }
}

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [form, setForm] = useState<RoleForm>(emptyRoleForm());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load(preferredRoleId?: string) {
    const rows = await apiFetch<Role[]>("/roles");
    setRoles(rows);
    const selected = rows.find((role) => role.id === preferredRoleId) || rows.find((role) => role.id === selectedRoleId) || rows[0];
    if (selected) chooseRoleFromRows(selected.id, rows);
    if (!selected) prepareNewGroup();
  }

  useEffect(() => {
    load().catch((err) => setError(extractErrorMessage(err, "加载用户组失败 / Falha ao carregar grupos")));
  }, []);

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const permissions = selectedRole?.all_permissions || roles[0]?.all_permissions || [];
  const isNewGroup = !selectedRoleId;
  const groupedPermissions = useMemo(() => groupPermissions(permissions), [permissions]);

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

  function prepareNewGroup() {
    setSelectedRoleId("");
    setSelectedCodes([]);
    setForm(emptyRoleForm());
    setMessage("");
    setError("");
  }

  function toggle(code: string) {
    setSelectedCodes((current) => (current.includes(code) ? current.filter((item) => item !== code) : [...current, code]));
  }

  function setGroupCodes(codes: string[], checked: boolean) {
    setSelectedCodes((current) => {
      if (!checked) return current.filter((code) => !codes.includes(code));
      return Array.from(new Set([...current, ...codes]));
    });
  }

  async function submitGroup(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const payload = {
      ...form,
      code: normalizeCode(form.code),
      permission_codes: selectedCodes
    };
    try {
      if (isNewGroup) {
        const created = await apiFetch<Role>("/roles", { method: "POST", body: JSON.stringify(payload) });
        await load(created.id);
        setMessage("用户组已注册，权限已保存 / Grupo cadastrado e permissões salvas");
      } else {
        await apiFetch(`/roles/${selectedRoleId}`, { method: "PATCH", body: JSON.stringify(payload) });
        await apiFetch(`/roles/${selectedRoleId}/permissions`, { method: "PATCH", body: JSON.stringify({ permission_codes: selectedCodes }) });
        await load(selectedRoleId);
        setMessage("用户组和权限已保存 / Grupo e permissões salvos");
      }
    } catch (err) {
      setError(extractErrorMessage(err, "保存失败 / Falha ao salvar"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteGroup() {
    if (!selectedRole || selectedRole.code === "admin") return;
    const confirmed = window.confirm("确认停用这个用户组吗？如果已有用户使用该分组，请先把用户调整到其他分组。 / Confirmar desativação deste grupo?");
    if (!confirmed) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await apiFetch(`/roles/${selectedRoleId}`, { method: "DELETE" });
      await load();
      setMessage("用户组已停用 / Grupo desativado");
    } catch (err) {
      setError(extractErrorMessage(err, "停用失败 / Falha ao desativar"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell title="用户组注册和权限设置 / Cadastro de grupos e permissões">
      <div className="stack">
        <section className="panel form-panel">
          <div className="toolbar">
            <div className="toolbar-left">
              <strong>用户组资料 / Dados do grupo</strong>
              <span className="muted">用户组是基础权限；用户个人权限可以额外补充 / O grupo define a base de permissões</span>
            </div>
            <button className="button secondary" type="button" onClick={prepareNewGroup}>新增用户组 / Novo grupo</button>
          </div>

          <form className="form-grid" onSubmit={submitGroup}>
            <div className="field">
              <label>选择现有用户组 / Selecionar grupo</label>
              <select value={selectedRoleId} onChange={(event) => chooseRoleFromRows(event.target.value)}>
                <option value="">新增用户组 / Novo grupo</option>
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name || role.code}</option>)}
              </select>
            </div>
            <div className="field">
              <label>用户组代码 / Código do grupo</label>
              <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="sales_manager" required disabled={selectedRole?.code === "admin"} />
            </div>
            <div className="field">
              <label>用户组名称 / Nome do grupo</label>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="业务经理 / Gerente comercial" required />
            </div>
            <div className="field">
              <label>已选权限 / Permissões selecionadas</label>
              <input value={`${selectedCodes.length} / ${permissions.length}`} readOnly />
            </div>
            <div className="field full">
              <label>说明 / Descrição</label>
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="例如：负责客户、商机和任务管理 / Ex.: gestão de clientes, oportunidades e tarefas" />
            </div>
            <div className="toolbar-right field full">
              <button className="button" type="submit" disabled={saving}>{saving ? "保存中 / Salvando" : isNewGroup ? "注册用户组并保存权限 / Cadastrar grupo" : "保存用户组权限 / Salvar permissões"}</button>
              <button className="button secondary" type="button" onClick={prepareNewGroup}>清空 / Limpar</button>
              <button className="button danger" type="button" onClick={deleteGroup} disabled={saving || !selectedRole || selectedRole.code === "admin"}>停用用户组 / Desativar grupo</button>
            </div>
          </form>
          {message ? <p className="muted">{message}</p> : null}
          {error ? <p className="error">{error}</p> : null}
        </section>

        <section className="panel form-panel">
          <div className="toolbar">
            <div className="toolbar-left">
              <strong>组权限设置 / Permissões do grupo</strong>
              <span className="muted">{selectedRole ? `${selectedRole.name} (${selectedRole.code})` : "正在注册新用户组 / Cadastrando novo grupo"}</span>
            </div>
          </div>
          <div className="stack">
            {Object.entries(groupedPermissions).map(([group, groupItems]) => {
              const groupCodes = groupItems.map((permission) => permission.code);
              const allChecked = groupCodes.every((code) => selectedCodes.includes(code));
              return (
                <div key={group} className="permission-section">
                  <div className="toolbar">
                    <h3>{groupLabels[group] || groupLabels.other}</h3>
                    <label className="checkbox-row compact">
                      <input type="checkbox" checked={allChecked} onChange={(event) => setGroupCodes(groupCodes, event.target.checked)} />
                      <span>本组全选 / Selecionar grupo</span>
                    </label>
                  </div>
                  <div className="permission-grid">
                    {groupItems.map((permission) => (
                      <label key={permission.code} className="checkbox-row">
                        <input type="checkbox" checked={selectedCodes.includes(permission.code)} onChange={() => toggle(permission.code)} />
                        <span>{permissionLabel(permission)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Shell>
  );
}
