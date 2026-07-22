"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandLogo } from "./BrandLogo";
import { useLanguage, type AppLanguage } from "./LanguageProvider";
import { apiFetch } from "../lib/api";
import { APP_VERSION } from "../lib/appVersion";

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
  const { language, setLanguage, t } = useLanguage();
  const [me, setMe] = useState<Record<string, string> | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageSaving, setLanguageSaving] = useState(false);

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

  async function changeLanguage(value: AppLanguage) {
    setLanguageSaving(true);
    try {
      await setLanguage(value);
      setMe((current) => current ? { ...current, language: value } : current);
    } finally {
      setLanguageSaving(false);
    }
  }

  return (
    <div className="shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="mobile-shell-bar">
          <div className="brand compact"><BrandLogo compact /></div>
          <button className="icon-button" type="button" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? t("关闭菜单 / Fechar menu") : t("打开菜单 / Abrir menu")}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <div className="brand desktop-brand"><BrandLogo /></div>
        <nav className="nav">
          {links.map(([label, href]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return <Link key={href} className={active ? "active" : ""} href={href}>{t(label)}</Link>;
          })}
        </nav>
        <div className="menu-user">
          {me ? (
            <>
              <div>
                <strong>{me.full_name}</strong>
                <span>{me.email}</span>
              </div>
              <label className="language-setting">
                <span>{t("系统语言 / Idioma do sistema")}</span>
                <select value={language} disabled={languageSaving} onChange={(event) => changeLanguage(event.target.value as AppLanguage)}>
                  <option value="zh-CN">中文</option>
                  <option value="pt-BR">Português</option>
                </select>
              </label>
              <button className="menu-logout" type="button" onClick={logout}>{t("退出 / Sair")}</button>
            </>
          ) : (
            <Link className="menu-logout" href="/login">{t("登录 / Entrar")}</Link>
          )}
        </div>
        <div className="app-version">v{APP_VERSION}</div>
      </aside>
      <main className="main">
        <div className="topbar">
          <h1 className="title">{t(title)}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
