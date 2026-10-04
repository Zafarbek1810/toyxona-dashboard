import { useEffect, useState } from "react";
import Modal, { FormField, inputClass } from "../Modal";
import { adminApi } from "../../lib/api";
import type { SubscriptionPlan } from "../../lib/api/types";
import { formatPrice } from "../../lib/format";

const COLOR_PRESETS = ["#6B7494", "#1A3A6E", "#00A86B", "#D97706", "#7C3AED", "#DC2626", "#0284C7"];
const FIXED_PLAN_IDS = ["start", "business", "pro"] as const;

type PlanForm = {
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  color: string;
  popular: boolean;
  limits: string;
  featuresText: string;
  productLimit: string;
  active: boolean;
};

type PlanErrors = Partial<Record<"name" | "monthlyPrice" | "yearlyPrice" | "limits" | "featuresText", string>>;

function parsePrice(value: string): number | null {
  const cleaned = value.replace(/\s/g, "").replace(/,/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) && num >= 0 ? num : null;
}

function validatePlanForm(form: PlanForm): PlanErrors {
  const errors: PlanErrors = {};
  if (!form.name.trim()) errors.name = "Reja nomi kiritilishi shart";
  if (parsePrice(form.monthlyPrice) === null) errors.monthlyPrice = "To'g'ri oylik narx kiriting";
  if (parsePrice(form.yearlyPrice) === null) errors.yearlyPrice = "To'g'ri yillik narx kiriting";
  if (!form.limits.trim()) errors.limits = "Limit kiritilishi shart";
  const features = form.featuresText
    .split("\n")
    .map(f => f.trim())
    .filter(Boolean);
  if (features.length === 0) errors.featuresText = "Kamida bitta imkoniyat kiriting";
  return errors;
}

function planToForm(plan: SubscriptionPlan): PlanForm {
  return {
    name: plan.name,
    monthlyPrice: String(plan.monthlyPrice),
    yearlyPrice: String(plan.yearlyPrice),
    color: plan.color,
    popular: !!plan.popular,
    limits: plan.limits,
    featuresText: (plan.features || []).join("\n"),
    productLimit: plan.productLimit != null ? String(plan.productLimit) : "",
    active: plan.active !== false,
  };
}

