"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "../../lib/api";

export function OpportunityDeleteButton({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function deleteOpportunity() {
    const confirmed = window.confirm("确认删除这个商机和其需求子项吗？ / Confirmar exclusão desta oportunidade e suas necessidades?");
    if (!confirmed) return;
    setDeleting(true);
    setError("");
    try {
      await apiFetch(`/opportunities/${opportunityId}`, { method: "DELETE" });
      router.push("/opportunities");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除失败 / Falha ao excluir");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button className="button danger" type="button" onClick={deleteOpportunity} disabled={deleting}>
        {deleting ? "删除中 / Excluindo" : "删除商机 / Excluir"}
      </button>
      {error ? <span className="error">{error}</span> : null}
    </>
  );
}
