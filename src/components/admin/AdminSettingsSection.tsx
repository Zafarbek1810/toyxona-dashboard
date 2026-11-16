import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";
import type { PlatformSettings } from "../../lib/api/types";

const field = "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]";

export default function AdminSettingsSection() {
  const [form, setForm] = useState<PlatformSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then(setForm).catch(() => setForm(null));
  }, []);

  if (!form) return <p className="text-sm text-gray-400">Yuklanmoqda...</p>;

  const save = async () => {
    const next = await adminApi.updateSettings(form);
    setForm(next);
    setSaved(true);
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-black text-gray-900">Sozlamalar</h1>
      <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
        <input className={field} style={{ borderColor: "var(--border)" }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className={field} style={{ borderColor: "var(--border)" }} value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} />
        <input className={field} style={{ borderColor: "var(--border)" }} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className={field} style={{ borderColor: "var(--border)" }} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.autoApproveVenues} onChange={(e) => setForm({ ...form, autoApproveVenues: e.target.checked })} />
          Yangi to&apos;yxonalarni avtomatik tasdiqlash
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.autoApproveSpecialists} onChange={(e) => setForm({ ...form, autoApproveSpecialists: e.target.checked })} />
          Yangi mutaxassislarni avtomatik tasdiqlash
        </label>
        <button type="button" onClick={() => void save()} className="rounded-xl bg-[#063528] text-white font-semibold px-4 py-2.5">Saqlash</button>
        {saved && <p className="text-sm text-[#00A86B]">Saqlandi</p>}
      </div>
    </div>
  );
}
