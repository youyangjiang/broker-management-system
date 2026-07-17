"use client";

import { DataTable } from "../components/DataTable";
import { Shell } from "../components/Shell";

export default function RequirementsPage() {
  return (
    <Shell title="保险需求 / Necessidades de seguro">
      <DataTable
        endpoint="/requirements"
        rowHref={(item) => `/requirements/${item.id}`}
        columns={[
          { key: "requirement_code", label: "需求编号 / Código" },
          { key: "title", label: "标题 / Título" },
          { key: "estimated_premium", label: "预计保费 / Prêmio estimado" },
          { key: "deadline", label: "截止日 / Prazo" },
          { key: "status", label: "状态 / Status" }
        ]}
      />
    </Shell>
  );
}
