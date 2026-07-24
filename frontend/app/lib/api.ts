const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://broker-management-system-production.up.railway.app/api/v1";

export type PageResult = { items: Record<string, string>[]; total: number; page: number; page_size: number; };

export function getToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("access_token") || "";
}

function formatValidationDetail(item: { loc?: unknown[]; msg?: string }) {
  const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : "";
  const fieldLabel =
    field === "phone" ? "电话 / Telefone" :
    field === "whatsapp" ? "WhatsApp" :
    field === "email" ? "邮箱 / E-mail" :
    String(field || "字段 / Campo");
  const message = String(item.msg || "");

  if (message.includes("Telefone inválido")) return `${fieldLabel}无效 / inválido`;
  if (message.includes("CEP inválido")) return `${fieldLabel}无效 / inválido`;
  if (message.includes("CPF inválido")) return `${fieldLabel}无效 / inválido`;
  if (message.includes("CNPJ inválido")) return `${fieldLabel}无效 / inválido`;
  return `${fieldLabel}: ${message || "无效 / inválido"}`;
}

function formatApiError(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.detail)) {
      return parsed.detail.map(formatValidationDetail).join("\n");
    }
    if (typeof parsed.detail === "string") return parsed.detail;
  } catch {
    // Keep the original response text when it is not JSON.
  }
  return raw || "请求失败 / Falha na solicitação";
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("access_token");
      if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
    }
    throw new Error("登录已过期，请重新登录 / Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) throw new Error(formatApiError(await response.text()));
  return response.json();
}