export default function AdminSubscriptionsSection() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState<PlanForm | null>(null);
  const [errors, setErrors] = useState<PlanErrors>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminApi.plans();
      setPlans(list);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updateField = <K extends keyof PlanForm>(field: K, value: PlanForm[K]) => {
    setForm(prev => (prev ? { ...prev, [field]: value } : prev));
    setErrors(prev => {
      const next = { ...prev };
      if (field in next) delete next[field as keyof PlanErrors];
      return next;
    });
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setForm(planToForm(plan));
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPlan(null);
    setForm(null);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!form || !editingPlan) return;
    const validationErrors = validatePlanForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const id = FIXED_PLAN_IDS.includes(editingPlan.id as (typeof FIXED_PLAN_IDS)[number])
      ? editingPlan.id
      : null;
    if (!id) {
      setErrors({ name: "Faqat start / business / pro rejalari tahrirlanadi" });
      return;
    }

    setSaving(true);
    try {
      await adminApi.upsertPlan({
        id,
        name: form.name.trim(),
        monthlyPrice: parsePrice(form.monthlyPrice)!,
        yearlyPrice: parsePrice(form.yearlyPrice)!,
        color: form.color,
        popular: form.popular,
        limits: form.limits.trim(),
        features: form.featuresText
          .split("\n")
          .map(f => f.trim())
          .filter(Boolean),
        productLimit: form.productLimit ? Number(form.productLimit) : undefined,
        active: form.active,
      });
      closeModal();
      await load();
    } catch {
      setErrors({ name: "Saqlashda xatolik" });
    } finally {
      setSaving(false);
    }
  };

  const totalSubscribers = plans.reduce((sum, p) => sum + (p.subscribers || 0), 0);
  const monthlyRevenue = plans.reduce((sum, p) => sum + p.monthlyPrice * (p.subscribers || 0), 0);
  const topPlan = plans.reduce<SubscriptionPlan | null>(
    (best, p) => (!best || (p.subscribers || 0) > (best.subscribers || 0) ? p : best),
    null,
  );

  if (loading) {
    return (
      <div className="max-w-[1400px] py-16 text-center text-sm text-gray-400">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <>
      <div className="max-w-[1400px] space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>
              Obuna rejalari
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Platformaning daromad modeli · start / business / pro</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Jami obunachi", value: totalSubscribers.toLocaleString(), icon: "⭐", color: "#D97706" },
            { label: "Oylik daromad", value: formatPrice(monthlyRevenue), icon: "💰", color: "#10B981" },
            { label: "O'rtacha reja", value: topPlan?.name ?? "—", icon: "📊", color: "#8B5CF6" },
          ].map(s => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border p-4 shadow-sm flex items-center gap-3"
              style={{ borderColor: "#E2E6F0" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: s.color + "15" }}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-lg font-black font-mono text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center" style={{ borderColor: "#E2E6F0" }}>
            <p className="text-sm text-gray-400">Hali obuna rejalari yo{"'"}q</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div
                key={plan.id}
                className="bg-white rounded-2xl border-2 p-5 shadow-sm"
                style={{ borderColor: plan.popular ? "#00A86B" : "#E2E6F0" }}
              >
                {plan.popular && (
                  <div className="inline-flex items-center gap-1 bg-[#00A86B] text-white text-[10px] px-2.5 py-1 rounded-full font-bold mb-3">
                    Mashhur
                  </div>
                )}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black mb-3"
                  style={{ background: plan.color }}
                >
                  {plan.name[0]}
                </div>
                <h3 className="font-black text-lg" style={{ color: plan.color, fontFamily: "var(--font-sans)" }}>
                  {plan.name}
                </h3>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{plan.id}</p>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="text-2xl font-black font-mono text-gray-900">
                    {formatPrice(plan.monthlyPrice)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-3">/oy · Yillik: {formatPrice(plan.yearlyPrice)}</p>
                <p className="text-xs text-gray-500 mb-3">{plan.limits}</p>
                <ul className="space-y-1.5 mb-4">
                  {(plan.features || []).slice(0, 4).map(feature => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-gray-600">
                      <svg
                        className="w-3.5 h-3.5 text-[#00A86B] shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="space-y-2 mb-4">
                  {[
                    { label: "Obunachi", value: (plan.subscribers || 0).toLocaleString() },
                    {
                      label: "Umumiy daromad",
                      value: formatPrice(plan.monthlyPrice * (plan.subscribers || 0)),
                    },
                  ].map(stat => (
                    <div key={stat.label} className="flex justify-between text-xs">
                      <span className="text-gray-500">{stat.label}</span>
                      <span className="font-bold text-gray-900 font-mono">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openEditModal(plan)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold border transition-all hover:opacity-80"
                  style={{ borderColor: plan.color, color: plan.color }}
                >
                  Tahrirlash
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen && !!form && !!editingPlan}
        onClose={closeModal}
        title="Rejani tahrirlash"
        description="Reja ma'lumotlarini yangilang"
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
              className="px-5 py-2.5 rounded-xl bg-[#00A86B] hover:bg-[#008F5A] text-white font-semibold text-sm shadow-sm disabled:opacity-60"
            >
              Saqlash
            </button>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <FormField label="Reja nomi" required error={errors.name}>
              <input
                value={form.name}
                onChange={e => updateField("name", e.target.value)}
                placeholder="BUSINESS"
                className={inputClass(!!errors.name)}
                style={{ borderColor: errors.name ? undefined : "#E2E6F0" }}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Oylik narx (so'm)" required error={errors.monthlyPrice}>
                <input
                  value={form.monthlyPrice}
                  onChange={e => updateField("monthlyPrice", e.target.value)}
                  placeholder="499000"
                  className={inputClass(!!errors.monthlyPrice)}
                  style={{ borderColor: errors.monthlyPrice ? undefined : "#E2E6F0" }}
                />
              </FormField>
              <FormField label="Yillik narx (so'm)" required error={errors.yearlyPrice}>
                <input
                  value={form.yearlyPrice}
                  onChange={e => updateField("yearlyPrice", e.target.value)}
                  placeholder="4990000"
                  className={inputClass(!!errors.yearlyPrice)}
                  style={{ borderColor: errors.yearlyPrice ? undefined : "#E2E6F0" }}
                />
              </FormField>
            </div>

            <FormField label="Limit" required error={errors.limits}>
              <input
                value={form.limits}
                onChange={e => updateField("limits", e.target.value)}
                placeholder="300 mahsulot"
                className={inputClass(!!errors.limits)}
                style={{ borderColor: errors.limits ? undefined : "#E2E6F0" }}
              />
            </FormField>

            <FormField label="Mahsulot limiti (son)">
              <input
                value={form.productLimit}
                onChange={e => updateField("productLimit", e.target.value)}
                placeholder="300"
                className={inputClass()}
                style={{ borderColor: "#E2E6F0" }}
              />
            </FormField>

            <FormField label="Imkoniyatlar (har biri yangi qatorda)" required error={errors.featuresText}>
              <textarea
                rows={5}
                value={form.featuresText}
                onChange={e => updateField("featuresText", e.target.value)}
                placeholder={"300 ta mahsulot\nKengaytirilgan statistika\nUstuvor qo'llab-quvvatlash"}
                className={`${inputClass(!!errors.featuresText)} resize-none`}
                style={{ borderColor: errors.featuresText ? undefined : "#E2E6F0" }}
              />
            </FormField>

            <FormField label="Rang">
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateField("color", color)}
                    className={`w-9 h-9 rounded-xl border-2 transition-all ${
                      form.color === color ? "border-gray-900 scale-110" : "border-transparent"
                    }`}
                    style={{ background: color }}
                    aria-label={color}
                  />
                ))}
              </div>
            </FormField>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.popular}
                onChange={e => updateField("popular", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#00A86B] focus:ring-[#00A86B]"
              />
              <span className="text-sm text-gray-700">Mashhur reja sifatida belgilash</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => updateField("active", e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#00A86B] focus:ring-[#00A86B]"
              />
              <span className="text-sm text-gray-700">Faol</span>
            </label>
          </div>
        )}
      </Modal>
    </>
  );
}
