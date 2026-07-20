import "./globals.css";
import { PWARegistration } from "./components/PWARegistration";

export const metadata = {
  title: "华康医护 / HUAKAN SAÚDE",
  description: "华康医护业务管理系统",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/icons/icon-192.png"
  },
  appleWebApp: {
    capable: true,
    title: "华康医护",
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
