import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import type { AuthRole } from "../lib/api/types";
import { paths } from "./paths";

function homeForRole(role: AuthRole): string {
  if (role === "admin") return paths.admin.dashboard;
  if (role === "seller") return paths.seller.dashboard;
  return "/";
}

export function RequireRole({ role, children }: { role: "seller" | "admin"; children: ReactNode }) {
  const { user, authReady } = useAppContext();
  if (!authReady) return null;
  if (!user || (user.role !== "seller" && user.role !== "admin")) {
    return <Navigate to="/" replace />;
  }
  if (user.role !== role) return <Navigate to={homeForRole(user.role)} replace />;
  return children;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, authReady } = useAppContext();
  if (!authReady) return null;
  if (user?.role === "seller" || user?.role === "admin") {
    return <Navigate to={homeForRole(user.role)} replace />;
  }
  return children;
}
