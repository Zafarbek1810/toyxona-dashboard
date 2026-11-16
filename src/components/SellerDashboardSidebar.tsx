import { useLocation } from "react-router-dom";
import { useAppNavigate } from "../hooks/useAppNavigate";
import { useAppContext } from "../context/AppContext";
import { mediaUrl } from "../lib/api/client";
import { getOwnerActiveSection, getSpecialistActiveSection, ownerSectionPaths, paths, specialistSectionPaths } from "../routes/paths";
import logoImg from "../assets/logo1.png";
import ringsImg from "../assets/rings.png";

interface Props {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mode?: "owner" | "specialist";
}

const ownerNav = [
  { id: "overview", label: "Boshqaruv", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "venues", label: "To'yxonam", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { id: "bookings", label: "Bronlar", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { id: "reviews", label: "Sharhlar", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { id: "settings", label: "Sozlamalar", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
];

const specialistNav = [
  ownerNav[0],
  { id: "profile", label: "Profil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  ownerNav[3],
  ownerNav[4],
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

export default function SellerDashboardSidebar({ collapsed, setCollapsed, mode = "owner" }: Props) {
  const navigate = useAppNavigate();
  const { pathname } = useLocation();
  const { user } = useAppContext();
  const navItems = mode === "specialist" ? specialistNav : ownerNav;
  const sectionPaths = mode === "specialist" ? specialistSectionPaths : ownerSectionPaths;
  const activeSection = mode === "specialist" ? getSpecialistActiveSection(pathname) : getOwnerActiveSection(pathname);
  const profileName = mode === "specialist" ? user?.specialist?.name : user?.owner?.name;
  const storeName = profileName || (mode === "specialist" ? "Mutaxassis" : "To'yxona");
  const statusKey = mode === "specialist" ? user?.specialist?.status : user?.owner?.status;
  const status = STATUS_LABEL[statusKey || ""] || STATUS_LABEL.pending;
  const personName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || storeName;
  const contact = formatContact(user?.owner?.phone || user?.specialist?.phone || user?.phone, user?.owner?.email || user?.email);
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
            <StoreMark name={storeName} />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#00A86B] truncate">{storeName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`}></span>
                <span className="text-[10px] text-gray-500">{status.label}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="mx-auto my-3" title={storeName}>
          <StoreMark name={storeName} />
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-1 px-2 space-y-0.5">
        {navItems.map(item => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(sectionPaths[item.id])}
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
            <StoreMark name={personName} size="sm" />
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
