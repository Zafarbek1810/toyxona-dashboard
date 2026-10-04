import { useEffect, useState } from "react";
import Modal, { FormField, inputClass, selectClass } from "../Modal";
import { adminApi } from "../../lib/api";
import {
  formatCompact,
  formatDateShort,
  PROMO_STATUS_UZ,
  PROMO_TYPE_UZ,
} from "../../lib/format";

type PromoType = "banner" | "popup" | "email" | "flash";
type PromoStatus = "active" | "scheduled" | "ended";

type Promotion = {
  id: number;
  title: string;
  type: PromoType | string;
  status: PromoStatus | string;
  clicks?: number;
  conversions?: number;
  conversion?: number | string;
  startDate?: string;
  endDate?: string;
  link?: string;
  description?: string;
};

type PromotionForm = {
  title: string;
  type: PromoType;
  status: PromoStatus;
  startDate: string;
  endDate: string;
  link: string;
  description: string;
};

type PromotionErrors = Partial<Record<keyof PromotionForm, string>>;

const TYPE_COLORS: Record<string, string> = {
  banner: "#EF4444",
  popup: "#D97706",
  email: "#3B82F6",
  flash: "#8B5CF6",
};

const initialForm: PromotionForm = {
  title: "",
  type: "banner",
  status: "scheduled",
  startDate: "",
  endDate: "",
  link: "",
  description: "",
};

