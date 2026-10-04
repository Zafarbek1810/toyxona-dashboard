import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { sellerApi } from "../../lib/api";
import type { Seller } from "../../lib/api/types";

type FormState = {
  name: string;
  description: string;
  phone: string;
  email: string;
  location: string;
  workingHours: string;
  minOrderAmount: string;
  deliveryTimeframe: string;
  freeDeliveryThreshold: string;
  notifyNewOrder: boolean;
  notifyNewReview: boolean;
  notifyLowStock: boolean;
  notifyPayment: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  phone: "",
  email: "",
  location: "",
  workingHours: "",
  minOrderAmount: "",
  deliveryTimeframe: "",
  freeDeliveryThreshold: "",
  notifyNewOrder: true,
  notifyNewReview: true,
  notifyLowStock: true,
  notifyPayment: false,
};

function sellerToForm(s: Seller): FormState {
  return {
    name: s.name || "",
    description: s.description || "",
    phone: s.phone || "",
    email: s.email || "",
    location: s.location || "",
    workingHours: s.workingHours || "",
    minOrderAmount: String(s.delivery?.minOrderAmount ?? ""),
    deliveryTimeframe: s.delivery?.deliveryTimeframe || "",
    freeDeliveryThreshold: String(s.delivery?.freeDeliveryThreshold ?? ""),
    notifyNewOrder: s.notifications?.newOrder ?? true,
    notifyNewReview: s.notifications?.newReview ?? true,
    notifyLowStock: s.notifications?.lowStock ?? true,
    notifyPayment: s.notifications?.paymentConfirmed ?? false,
  };
}

export default function SellerSettingsSection() {
  const { showToast } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const settings = (await sellerApi.getSettings()) as Seller;
        if (!cancelled) setForm(sellerToForm(settings));
      } catch {
        if (!cancelled) setForm(emptyForm);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveStore = async () => {
    setSaving(true);
    try {
      const updated = (await sellerApi.updateSettings({
        name: form.name,
        description: form.description,
        phone: form.phone,
        email: form.email || null,
        location: form.location,
        workingHours: form.workingHours || undefined,
      })) as Seller;
      setForm(sellerToForm(updated));
      showToast("Do'kon ma'lumotlari saqlandi", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Saqlashda xato", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveDelivery = async () => {
    setSaving(true);
    try {
      await sellerApi.updateSettings({
        minOrderAmount: Number(form.minOrderAmount) || 0,
        deliveryTimeframe: form.deliveryTimeframe,
        freeDeliveryThreshold: Number(form.freeDeliveryThreshold) || 0,
      });
      showToast("Yetkazib berish sozlamalari saqlandi", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Saqlashda xato", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async (patch: Partial<FormState>) => {
    const next = { ...form, ...patch };
    setForm(next);
    try {
      await sellerApi.updateSettings({
        notifyNewOrder: next.notifyNewOrder,
        notifyNewReview: next.notifyNewReview,
        notifyLowStock: next.notifyLowStock,
        notifyPayment: next.notifyPayment,
      });
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Saqlashda xato", "error");
    }
  };

  if (loading) {
    return <div className="max-w-2xl py-16 text-center text-gray-400">Yuklanmoqda...</div>;
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>Sozlamalar</h1>
        <p className="text-sm text-gray-400 mt-0.5">Do'kon va hisob sozlamalari</p>
      </div>

      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
          <span>🏪</span>Do'kon ma'lumotlari
        </h2>
        {[
          { key: "name" as const, label: "Do'kon nomi", type: "text" },
          { key: "description" as const, label: "Tavsif", type: "textarea" },
          { key: "phone" as const, label: "Telefon", type: "text" },
          { key: "email" as const, label: "Email", type: "text" },
          { key: "location" as const, label: "Manzil", type: "text" },
          { key: "workingHours" as const, label: "Ish vaqti", type: "text" },
        ].map((f) => (
          <div key={f.key} className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea
                rows={3}
                value={form[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A86B] resize-none"
                style={{ borderColor: "var(--border)" }}
              />
            ) : (
              <input
                value={form[f.key]}
                onChange={(e) => setField(f.key, e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                style={{ borderColor: "var(--border)" }}
              />
            )}
          </div>
        ))}
        <button
          type="button"
          disabled={saving}
          onClick={saveStore}
          className="mt-2 bg-[#00A86B] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#008F5A] transition-colors disabled:opacity-60"
        >
          Saqlash
        </button>
      </div>

      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
          <span>🚚</span>Yetkazib berish
        </h2>
        {[
          { key: "minOrderAmount" as const, label: "Minimal buyurtma summasi" },
          { key: "deliveryTimeframe" as const, label: "Yetkazib berish muddati" },
          { key: "freeDeliveryThreshold" as const, label: "Bepul yetkazib berish chegara" },
        ].map((f) => (
          <div key={f.key} className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{f.label}</label>
            <input
              value={form[f.key]}
              onChange={(e) => setField(f.key, e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
              style={{ borderColor: "var(--border)" }}
            />
          </div>
        ))}
        <button
          type="button"
          disabled={saving}
          onClick={saveDelivery}
          className="mt-2 bg-[#00A86B] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#008F5A] transition-colors disabled:opacity-60"
        >
          Saqlash
        </button>
      </div>

      <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
          <span>🔔</span>Bildirishnomalar
        </h2>
        {(
          [
            { key: "notifyNewOrder" as const, label: "Yangi buyurtma kelganda" },
            { key: "notifyNewReview" as const, label: "Sharh qoldirilganda" },
            { key: "notifyLowStock" as const, label: "Ombor kam qolganda" },
            { key: "notifyPayment" as const, label: "To'lov tasdiqlanganda" },
          ]
        ).map((t) => (
          <div key={t.key} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
            <span className="text-sm text-gray-700">{t.label}</span>
            <button
              type="button"
              onClick={() => saveNotifications({ [t.key]: !form[t.key] })}
              className={`w-11 h-6 rounded-full cursor-pointer transition-colors relative ${form[t.key] ? "bg-[#00A86B]" : "bg-gray-200"}`}
              aria-label={t.label}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form[t.key] ? "left-6" : "left-1"}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
