"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { apiFetch } from "../lib/api";

const links = [
  ["首页 / Início", "/"],
  ["客户 / Clientes", "/clients"],
  ["商机 / Oportunidades", "/opportunities"],
  ["保单 / Apólices", "/policies"],
  ["任务 / Tarefas", "/tasks"],
  ["活动 / Atividades", "/activities"],
  ["伙伴 / Parceiros", "/partners"],
  ["用户 / Usuários", "/users"],
  ["审计 / Auditoria", "/audit"]
];

export function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [me, setMe] = useState<Record<string, string> | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    apiFetch<Record<string, string>>("/me").then(setMe).catch(() => setMe(null));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function logout() {
    window.localStorage.removeItem("access_token");
    window.location.href = "/login";
  }

  return (
    <div className="shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="mobile-shell-bar">
          <div className="brand compact"><BrandLogo compact /></div>
          <button className="icon-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? "关闭菜单 / Fechar menu" : "打开菜单 / Abrir menu"}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <div className="brand desktop-brand"><BrandLogo /></div>
        <nav className="nav">
          {links.map(([label, href]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return <Link key={href} className={active ? "active" : ""} href={href}>{label}</Link>;
          })}
        </nav>
        <div className="menu-user">
          {me ? (
            <>
              <div>
                <strong>{me.full_name}</strong>
                <span>{me.email}</span>
              </div>
              <button className="menu-logout" type="button" onClick={logout}>退出 / Sair</button>
            </>
          ) : (
            <Link className="menu-logout" href="/login">登录 / Entrar</Link>
          )}
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <h1 className="title">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
