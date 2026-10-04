import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";

type AdminSettings = {
  name: string;
  supportEmail: string;
  phone: string;
  address: string;
  commissionPct: number;
  minPayout: number;
  payoutDelayDays: number;
  mandatory2FA: boolean;
  autoApproveSellers: boolean;
  fraudMonitoring: boolean;
  maintenanceMode: boolean;
  notifyNewSeller: boolean;
  notifyNewOrder: boolean;
  notifyRefund: boolean;
};

const EMPTY: AdminSettings = {
  name: "",
  supportEmail: "",
  phone: "",
  address: "",
  commissionPct: 0,
  minPayout: 0,
  payoutDelayDays: 0,
  mandatory2FA: false,
  autoApproveSellers: false,
  fraudMonitoring: false,
  maintenanceMode: false,
  notifyNewSeller: false,
  notifyNewOrder: false,
  notifyRefund: false,
};

export default function AdminSettingsSection() {
  const [settings, setSettings] = useState<AdminSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = (await adminApi.getSettings()) as Partial<AdminSettings>;
        if (!cancelled) setSettings({ ...EMPTY, ...data });
      } catch {
        if (!cancelled) setSettings(EMPTY);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.updateSettings(settings);
      setMessage("Saqlandi");
    } catch {
      setMessage("Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl py-16 text-center text-sm text-gray-400">
        Yuklanmoqda...
      </div>
    );
  }

  const Toggle = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "#E2E6F0" }}>
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`w-11 h-6 rounded-full cursor-pointer transition-colors relative ${value ? "bg-[#F59E0B]" : "bg-gray-200"}`}
        aria-pressed={value}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>Platforma sozlamalari</h1>
        <p className="text-sm text-gray-400 mt-0.5">Umumiy konfiguratsiya va boshqaruv</p>
      </div>

      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
        <h2 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2"><span>⚙️</span>Asosiy sozlamalar</h2>
        {[
          { key: "name" as const, label: "Platforma nomi" },
          { key: "supportEmail" as const, label: "Texnik yordam email" },
          { key: "phone" as const, label: "Telefon" },
          { key: "address" as const, label: "Manzil" },
        ].map(f => (
          <div key={f.key} className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
            <input
              value={settings[f.key]}
              onChange={e => setField(f.key, e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F59E0B]"
              style={{ borderColor: "#E2E6F0" }}
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
        <h2 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2"><span>💰</span>Komissiya sozlamalari</h2>
        {[
          { key: "commissionPct" as const, label: "Standart komissiya (%)" },
          { key: "minPayout" as const, label: "Minimal to'lov (so'm)" },
          { key: "payoutDelayDays" as const, label: "To'lov kechikishi (kun)" },
        ].map(f => (
          <div key={f.key} className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
            <input
              type="number"
              value={settings[f.key]}
              onChange={e => setField(f.key, Number(e.target.value))}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#F59E0B]"
              style={{ borderColor: "#E2E6F0" }}
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
        <h2 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2"><span>🔐</span>Xavfsizlik va huquq</h2>
        <Toggle label="2 bosqichli autentifikatsiya majburiy" value={settings.mandatory2FA} onChange={v => setField("mandatory2FA", v)} />
        <Toggle label="Yangi sotuvchi avtotasdiqlash" value={settings.autoApproveSellers} onChange={v => setField("autoApproveSellers", v)} />
        <Toggle label="Fraud monitoring faol" value={settings.fraudMonitoring} onChange={v => setField("fraudMonitoring", v)} />
        <Toggle label="Texnik ishlar rejimi" value={settings.maintenanceMode} onChange={v => setField("maintenanceMode", v)} />
      </div>

      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
        <h2 className="font-bold text-gray-900 mb-4 text-sm flex items-center gap-2"><span>🔔</span>Bildirishnomalar</h2>
        <Toggle label="Yangi sotuvchi ro'yxatdan o'tganda" value={settings.notifyNewSeller} onChange={v => setField("notifyNewSeller", v)} />
        <Toggle label="Yangi buyurtma kelganda" value={settings.notifyNewOrder} onChange={v => setField("notifyNewOrder", v)} />
        <Toggle label="Qaytarish so'rovi kelganda" value={settings.notifyRefund} onChange={v => setField("notifyRefund", v)} />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="bg-[#F59E0B] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#D97706] transition-colors disabled:opacity-60"
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
        {message && <span className="text-sm text-gray-500">{message}</span>}
      </div>
    </div>
  );
}
