"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { APP_BUILD, APP_VERSION } from "../lib/appVersion";

export function AppStatus() {
  const [updateReady, setUpdateReady] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;
      if (registration.waiting) setUpdateReady(true);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(true);
        });
      });
    });
  }, []);

  async function upgradeApp() {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.update()));
      const waiting = registrations.find((registration) => registration.waiting)?.waiting;
      if (waiting) waiting.postMessage({ type: "SKIP_WAITING" });
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith("huakan-care-")).map((key) => caches.delete(key)));
    }
    window.location.reload();
  }

  return (
    <section className="panel app-status">
      <div>
        <span className="muted">当前版本 / Versão atual</span>
        <strong>v{APP_VERSION}</strong>
        <span className="muted">Build {APP_BUILD}</span>
      </div>
      <div>
        <span className="muted">安装状态 / Instalação</span>
        <strong>{installed ? "已安装 / Instalado" : "浏览器访问 / Navegador"}</strong>
        <span className="muted">{updateReady ? "发现可用更新 / Atualização disponível" : "已是最新 / Atualizado"}</span>
      </div>
      <button className="button secondary" type="button" onClick={upgradeApp}>
        <RefreshCw size={16} />
        一键升级 / Atualizar
      </button>
    </section>
  );
}
