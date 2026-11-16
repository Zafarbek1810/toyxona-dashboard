import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";
import type { SpecialistCategory } from "../../lib/api/types";

export default function AdminCategoriesSection() {
  const [rows, setRows] = useState<SpecialistCategory[]>([]);

  const load = async () => {
    try {
      setRows(await adminApi.categories());
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="max-w-[800px] space-y-4">
      <div>
        <h1 className="text-xl font-black text-gray-900">Yo&apos;nalishlar</h1>
        <p className="text-sm text-gray-400">Mutaxassis kategoriyalari</p>
      </div>
      <div className="bg-white rounded-2xl border divide-y" style={{ borderColor: "var(--border)" }}>
        {rows.map((item) => (
          <div key={item.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-semibold text-gray-900">{item.icon} {item.name}</p>
              <p className="text-xs text-gray-400">{item.short} · {item.count || 0} ta mutaxassis</p>
            </div>
            <button
              type="button"
              onClick={() => adminApi.updateCategory(item.id, { active: !item.active }).then(load)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${item.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
            >
              {item.active ? "Faol" : "Yashirin"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
