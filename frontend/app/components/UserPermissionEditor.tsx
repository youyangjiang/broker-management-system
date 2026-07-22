"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { groupLabels, groupPermissions, permissionLabel, type Permission } from "./PermissionLabels";
import { useLanguage } from "./LanguageProvider";

type UserPermissionData = {
  id: string;
  full_name: string;
  email: string;
  role_name?: string;
  role_permission_codes?: string[];
  user_permission_codes?: string[];
  effective_permission_codes?: string[];
  all_permissions?: Permission[];
};

function extractErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;
  try {
    const parsed = JSON.parse(error.message);
    return parsed.detail || fallback;
  } catch {
    return error.message || fallback;
  }
}

export function UserPermissionEditor({ userId }: { userId: string }) {
  const { t } = useLanguage();
  const [data, setData] = useState<UserPermissionData | null>(null);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const user = await apiFetch<UserPermissionData>(`/users/${userId}`);
    setData(user);
    setSelectedCodes(user.user_permission_codes || []);
  }

  useEffect(() => {
    load().catch((err) => setError(extractErrorMessage(err, t("加载用户权限失败 / Falha ao carregar permissões"))));
  }, [userId]);

  const permissions = data?.all_permissions || [];
  const roleCodes = data?.role_permission_codes || [];
  const effectiveCodes = data?.effective_permission_codes || [];
  const groupedPermissions = useMemo(() => groupPermissions(permissions), [permissions]);

  function toggle(code: string) {
    setSelectedCodes((current) => (current.includes(code) ? current.filter((item) => item !== code) : [...current, code]));
  }

  function setGroupCodes(codes: string[], checked: boolean) {
    setSelectedCodes((current) => {
      if (!checked) return current.filter((code) => !codes.includes(code));
      return Array.from(new Set([...current, ...codes]));
    });
  }

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await apiFetch(`/users/${userId}/permissions`, {
        method: "PATCH",
        body: JSON.stringify({ permission_codes: selectedCodes })
      });
      await load();
      setMessage(t("用户个人权限已保存 / Permissões individuais salvas"));
    } catch (err) {
      setError(extractErrorMessage(err, t("保存用户权限失败 / Falha ao salvar permissões")));
    } finally {
      setSaving(false);
    }
  }

  if (error && !data) return <section className="panel form-panel error">{error}</section>;
  if (!data) return <section className="panel form-panel muted">{t("加载用户权限 / Carregando permissões")}</section>;

  return (
    <section className="panel form-panel">
      <div className="toolbar">
        <div className="toolbar-left">
          <strong>{t("用户个人权限 / Permissões individuais")}</strong>
          <span className="muted">{t("用户权限高于用户组权限；这里勾选的是额外授权 / Permissões do usuário complementam o grupo")}</span>
        </div>
        <button className="button" type="button" onClick={save} disabled={saving}>
          {saving ? t("保存中 / Salvando") : t("保存个人权限 / Salvar permissões")}
        </button>
      </div>

      <div className="detail-grid permission-summary">
        <div className="detail-item">
          <span>{t("用户组 / Grupo")}</span>
          <strong>{data.role_name || "-"}</strong>
        </div>
        <div className="detail-item">
          <span>{t("用户组权限 / Permissões do grupo")}</span>
          <strong>{roleCodes.length}</strong>
        </div>
        <div className="detail-item">
          <span>{t("个人额外权限 / Permissões individuais")}</span>
          <strong>{selectedCodes.length}</strong>
        </div>
        <div className="detail-item">
          <span>{t("最终生效权限 / Permissões efetivas")}</span>
          <strong>{effectiveCodes.length}</strong>
        </div>
      </div>

      <div className="stack">
        {Object.entries(groupedPermissions).map(([group, groupItems]) => {
          const groupCodes = groupItems.map((permission) => permission.code);
          const allChecked = groupCodes.every((code) => selectedCodes.includes(code));
          return (
            <div key={group} className="permission-section">
              <div className="toolbar">
                <h3>{t(groupLabels[group] || groupLabels.other)}</h3>
                <label className="checkbox-row compact">
                  <input type="checkbox" checked={allChecked} onChange={(event) => setGroupCodes(groupCodes, event.target.checked)} />
                  <span>{t("本组全选 / Selecionar grupo")}</span>
                </label>
              </div>
              <div className="permission-grid">
                {groupItems.map((permission) => {
                  const fromRole = roleCodes.includes(permission.code);
                  const checked = selectedCodes.includes(permission.code);
                  return (
                    <label key={permission.code} className={`checkbox-row ${fromRole ? "permission-inherited" : ""}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggle(permission.code)} />
                      <span>{t(permissionLabel(permission))}{fromRole ? ` · ${t("组已有 / Do grupo")}` : ""}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {message ? <p className="muted">{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
