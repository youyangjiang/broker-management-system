import { DashboardMetrics } from "./DashboardMetrics";
import { AppStatus } from "./components/AppStatus";
import { NotificationSettings } from "./components/NotificationSettings";
import { Shell } from "./components/Shell";

export default function Home() {
  return (
    <Shell title="首页 / Início">
      <div className="stack">
        <AppStatus />
        <NotificationSettings />
        <DashboardMetrics />
      </div>
    </Shell>
  );
}
