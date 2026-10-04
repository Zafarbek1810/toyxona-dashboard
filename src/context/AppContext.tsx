import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { cartApi, favoritesApi } from "../lib/api";
import { getToken } from "../lib/api/client";
import {
  getSessionUser,
  logout as authLogout,
  refreshSession,
  type AuthUser,
} from "../lib/auth";

interface Toast {
  message: string;
  type: "success" | "info" | "error";
}

interface AppContextValue {
  user: AuthUser | null;
  authReady: boolean;
  cartIds: number[];
  favIds: number[];
  toast: Toast | null;
  setUser: (user: AuthUser | null) => void;
  refreshUser: () => Promise<void>;
  logout: (options?: { silent?: boolean }) => Promise<void>;
  handleFav: (id: number) => void;
  handleCart: (id: number) => void;
  handleRemoveCart: (id: number) => void;
  refreshCartFav: () => Promise<void>;
  showToast: (message: string, type?: Toast["type"]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const LOCAL_CART = "toyxona_cart_ids";
const LOCAL_FAV = "toyxona_fav_ids";

function readLocalIds(key: string): number[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as number[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalIds(key: string, ids: number[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getSessionUser());
  const [authReady, setAuthReady] = useState(false);
  const [cartIds, setCartIds] = useState<number[]>(() => readLocalIds(LOCAL_CART));
  const [favIds, setFavIds] = useState<number[]>(() => readLocalIds(LOCAL_FAV));
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshCartFav = useCallback(async () => {
    if (!getToken()) {
      setCartIds(readLocalIds(LOCAL_CART));
      setFavIds(readLocalIds(LOCAL_FAV));
      return;
    }
    try {
      const [cart, favs] = await Promise.all([cartApi.get(), favoritesApi.list()]);
      setCartIds(cart.items.map((i) => i.productId));
      setFavIds(favs.map((f) => f.productId));
    } catch {
      /* keep previous */
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const next = await refreshSession();
    setUser(next);
    if (next) await refreshCartFav();
  }, [refreshCartFav]);

  useEffect(() => {
    (async () => {
      try {
        if (getToken()) {
          const next = await refreshSession();
          setUser(next);
          if (next) await refreshCartFav();
        }
      } finally {
        setAuthReady(true);
      }
    })();
  }, [refreshCartFav]);

  const logout = useCallback(async (options?: { silent?: boolean }) => {
    await authLogout();
    setUser(null);
    setCartIds(readLocalIds(LOCAL_CART));
    setFavIds(readLocalIds(LOCAL_FAV));
    if (!options?.silent) showToast("Hisobdan chiqildi", "info");
  }, [showToast]);

  const handleFav = useCallback(
    async (id: number) => {
      if (!getToken()) {
        setFavIds((prev) => {
          const removing = prev.includes(id);
          const next = removing ? prev.filter((i) => i !== id) : [...prev, id];
          writeLocalIds(LOCAL_FAV, next);
          showToast(removing ? "Sevimlilardan olib tashlandi" : "Sevimlilarga qo'shildi");
          return next;
        });
        return;
      }
      try {
        const res = await favoritesApi.toggle(id);
        setFavIds((prev) =>
          res.favorited ? (prev.includes(id) ? prev : [...prev, id]) : prev.filter((i) => i !== id),
        );
        showToast(res.favorited ? "Sevimlilarga qo'shildi" : "Sevimlilardan olib tashlandi");
      } catch {
        showToast("Sevimlilarni yangilab bo'lmadi", "error");
      }
    },
    [showToast],
  );

  const handleCart = useCallback(
    async (id: number) => {
      if (!getToken()) {
        setCartIds((prev) => {
          if (prev.includes(id)) return prev;
          const next = [...prev, id];
          writeLocalIds(LOCAL_CART, next);
          showToast("Savatga qo'shildi ✓");
          return next;
        });
        return;
      }
      try {
        if (cartIds.includes(id)) return;
        await cartApi.add(id, 1);
        setCartIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        showToast("Savatga qo'shildi ✓");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Savatga qo'shib bo'lmadi", "error");
      }
    },
    [cartIds, showToast],
  );

  const handleRemoveCart = useCallback(
    async (id: number) => {
      if (!getToken()) {
        setCartIds((prev) => {
          const next = prev.filter((i) => i !== id);
          writeLocalIds(LOCAL_CART, next);
          return next;
        });
        showToast("Savatdan olib tashlandi", "info");
        return;
      }
      try {
        await cartApi.remove(id);
        setCartIds((prev) => prev.filter((i) => i !== id));
        showToast("Savatdan olib tashlandi", "info");
      } catch {
        showToast("Savatni yangilab bo'lmadi", "error");
      }
    },
    [showToast],
  );

  return (
    <AppContext.Provider
      value={{
        user,
        authReady,
        cartIds,
        favIds,
        toast,
        setUser,
        refreshUser,
        logout,
        handleFav,
        handleCart,
        handleRemoveCart,
        refreshCartFav,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
            toast.type === "success"
              ? "bg-[#00A86B] text-white"
              : toast.type === "error"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-white"
          }`}
        >
          <span>{toast.type === "success" ? "✓" : toast.type === "error" ? "!" : "ℹ"}</span>
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
