import { Suspense } from "react";
import { Shell } from "../../components/Shell";
import { RequirementCreateForm } from "./RequirementCreateForm";

export default function NewRequirementPage() {
  return (
    <Shell title="新增保险需求 / Nova necessidade de seguro">
      <Suspense fallback={<div className="panel form-panel muted">加载中 / Carregando</div>}>
        <RequirementCreateForm />
      </Suspense>
    </Shell>
  );
}
