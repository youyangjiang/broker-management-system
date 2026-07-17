"use client";

import { useEffect, useState } from "react";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");
  useEffect(() => {
    window.localStorage.removeItem("access_token");
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      if (!response.ok) { setError("登录失败，请检查邮箱、密码和后端服务。 / Falha no login. Verifique e-mail, senha e servidor."); return; }
      const data = await response.json();
      window.localStorage.setItem("access_token", data.access_token);
      window.location.href = "/clients";
    } catch (err) { setError("无法连接后端服务。 / Não foi possível conectar ao servidor."); }
  }
  return (
    <main className="login-page">
      <section className="panel login-box">
        <h1 className="title">系统登录 / Acesso ao sistema</h1>
        <p className="muted">默认测试账号已填好。 / A conta de teste padrão já está preenchida.</p>
        <form className="form" onSubmit={submit}>
          <div className="field"><label htmlFor="email">邮箱 / E-mail</label><input id="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          <div className="field"><label htmlFor="password">密码 / Senha</label><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></div>
          {error ? <div className="error">{error}</div> : null}
          <button className="button" type="submit">登录 / Entrar</button>
        </form>
      </section>
    </main>
  );
}
