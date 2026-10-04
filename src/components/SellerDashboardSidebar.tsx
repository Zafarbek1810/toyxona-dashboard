import { useLocation } from "react-router-dom";
import { useAppNavigate } from "../hooks/useAppNavigate";
import { useAppContext } from "../context/AppContext";
import { mediaUrl } from "../lib/api/client";
import { getSellerActiveSection, paths, sellerSectionPaths } from "../routes/paths";
import logoImg from "../assets/logo1.png";
import ringsImg from "../assets/rings.png";

interface Props {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const navItems = [
  { id: "overview", label: "Boshqaruv", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", badge: null },
  { id: "products", label: "Mahsulotlar", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", badge: null },
  // { id: "add-product", label: "Mahsulot qo'shish", icon: "M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z", badge: null },
  { id: "orders", label: "Buyurtmalar", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", badge: null },
  { id: "analytics", label: "Analitika", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", badge: null },
  { id: "payments", label: "To'lovlar", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", badge: null },
  { id: "subscription", label: "Obuna", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", badge: null },
  { id: "reviews", label: "Sharhlar", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", badge: null },
  { id: "settings", label: "Sozlamalar", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", badge: null },
];

const STATUS_LABEL: Record<string, { label: string; dot: string }> = {
  active: { label: "Faol", dot: "bg-green-500" },
  pending: { label: "Kutilmoqda", dot: "bg-amber-500" },
  blocked: { label: "Bloklangan", dot: "bg-red-500" },
  suspended: { label: "To'xtatilgan", dot: "bg-red-500" },
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "D";
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

function StoreMark({ name, logo, size = "md" }: { name: string; logo?: string | null; size?: "sm" | "md" }) {
  const src = mediaUrl(logo);
  const box = size === "sm" ? "w-7 h-7 text-[10px] rounded-full" : "w-9 h-9 text-xs rounded-lg";
  if (src) {
    return <img src={src} alt="" className={`${box} object-cover shrink-0 bg-white`} />;
  }
  return (
    <div className={`${box} bg-[#00A86B] text-white font-bold flex items-center justify-center shrink-0`}>
      {initials(name)}
    </div>
  );
}

export default function SellerDashboardSidebar({ collapsed, setCollapsed }: Props) {
  const navigate = useAppNavigate();
  const { pathname } = useLocation();
  const { user } = useAppContext();
  const activeSection = getSellerActiveSection(pathname);
  const seller = user?.seller;
  const storeName = seller?.name || "Do'kon";
  const plan = (seller?.subscription || seller?.planId || "").toUpperCase();
  const status = STATUS_LABEL[seller?.status || ""] || STATUS_LABEL.pending;
  const personName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || storeName;
  const contact = formatContact(seller?.phone || user?.phone, seller?.email || user?.email);
  return (
    <aside
      className="shrink-0 bg-white border-r h-screen sticky top-0 flex flex-col transition-all duration-300"
      style={{ borderColor: "var(--border)", width: collapsed ? 64 : 232 }}
    >
      {/* Logo row */}
      <div className="flex items-center justify-between px-3 py-4 border-b" style={{ borderColor: "var(--border)", minHeight: 60 }}>
        <button
          type="button"
          onClick={() => navigate(paths.home)}
          aria-label="Tuyhona"
          className={`shrink-0 inline-flex items-center bg-transparent border-0 p-0 cursor-pointer ${collapsed ? "mx-auto" : ""}`}
        >
          <img
            src={collapsed ? ringsImg : logoImg}
            alt="Tuyhona"
            className={collapsed ? "h-8 w-8 object-contain" : "h-8 w-auto max-w-[140px] object-contain"}
          />
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors shrink-0 ${collapsed ? "mx-auto mt-0" : ""}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Store info */}
      {!collapsed && (
        <div className="mx-3 my-3 p-3 rounded-xl bg-gradient-to-br from-[#E8F8F1] to-[#dde8f7] border border-[#d0dff4]">
          <div className="flex items-center gap-2.5">
            <StoreMark name={storeName} logo={seller?.logo} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#00A86B] truncate">{storeName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`}></span>
                <span className="text-[10px] text-gray-500">{status.label}</span>
                {plan && (
                  <span className="text-[10px] text-amber-600 font-semibold ml-1 bg-amber-50 px-1.5 py-0.5 rounded-full">
                    {plan}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="mx-auto my-3" title={storeName}>
          <StoreMark name={storeName} logo={seller?.logo} />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-1 px-2 space-y-0.5">
        {navItems.map(item => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(sellerSectionPaths[item.id])}
              title={collapsed ? item.label : undefined}
              className={`relative flex items-center gap-3 w-full rounded-xl transition-all duration-150 group
                ${collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5"}
                ${active
                  ? "bg-[#00A86B] text-white shadow-md shadow-[#00A86B]/20"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <svg className={`shrink-0 transition-none ${collapsed ? "w-5 h-5" : "w-4 h-4"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d={item.icon} />
              </svg>

              {!collapsed && (
                <span className={`text-sm flex-1 text-left ${active ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              )}

              {item.badge && !collapsed && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${active ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}>
                  {item.badge}
                </span>
              )}

              {item.badge && collapsed && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}

              {/* Tooltip on collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                  {item.label}
                  <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t px-2 py-3 space-y-0.5" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => navigate(paths.home)}
          title={collapsed ? "Saytga o'tish" : undefined}
          className={`flex items-center gap-3 w-full rounded-xl px-3 py-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors group relative ${collapsed ? "justify-center px-0" : ""}`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {!collapsed && <span className="text-sm font-medium">Saytga o'tish</span>}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Saytga o'tish
            </div>
          )}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 mt-1">
            <StoreMark name={personName} logo={seller?.logo} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate">{personName}</p>
              {contact && <p className="text-[10px] text-gray-400 truncate">{contact}</p>}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
