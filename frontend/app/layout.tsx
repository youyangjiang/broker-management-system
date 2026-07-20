import "./globals.css";
import { PWARegistration } from "./components/PWARegistration";

export const metadata = {
  title: "华康医保 / HUAKAN SAÚDE",
  description: "华康医保业务管理系统",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "华康医保",
    statusBarStyle: "black-translucent"
  }
};

export const viewport = {
  themeColor: "#58c5bd"
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
