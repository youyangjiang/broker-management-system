"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../lib/api";

export function DeleteButton({ endpoint, label, confirmMessage, redirectTo, onDeleted }: { endpoint: string; label: string; confirmMessage: string; redirectTo?: string; onDeleted?: () => void | Promise<void> }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (!window.confirm(confirmMessage)) return;
    setDeleting(true);
    setError("");
    try {
      await apiFetch(endpoint, { method: "DELETE" });
      if (onDeleted) {
        await onDeleted();
      } else if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败 / Falha ao excluir");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button className="button danger" type="button" onClick={remove} disabled={deleting}>
        {deleting ? "删除中 / Excluindo" : label}
      </button>
      {error ? <span className="error">{error}</span> : null}
    </>
  );
}
