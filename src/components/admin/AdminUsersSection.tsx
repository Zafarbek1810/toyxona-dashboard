import TableActionButton from "../TableActionButton";
import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../lib/api";
import type { AuthUser } from "../../lib/api/types";
import { formatDateShort } from "../../lib/format";

const ROLE_LABEL: Record<string, string> = {
  customer: "Mijoz",
  seller: "To'yxona egasi",
  specialist: "Mutaxassis",
  admin: "Admin",
};

export default function AdminUsersSection() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      setUsers(await adminApi.users({ limit: "100" }));
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) => `${user.firstName} ${user.lastName} ${user.phone} ${user.role}`.toLowerCase().includes(q));
  }, [search, users]);

  return (
    <div className="max-w-[1400px] space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900">Foydalanuvchilar</h1>
          <p className="text-sm text-gray-400">{users.length} ta hisob</p>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Qidirish" className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} />
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-400">
            <tr>
              <th className="px-4 py-3">Ism</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Sana</th>
              <th className="px-4 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-3 font-semibold">{user.name || `${user.firstName} ${user.lastName}`}</td>
                <td className="px-4 py-3">{user.phone}</td>
                <td className="px-4 py-3">{ROLE_LABEL[user.role] || user.role}</td>
                <td className="px-4 py-3 text-gray-500">{formatDateShort(user.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  {user.role !== "admin" && (
                    <TableActionButton icon={user.active === false ? "unlock" : "lock"} label={user.active === false ? "Ochish" : "Bloklash"} tone="danger" onClick={() => adminApi.updateUser(user.id, { active: user.active === false }).then(load)} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
