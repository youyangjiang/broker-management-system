"use client";

import { useEffect, useState } from "react";
import { DeleteButton } from "../../components/DeleteButton";
import { applyMask, validateMaskedValue, type FieldConfig } from "../../components/EntityCreateForm";
import { useLanguage } from "../../components/LanguageProvider";
import { apiFetch } from "../../lib/api";

const emptyForm = { full_name: "", job_title: "", email: "", phone: "", whatsapp: "", relationship_role: "", is_primary: false };
const phoneField: FieldConfig = { name: "phone", label: "电话 / Telefone", mask: "phone" };
const whatsappField: FieldConfig = { name: "whatsapp", label: "WhatsApp", mask: "phone" };

export function ClientContacts({ clientId }: { clientId: string }) {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState<Record<string, string>[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function load() {
    setContacts(await apiFetch<Record<string, string>[]>(`/clients/${clientId}/contacts`));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [clientId]);

  function updatePhone(fieldName: "phone" | "whatsapp", value: string) {
    const field = fieldName === "phone" ? phoneField : whatsappField;
    const maskedValue = applyMask(value, "phone");
    setForm((current) => ({ ...current, [fieldName]: maskedValue }));
    setFieldErrors((current) => ({ ...current, [fieldName]: validateMaskedValue(field, maskedValue) }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const nextErrors = {
      phone: validateMaskedValue(phoneField, form.phone),
      whatsapp: validateMaskedValue(whatsappField, form.whatsapp)
    };
    const activeErrors = Object.fromEntries(Object.entries(nextErrors).filter(([, message]) => message));
    setFieldErrors(activeErrors);
    if (Object.keys(activeErrors).length) return;

    try {
      await apiFetch(`/clients/${clientId}/contacts`, { method: "POST", body: JSON.stringify(form) });
      setForm(emptyForm);
      setFieldErrors({});
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("保存失败 / Falha ao salvar"));
    }
  }

  return (
    <section className="panel">
      <div className="toolbar">
        <div className="toolbar-left">
          <strong>{t("联系人 / Contatos")}</strong>
          <span className="muted">{t("共 / Total")} {contacts.length}</span>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>{t("姓名 / Nome")}</th>
            <th>{t("职位 / Cargo")}</th>
            <th>{t("邮箱 / E-mail")}</th>
            <th>{t("电话 / Telefone")}</th>
            <th>{t("关系角色 / Papel")}</th>
            <th>{t("操作 / Ação")}</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.full_name}</td>
              <td>{contact.job_title || "-"}</td>
              <td>{contact.email || "-"}</td>
              <td>{contact.phone || contact.whatsapp || "-"}</td>
              <td>{contact.relationship_role || "-"}</td>
              <td><DeleteButton endpoint={`/client-contacts/${contact.id}`} label="删除 / Excluir" confirmMessage="确认删除这个联系人吗？ / Confirmar exclusão deste contato?" onDeleted={load} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <form className="form form-panel" onSubmit={submit}>
        <div className="form-grid">
          <div className="field"><label>{t("姓名 / Nome")}</label><input required value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></div>
          <div className="field"><label>{t("职位 / Cargo")}</label><input value={form.job_title} onChange={(event) => setForm({ ...form, job_title: event.target.value })} /></div>
          <div className="field"><label>{t("邮箱 / E-mail")}</label><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
          <div className="field">
            <label>{t("电话 / Telefone")}</label>
            <input inputMode="numeric" value={form.phone} onChange={(event) => updatePhone("phone", event.target.value)} />
            {fieldErrors.phone ? <span className="error">{t(fieldErrors.phone)}</span> : null}
          </div>
          <div className="field">
            <label>WhatsApp</label>
            <input inputMode="numeric" value={form.whatsapp} onChange={(event) => updatePhone("whatsapp", event.target.value)} />
            {fieldErrors.whatsapp ? <span className="error">{t(fieldErrors.whatsapp)}</span> : null}
          </div>
          <div className="field"><label>{t("关系角色 / Papel")}</label><input value={form.relationship_role} onChange={(event) => setForm({ ...form, relationship_role: event.target.value })} /></div>
        </div>
        {error ? <div className="error">{t(error)}</div> : null}
        <button className="button" type="submit">{t("添加联系人 / Adicionar contato")}</button>
      </form>
    </section>
  );
}
