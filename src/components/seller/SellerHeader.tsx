import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { mediaUrl } from "../../lib/api/client";
import { paths } from "../../routes/paths";
import { storeUrl } from "../../lib/site";

const STATUS_LABEL: Record<string, { label: string; box: string; dot: string }> = {
  active: { label: "Do'kon faol", box: "bg-green-50 border-green-200 text-green-700", dot: "bg-green-500" },
  pending: { label: "Tasdiq kutilmoqda", box: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-500" },
  blocked: { label: "Do'kon bloklangan", box: "bg-red-50 border-red-200 text-red-700", dot: "bg-red-500" },
  suspended: { label: "Do'kon to'xtatilgan", box: "bg-red-50 border-red-200 text-red-700", dot: "bg-red-500" },
};

function personInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "S";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
}

function formatContact(phone?: string | null, email?: string | null) {
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 9) return `+998 ${digits}`;
    if (digits.startsWith("998") && digits.length === 12) return `+${digits}`;
    return phone;
  }
  return email || "";
}

export default function SellerHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const seller = user?.seller;
  const personName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Sotuvchi";
  const contact = formatContact(user?.phone || seller?.phone, user?.email || seller?.email);
  const subtitle = contact || seller?.name || "Sotuvchi";
  const avatar = mediaUrl(seller?.logo);
  const plan = (seller?.subscription || seller?.planId || "").toUpperCase();
  const status = STATUS_LABEL[seller?.status || ""] || STATUS_LABEL.pending;

  return (
    <header className="bg-white border-b shrink-0 px-6 flex items-center gap-4" style={{ borderColor: "var(--border)", height: 60 }}>
      <div className="flex-1">
        <div className="relative w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            placeholder="Mahsulot, buyurtma qidirish..."
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#00A86B] focus:ring-1 focus:ring-[#00A86B]/20"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {plan && (
          <div className="hidden md:flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-bold text-amber-700">{plan}</span>
            {seller?.daysLeft != null && (
              <span className="text-xs text-amber-500">· {seller.daysLeft} kun</span>
            )}
          </div>
        )}

        <div className={`hidden md:flex items-center gap-1.5 border px-3 py-1.5 rounded-lg ${status.box}`}>
          <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
          <span className="text-xs font-semibold">{status.label}</span>
        </div>

        <button className="relative w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="relative pl-2 border-l" style={{ borderColor: "var(--border)" }} ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 rounded-xl px-1.5 py-1 hover:bg-gray-50 transition-colors"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            {avatar ? (
              <img
                src={avatar}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm bg-gray-100"
                alt=""
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#00A86B] text-white text-xs font-bold flex items-center justify-center ring-2 ring-white shadow-sm shrink-0">
                {personInitials(personName)}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{personName}</p>
              <p className="text-[10px] text-gray-400">{subtitle}</p>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border shadow-lg py-1.5 z-50"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="px-3.5 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
                <p className="text-xs font-semibold text-gray-800 truncate">{personName}</p>
                <p className="text-[10px] text-gray-400 truncate">{subtitle}</p>
                {seller?.name && seller.name !== personName && (
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{seller.name}</p>
                )}
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => go(paths.seller.settings)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Sozlamalar
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => go(paths.seller.subscription)}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Obuna
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  const storePath = user?.seller?.slug ? paths.store(user.seller.slug) : paths.home;
                  window.location.assign(storeUrl(storePath));
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Do'konni ko'rish
              </button>

              <div className="my-1 border-t" style={{ borderColor: "var(--border)" }} />

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  void logout().then(() => navigate("/"));
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Chiqish
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
