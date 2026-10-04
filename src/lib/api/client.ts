const TOKEN_KEY = "toyxona_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Prefer Vite proxy `/api` in dev; override with VITE_API_URL if set. */
export function apiBase(): string {
  const env = import.meta.env.VITE_API_URL as string | undefined;
  if (env) return env.replace(/\/$/, "");
  return "/api";
}

export class ApiClientError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  formData?: FormData;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
};

function buildQuery(query?: RequestOptions["query"]) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, formData, auth = true, query } = options;
  const headers: Record<string, string> = {};

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let payload: BodyInit | undefined;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${apiBase()}${path}${buildQuery(query)}`, {
    method,
    headers,
    body: payload,
  });

  const text = await res.text();
  let json: { success?: boolean; data?: T; meta?: unknown; message?: string; details?: unknown } = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    if (!res.ok) throw new ApiClientError(res.status, text || "Server xatosi");
  }

  if (!res.ok) {
    throw new ApiClientError(res.status, json.message || "So'rov muvaffaqiyatsiz", json.details);
  }

  return (json.data !== undefined ? json.data : json) as T;
}

export async function apiRequestWithMeta<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; meta?: { total: number; page: number; limit: number; pages: number } }> {
  const { method = "GET", body, formData, auth = true, query } = options;
  const headers: Record<string, string> = {};
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  let payload: BodyInit | undefined;
  if (formData) payload = formData;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${apiBase()}${path}${buildQuery(query)}`, {
    method,
    headers,
    body: payload,
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiClientError(res.status, json.message || "So'rov muvaffaqiyatsiz", json.details);
  }
  return { data: json.data as T, meta: json.meta };
}

export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) return path;
  const base = apiBase().replace(/\/api$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
