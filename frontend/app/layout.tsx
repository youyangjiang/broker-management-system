import "./globals.css";
import { PWARegistration } from "./components/PWARegistration";

export const metadata = {
  title: "保险经纪业务管理系统 / Sistema de Corretagem de Seguros",
  description: "Brazil insurance broker management system",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "保险经纪系统",
    statusBarStyle: "black-translucent"
  }
};

export const viewport = {
  themeColor: "#0f766e"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}
