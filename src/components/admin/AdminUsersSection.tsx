import { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import { adminApi } from "../../lib/api";
import type { AuthUser } from "../../lib/api/types";
import { formatDateShort, formatPrice } from "../../lib/format";

type AdminUser = AuthUser & {
  ordersCount?: number;
  totalSpent?: number;
};

type StatusFilter = "all" | "active" | "blocked";

export default function AdminUsersSection() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [viewUser, setViewUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = (await adminApi.users({ limit: "100", role: "customer" })) as AdminUser[];
      setUsers(list.filter((u) => u.role === "customer" && !u.seller));
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const displayName = (u: AdminUser) =>
    u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.phone;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter(u => {
      if (statusFilter === "active" && u.active === false) return false;
      if (statusFilter === "blocked" && u.active !== false) return false;
      if (!q) return true;
      const hay = `${displayName(u)} ${u.email || ""} ${u.phone}`.toLowerCase();
      return hay.includes(q);
    });
  }, [users, search, statusFilter]);

  const activeCount = users.filter(u => u.active !== false).length;
  const blockedCount = users.filter(u => u.active === false).length;

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;
    await adminApi.deleteUser(deleteUser.id);
    setDeleteUser(null);
    if (viewUser?.id === deleteUser.id) setViewUser(null);
    await load();
  };

  const handleToggleBlock = async (u: AdminUser) => {
    await adminApi.updateUser(u.id, { active: u.active === false });
    await load();
  };

  return (
    <>
      <div className="max-w-[1400px] space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>Xaridorlar</h1>
            <p className="text-sm text-gray-400 mt-0.5">{users.length} ta {"ro'yxatdan o'tgan"}</p>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-white border rounded-xl px-3 py-2 text-sm shadow-sm focus:outline-none"
              style={{ borderColor: "#E2E6F0" }}
            >
              <option value="all">Barchasi</option>
              <option value="active">Faol</option>
              <option value="blocked">Bloklangan</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Jami xaridorlar", value: String(users.length), icon: "👥", color: "#3B82F6" },
            { label: "Faol", value: String(activeCount), icon: "🟢", color: "#059669" },
            { label: "Bloklangan", value: String(blockedCount), icon: "🚫", color: "#EF4444" },
            { label: "Ko'rsatilmoqda", value: String(filtered.length), icon: "✨", color: "#10B981" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-xl font-black font-mono text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#E2E6F0" }}>
          <div className="px-5 py-3.5 border-b bg-gray-50/60 flex gap-3" style={{ borderColor: "#E2E6F0" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Ism, email yoki telefon..."
              className="border rounded-xl px-3 py-2 text-sm focus:outline-none w-64"
              style={{ borderColor: "#E2E6F0" }}
            />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b" style={{ borderColor: "#E2E6F0" }}>
                {["Foydalanuvchi", "Email", "Telefon", "Buyurtmalar", "Umumiy xarid", "Ro'yxatdan", "Holat", ""].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">
                    Xaridorlar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map(u => {
                  const name = displayName(u);
                  const active = u.active !== false;
                  return (
                    <tr key={u.id} className="border-b hover:bg-blue-50/20 transition-colors" style={{ borderColor: "#E2E6F0" }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A86B] to-[#2D6A4F] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {name[0] || "?"}
                          </div>
                          <span className="font-semibold text-xs text-gray-900">{name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">{u.email || "—"}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 font-mono">{u.phone}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-xs text-gray-800">{u.ordersCount ?? 0}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-700">{formatPrice(u.totalSpent ?? 0)}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">{formatDateShort(u.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => void handleToggleBlock(u)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
                        >
                          {active ? "Faol" : "Bloklangan"}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => setViewUser(u)}
                            aria-label={`${name} ni ko'rish`}
                            className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteUser(u)}
                            aria-label={`${name} ni o'chirish`}
                            className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="px-5 py-4 border-t flex items-center justify-between" style={{ borderColor: "#E2E6F0" }}>
            <span className="text-xs text-gray-400">
              {filtered.length === 0 ? "0" : `1–${filtered.length}`} / {filtered.length} ta
            </span>
          </div>
        </div>
      </div>

      <Modal
        open={!!viewUser}
        onClose={() => setViewUser(null)}
        title="Xaridor ma'lumotlari"
        description={viewUser ? `#${viewUser.id}` : undefined}
        maxWidth="max-w-lg"
        footer={
          <button
            type="button"
            onClick={() => setViewUser(null)}
            className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold text-sm hover:bg-gray-50"
            style={{ borderColor: "#E2E6F0" }}
          >
            Yopish
          </button>
        }
      >
        {viewUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00A86B] to-[#2D6A4F] flex items-center justify-center text-white text-xl font-bold shrink-0">
                {displayName(viewUser)[0] || "?"}
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">{displayName(viewUser)}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{viewUser.email || "—"}</p>
                <span
                  className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    viewUser.active !== false ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                  }`}
                >
                  {viewUser.active !== false ? "Faol" : "Bloklangan"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Email", value: viewUser.email || "—" },
                { label: "Telefon", value: viewUser.phone },
                { label: "Buyurtmalar", value: String(viewUser.ordersCount ?? 0) },
                { label: "Umumiy xarid", value: formatPrice(viewUser.totalSpent ?? 0) },
                { label: "Ro'yxatdan", value: formatDateShort(viewUser.createdAt) },
                { label: "Holat", value: viewUser.active !== false ? "Faol" : "Bloklangan" },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-gray-50 px-3.5 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1 break-all">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        title="Xaridorni o'chirish"
        description="Bu amalni bekor qilib bo'lmaydi"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteUser(null)}
              className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold text-sm hover:bg-gray-50"
              style={{ borderColor: "#E2E6F0" }}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmDelete()}
              className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shadow-sm"
            >
              {"O'chirish"}
            </button>
          </>
        }
      >
        {deleteUser && (
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00A86B] to-[#2D6A4F] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {displayName(deleteUser)[0] || "?"}
            </div>
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{displayName(deleteUser)}</span> xaridorini
                {" ro'yxatdan o'chirmoqchimisiz?"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {deleteUser.email || deleteUser.phone} · {deleteUser.ordersCount ?? 0} ta buyurtma
              </p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