function toDateInput(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function validatePromotionForm(form: PromotionForm): PromotionErrors {
  const errors: PromotionErrors = {};
  if (!form.title.trim()) errors.title = "Reklama sarlavhasi kiritilishi shart";
  if (!form.startDate) errors.startDate = "Boshlanish sanasi tanlanishi shart";
  if (!form.endDate) errors.endDate = "Tugash sanasi tanlanishi shart";
  else if (form.startDate && form.endDate < form.startDate) {
    errors.endDate = "Tugash sanasi boshlanish sanasidan keyin bo'lishi kerak";
  }
  return errors;
}

function convLabel(p: Promotion): string {
  if (p.conversion != null) {
    return typeof p.conversion === "number" ? `${p.conversion}%` : String(p.conversion);
  }
  if (p.clicks && p.conversions != null && p.clicks > 0) {
    return `${((p.conversions / p.clicks) * 100).toFixed(1)}%`;
  }
  return "—";
}

export default function AdminPromotionsSection() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [deletePromo, setDeletePromo] = useState<Promotion | null>(null);
  const [form, setForm] = useState<PromotionForm>(initialForm);
  const [errors, setErrors] = useState<PromotionErrors>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = (await adminApi.promotions()) as Promotion[];
      setPromotions(list);
    } catch {
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const activeCount = promotions.filter(p => p.status === "active").length;
  const totalClicks = promotions.reduce((s, p) => s + (p.clicks || 0), 0);
  const totalConv = promotions.reduce((s, p) => s + (p.conversions || 0), 0);
  const avgConv = totalClicks > 0 ? ((totalConv / totalClicks) * 100).toFixed(1) : "0";

  const updateField = <K extends keyof PromotionForm>(field: K, value: PromotionForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      title: p.title,
      type: (p.type as PromoType) || "banner",
      status: (p.status as PromoStatus) || "scheduled",
      startDate: toDateInput(p.startDate),
      endDate: toDateInput(p.endDate),
      link: p.link || "",
      description: p.description || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setErrors({});
  };

  const handleSubmit = async () => {
    const validationErrors = validatePromotionForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const body = {
      title: form.title.trim(),
      type: form.type,
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
      link: form.link.trim() || undefined,
      description: form.description.trim() || undefined,
    };

    setSaving(true);
    try {
      if (editing) {
        await adminApi.updatePromotion(editing.id, body);
      } else {
        await adminApi.createPromotion(body);
      }
      closeModal();
      await load();
    } catch {
      setErrors({ title: "Saqlashda xatolik" });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletePromo) return;
    await adminApi.deletePromotion(deletePromo.id);
    setDeletePromo(null);
    await load();
  };

  return (
    <>
      <div className="max-w space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>
              Reklamalar va aksiyalar
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Platforma reklama boshqaruvi</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="bg-[#F59E0B] text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-[#D97706] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {"Reklama qo'shish"}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Faol reklamalar", value: String(activeCount), icon: "📢", color: "#D97706" },
            { label: "Jami bosishlar", value: formatCompact(totalClicks), icon: "👆", color: "#3B82F6" },
            { label: "Konversiya", value: `${avgConv}%`, icon: "📈", color: "#10B981" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border p-5 shadow-sm flex items-center gap-4" style={{ borderColor: "#E2E6F0" }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: s.color + "15" }}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-black font-mono text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 py-10 text-center">Yuklanmoqda...</p>
        ) : promotions.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: "#E2E6F0" }}>
            <p className="text-sm text-gray-400 mb-3">Hali reklamalar yo{"'"}q</p>
            <button type="button" onClick={openCreate} className="text-sm text-[#F59E0B] font-semibold hover:underline">
              {"+ Birinchi reklamani qo'shish"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {promotions.map(ad => {
              const typeLabel = PROMO_TYPE_UZ[ad.type] || ad.type;
              const statusLabel = PROMO_STATUS_UZ[ad.status] || ad.status;
              const color = TYPE_COLORS[ad.type] || "#6B7280";
              return (
                <div key={ad.id} className="bg-white rounded-2xl border p-5 shadow-sm flex items-center gap-4" style={{ borderColor: "#E2E6F0" }}>
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-black text-sm" style={{ background: color }}>
                    {typeLabel[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-sm text-gray-900">{ad.title}</p>
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{typeLabel}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {formatDateShort(ad.startDate)} — {formatDateShort(ad.endDate)}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-8 text-center">
                    <div>
                      <p className="font-mono font-bold text-sm text-gray-900">
                        {ad.clicks != null ? formatCompact(ad.clicks) : "—"}
                      </p>
                      <p className="text-[10px] text-gray-400">Bosishlar</p>
                    </div>
                    <div>
                      <p className="font-mono font-bold text-sm text-gray-900">{convLabel(ad)}</p>
                      <p className="text-[10px] text-gray-400">Konversiya</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full shrink-0 ${
                      ad.status === "active"
                        ? "bg-green-50 text-green-600"
                        : ad.status === "scheduled"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {statusLabel}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(ad)}
                      className="w-8 h-8 rounded-xl hover:bg-blue-50 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletePromo(ad)}
                      className="w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? "Reklamani tahrirlash" : "Yangi reklama yaratish"}
        description="Reklama yoki aksiya ma'lumotlarini kiriting"
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold text-sm hover:bg-gray-50"
              style={{ borderColor: "#E2E6F0" }}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-semibold text-sm shadow-sm disabled:opacity-60"
            >
              {editing ? "Saqlash" : "Reklama yaratish"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Sarlavha" required error={errors.title}>
            <input
              value={form.title}
              onChange={e => updateField("title", e.target.value)}
              placeholder="Flash Sale — Elektronika"
              className={inputClass(!!errors.title)}
              style={{ borderColor: errors.title ? undefined : "#E2E6F0" }}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Turi">
              <select
                value={form.type}
                onChange={e => updateField("type", e.target.value as PromoType)}
                className={selectClass()}
                style={{ borderColor: "#E2E6F0" }}
              >
                {(Object.keys(PROMO_TYPE_UZ) as PromoType[]).map(key => (
                  <option key={key} value={key}>
                    {PROMO_TYPE_UZ[key]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Holati">
              <select
                value={form.status}
                onChange={e => updateField("status", e.target.value as PromoStatus)}
                className={selectClass()}
                style={{ borderColor: "#E2E6F0" }}
              >
                {(Object.keys(PROMO_STATUS_UZ) as PromoStatus[]).map(key => (
                  <option key={key} value={key}>
                    {PROMO_STATUS_UZ[key]}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Boshlanish sanasi" required error={errors.startDate}>
              <input
                type="date"
                value={form.startDate}
                onChange={e => updateField("startDate", e.target.value)}
                className={inputClass(!!errors.startDate)}
                style={{ borderColor: errors.startDate ? undefined : "#E2E6F0" }}
              />
            </FormField>
            <FormField label="Tugash sanasi" required error={errors.endDate}>
              <input
                type="date"
                value={form.endDate}
                onChange={e => updateField("endDate", e.target.value)}
                className={inputClass(!!errors.endDate)}
                style={{ borderColor: errors.endDate ? undefined : "#E2E6F0" }}
              />
            </FormField>
          </div>

          <FormField label="Havola (URL)">
            <input
              value={form.link}
              onChange={e => updateField("link", e.target.value)}
              placeholder="https://toyxona.uz/aksiya"
              className={inputClass()}
              style={{ borderColor: "#E2E6F0" }}
            />
          </FormField>

          <FormField label="Tavsif">
            <textarea
              rows={3}
              value={form.description}
              onChange={e => updateField("description", e.target.value)}
              placeholder="Reklama haqida qisqacha ma'lumot..."
              className={`${inputClass()} resize-none`}
              style={{ borderColor: "#E2E6F0" }}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={!!deletePromo}
        onClose={() => setDeletePromo(null)}
        title="Reklamani o'chirish"
        description="Bu amalni bekor qilib bo'lmaydi"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeletePromo(null)}
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
        {deletePromo && (
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">{deletePromo.title}</span> reklamasi
            {" o'chiriladi."}
          </p>
        )}
      </Modal>
    </>
  );
}
