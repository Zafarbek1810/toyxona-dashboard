import { useLocation } from "react-router-dom";
import { useAppNavigate } from "../hooks/useAppNavigate";
import { adminSectionPaths, getAdminActiveSection, paths } from "../routes/paths";
import ringsImg from "../assets/rings.png";

interface Props {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const navGroups = [
  {
    label: "Asosiy",
    items: [
      { id: "overview", label: "Boshqaruv", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", badge: null },
    ],
  },
  {
    label: "Foydalanuvchilar",
    items: [
      { id: "sellers", label: "Sotuvchilar", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", badge: "" },
      { id: "users", label: "Xaridorlar", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", badge: null },
    ],
  },
  {
    label: "Kontent",
    items: [
      { id: "products", label: "Mahsulotlar", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", badge: null },
      { id: "categories", label: "Kategoriyalar", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", badge: null },
      { id: "orders", label: "Buyurtmalar", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", badge: null },
    ],
  },
  {
    label: "Moliya",
    items: [
      { id: "subscriptions", label: "Obunalar", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z", badge: null },
      { id: "payments", label: "To'lovlar", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", badge: null },
      { id: "analytics", label: "Analitika", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", badge: null },
    ],
  },
  {
    label: "Boshqaruv",
    items: [
      { id: "promotions", label: "Reklamalar", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z", badge: null },
      { id: "settings", label: "Sozlamalar", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", badge: null },
    ],
  },
];

export default function AdminSidebar({ collapsed, setCollapsed }: Props) {
  const navigate = useAppNavigate();
  const { pathname } = useLocation();
  const activeSection = getAdminActiveSection(pathname);
  const allItems = navGroups.flatMap(g => g.items);

  return (
    <aside
      className="shrink-0 h-screen sticky top-0 flex flex-col transition-all duration-300 overflow-hidden"
      style={{
        width: collapsed ? 64 : 228,
        background: "linear-gradient(180deg, #0F172A 0%, #0F172A 100%)",
      }}
    >
      {/* Logo */}
      <div
        className={`flex items-center border-b border-white/10 ${collapsed ? "flex-col justify-center gap-1 px-2 py-3" : "justify-between px-3 py-4"}`}
        style={{ minHeight: 60 }}
      >
        <button
          type="button"
          onClick={() => navigate(paths.home)}
          aria-label="To'yxona"
          className="shrink-0 inline-flex items-center gap-2 min-w-0 bg-transparent border-0 p-0 cursor-pointer"
        >
          <img
            src={ringsImg}
            alt=""
            className="h-8 w-8 object-contain shrink-0"
          />
          {!collapsed && (
            <span className="text-sm font-bold text-white whitespace-nowrap">To'yxona</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Menyuni ochish" : "Menyuni yopish"}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>
      </div>
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {collapsed ? (
          <div className="space-y-0.5">
            {allItems.map(item => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(adminSectionPaths[item.id])}
                  title={item.label}
                  className={`relative flex items-center justify-center w-full py-2.5 rounded-xl transition-all group ${
                    active ? "bg-[#F59E0B] text-white" : "text-white/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d={item.icon} />
                  </svg>
                  {item.badge && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                    {item.label}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          navGroups.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(adminSectionPaths[item.id])}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all ${
                        active
                          ? "bg-[#F59E0B] text-white shadow-lg shadow-[#D97706]/25"
                          : "text-white/50 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d={item.icon} />
                      </svg>
                      <span className={`flex-1 text-left ${active ? "font-semibold" : "font-medium"}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-red-500/80 text-white"}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-2 py-3">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D97706] to-[#B45309] flex items-center justify-center text-white font-bold text-sm shrink-0">
              A
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">Super Admin</p>
              <p className="text-[10px] text-white/40 truncate">admin@toyxona.uz</p>
            </div>
            <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D97706] to-[#B45309] flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
