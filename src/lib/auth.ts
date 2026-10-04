import { authApi } from "./api";
import { getToken, setToken } from "./api/client";
import type { AuthRole, AuthUser } from "./api/types";
import { paths } from "../routes/paths";

export type { AuthRole, AuthUser };

const SESSION_KEY = "toyxona_auth_session";

/** Keep only digits; strip leading 998 country code when present. */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("998") && digits.length >= 12) {
    return digits.slice(3);
  }
  return digits;
}

function writeSession(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function getSessionUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function loginByPhone(phone: string, password: string): Promise<AuthUser> {
  const data = await authApi.login({ phone: normalizePhone(phone), password });
  setToken(data.token);
  writeSession(data.user);
  return data.user;
}

export async function registerAuthUser(input: {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AuthRole;
  storeName?: string;
  businessType?: string;
  city?: string;
  description?: string;
  email?: string;
}): Promise<AuthUser> {
  const businessMap: Record<string, string> = {
    "Jismoniy shaxs": "individual",
    YaTT: "yatt",
    MChJ: "mchj",
    AJ: "aj",
  };

  const data = await authApi.register({
    phone: normalizePhone(input.phone),
    password: input.password,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role === "admin" ? "customer" : input.role,
    storeName: input.storeName,
    businessType: input.businessType ? businessMap[input.businessType] || "individual" : undefined,
    city: input.city,
    description: input.description,
    email: input.email || undefined,
  });
  setToken(data.token);
  writeSession(data.user);
  return data.user;
}

export async function refreshSession(): Promise<AuthUser | null> {
  if (!getToken()) {
    writeSession(null);
    return null;
  }
  try {
    const user = await authApi.me();
    writeSession(user);
    return user;
  } catch {
    setToken(null);
    writeSession(null);
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    if (getToken()) await authApi.logout();
  } catch {
    /* ignore */
  }
  setToken(null);
  writeSession(null);
}

export function redirectPathForRole(role: AuthRole): string {
  if (role === "seller") return paths.seller.dashboard;
  if (role === "admin") return paths.admin.dashboard;
  return "/";
}

export function isLoggedIn(): boolean {
  return Boolean(getToken());
}
