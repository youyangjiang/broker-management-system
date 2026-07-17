"use client";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
export function TaskActions({ taskId }: { taskId: string }) { const router = useRouter(); async function markDone() { await apiFetch(`/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status: "done" }) }); router.refresh(); } return <button className="button" type="button" onClick={markDone}>标记完成 / Concluir</button>; }
