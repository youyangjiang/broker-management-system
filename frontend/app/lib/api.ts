const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://broker-management-system-production.up.railway.app/api/v1";

export type PageResult = { items: Record<string, string>[]; total: number; page: number; page_size: number; };
export function getToken() { if (typeof window === "undefined") return ""; return window.localStorage.getItem("access_token") || ""; }
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("access_token");
      if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
    }
    throw new Error("登录已过期，请重新登录。 / Sessão expirada. Faça login novamente.");
  }
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
