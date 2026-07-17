import "./globals.css";

export const metadata = {
  title: "保险经纪业务管理系统 / Sistema de Corretagem de Seguros",
  description: "Brazil insurance broker management system"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
