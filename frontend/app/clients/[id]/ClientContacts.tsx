"use client";

import { useEffect, useState } from "react";
import { DeleteButton } from "../../components/DeleteButton";
import { apiFetch } from "../../lib/api";

export function ClientContacts({ clientId }: { clientId: string }) {
  const [contacts, setContacts] = useState<Record<string, string>[]>([]);
  const [form, setForm] = useState({ full_name: "", job_title: "", email: "", phone: "", whatsapp: "", relationship_role: "", is_primary: false });
  const [error, setError] = useState("");

  async function load() {
    setContacts(await apiFetch<Record<string, string>[]>(`/clients/${clientId}/contacts`));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, [clientId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await apiFetch(`/clients/${clientId}/contacts`, { method: "POST", body: JSON.stringify(form) });
      setForm({ full_name: "", job_title: "", email: "", phone: "", whatsapp: "", relationship_role: "", is_primary: false });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败 / Falha ao salvar");
    }
  }

  return (
    <section className="panel">
      <div className="toolbar">
        <div className="toolbar-left">
          <strong>联系人 / Contatos</strong>
          <span className="muted">共 / Total {contacts.length}</span>
        </div>
      </div>
      <table className="table">
        <thead><tr><th>姓名 / Nome</th><th>职位 / Cargo</th><th>邮箱 / E-mail</th><th>电话 / Telefone</th><th>关系角色 / Papel</th><th>操作 / Ação</th></tr></thead>
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
          <div className="field"><label>姓名 / Nome</label><input required value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} /></div>
          <div className="field"><label>职位 / Cargo</label><input value={form.job_title} onChange={(event) => setForm({ ...form, job_title: event.target.value })} /></div>
          <div className="field"><label>邮箱 / E-mail</label><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
          <div className="field"><label>电话 / Telefone</label><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div>
          <div className="field"><label>WhatsApp</label><input value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} /></div>
          <div className="field"><label>关系角色 / Papel</label><input value={form.relationship_role} onChange={(event) => setForm({ ...form, relationship_role: event.target.value })} /></div>
        </div>
        {error ? <div className="error">{error}</div> : null}
        <button className="button" type="submit">添加联系人 / Adicionar contato</button>
      </form>
    </section>
  );
}
