"use client";

import { DataTable } from "../components/DataTable";
import { Shell } from "../components/Shell";
import { useLanguage } from "../components/LanguageProvider";

export default function PartnersPage() {
  const { t } = useLanguage();
  return (
    <Shell title="合作伙伴 / Parceiros">
      <div className="stack">
        <section>
          <h2>{t("联合经纪公司 / Corretoras parceiras")}</h2>
          <DataTable
            endpoint="/broker-partners"
            createHref="/partners/brokers/new"
            rowHref={(item) => `/partners/brokers/${item.id}`}
            columns={[
              { key: "partner_code", label: "编号 / Código" },
              { key: "legal_name", label: "法定名称 / Razão social" },
              { key: "trade_name", label: "商业名称 / Nome fantasia" },
              { key: "cnpj", label: "CNPJ" },
              { key: "status", label: "状态 / Status" }
            ]}
          />
        </section>
        <section>
          <h2>{t("渠道商 / Parceiros de canal")}</h2>
          <DataTable
            endpoint="/channel-partners"
            createHref="/partners/channels/new"
            rowHref={(item) => `/partners/channels/${item.id}`}
            columns={[
              { key: "channel_code", label: "编号 / Código" },
              { key: "legal_name", label: "名称 / Nome" },
              { key: "partner_type", label: "类型 / Tipo" },
              { key: "contact_name", label: "联系人 / Contato" },
              { key: "status", label: "状态 / Status" }
            ]}
          />
        </section>
      </div>
    </Shell>
  );
}
