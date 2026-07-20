"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function NotificationSettings() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const isSupported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setSupported(isSupported);
    if (isSupported) setPermission(Notification.permission);
  }, []);

  async function enableNotifications() {
    if (!supported) {
      setMessage("当前浏览器不支持通知 / Navegador sem suporte a notificações");
      return;
    }
    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    if (nextPermission !== "granted") {
      setMessage("通知权限未开启 / Permissão não concedida");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    if (!PUBLIC_VAPID_KEY) {
      registration.showNotification("华康医保", {
        body: "本机通知已开启。服务器推送需要配置 VAPID 密钥。",
        icon: "/icons/icon-192-v2.png",
        badge: "/icons/icon-192-v2.png"
      });
      setMessage("本机通知已开启；服务器推送待配置 / Notificação local ativa; push do servidor pendente");
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
    });
    await apiFetch("/notifications/subscriptions", { method: "POST", body: JSON.stringify(subscription.toJSON()) });
    setMessage("通知推送已开启 / Notificações ativadas");
  }

  async function sendTestNotification() {
    try {
      const result = await apiFetch<{ sent: number; failed: number }>("/notifications/test", {
        method: "POST",
        body: JSON.stringify({ title: "华康医保", body: "这是一条测试通知 / Esta é uma notificação de teste", url: "/" })
      });
      setMessage(`测试通知已发送 ${result.sent} 条，失败 ${result.failed} 条 / Teste enviado`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "测试通知发送失败 / Falha ao testar");
    }
  }

  return (
    <section className="panel notification-settings">
      <div>
        <span className="muted">手机通知 / Notificações</span>
        <strong>{permission === "granted" ? "已开启 / Ativadas" : "未开启 / Desativadas"}</strong>
        <span className="muted">{message || "用于任务提醒和系统通知 / Para lembretes e avisos"}</span>
      </div>
      <button className="button secondary" type="button" onClick={enableNotifications}>
        <Bell size={16} />
        开启通知 / Ativar
      </button>
      <button className="button secondary" type="button" onClick={sendTestNotification}>
        测试通知 / Testar
      </button>
    </section>
  );
}
