import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useAppNavigate() {
  const navigate = useNavigate();

  return useCallback((to: string) => {
    navigate(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);
}
