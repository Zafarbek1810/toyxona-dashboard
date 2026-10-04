import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { catalogApi, sellerApi } from "../../lib/api";
import { ApiClientError } from "../../lib/api/client";
import type { SubscriptionPlan } from "../../lib/api/types";
import { formatPrice } from "../../lib/format";
import clickLogo from "../../assets/payments/click.svg";
import paymeLogo from "../../assets/payments/payme.png";
import paynetLogo from "../../assets/payments/paynet.png";

interface Props {
  returnPath: string;
  title?: string;
  description?: string;
  amount?: number;
  paymentLabel?: string;
  mode?: "topup" | "subscribe";
  planId?: string;
  billingCycle?: "monthly" | "yearly";
}

const paymentMethods = [
  {
    id: "clickuz",
    name: "ClickUz",
    desc: "Click ilovasi orqali tez to'lov",
    logo: clickLogo,
  },
  {
    id: "payme",
    name: "Payme",
    desc: "Payme ilovasi orqali xavfsiz to'lov",
    logo: paymeLogo,
  },
  {
    id: "paynet",
    name: "Paynet",
    desc: "Paynet terminal yoki ilova orqali",
    logo: paynetLogo,
  },
];

const METHOD_MAP: Record<string, "payme" | "click" | "uzum" | "paynet" | "card"> = {
  clickuz: "click",
  payme: "payme",
  paynet: "paynet",
};

export default function SellerMakePaymentSection({
  returnPath,
  title = "To'lov qilish",
  description = "To'lov usulini tanlang va to'lovni yakunlang",
  amount: amountProp = 100000,
  paymentLabel: paymentLabelProp = "Hisob to'ldirish",
  mode: modeProp = "topup",
  planId: planIdProp,
  billingCycle: billingCycleProp = "monthly",
}: Props) {
  const navigate = useAppNavigate();
  const [searchParams] = useSearchParams();
  const mode = modeProp;
  const planId = planIdProp || searchParams.get("planId") || "pro";
  const billingCycle =
    (billingCycleProp || (searchParams.get("billingCycle") as "monthly" | "yearly" | null) || "monthly") === "yearly"
      ? "yearly"
      : "monthly";

  const [paymentMethod, setPaymentMethod] = useState("payme");
  const [amount, setAmount] = useState(amountProp);
  const [paymentLabel, setPaymentLabel] = useState(paymentLabelProp);
  const [completed, setCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    if (mode !== "subscribe") {
      setAmount(amountProp);
      setPaymentLabel(paymentLabelProp);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const plans = await catalogApi.plans();
        const found = plans.find((p) => p.id === planId) || plans[0] || null;
        if (cancelled || !found) return;
        setPlan(found);
        const price = billingCycle === "yearly" ? found.yearlyPrice : found.monthlyPrice;
        setAmount(price);
        setPaymentLabel(
          `${found.name} — ${billingCycle === "yearly" ? "yillik" : "oylik"} to'lov`,
        );
      } catch {
        if (!cancelled) setPlan(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, planId, billingCycle, amountProp, paymentLabelProp]);

  const handleSubmit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const method = METHOD_MAP[paymentMethod] || "payme";
      if (mode === "subscribe") {
        const res = (await sellerApi.subscribe({
          planId: (plan?.id || planId) as "start" | "business" | "pro",
          billingCycle,
          paymentMethod: method,
        })) as { payment?: { transactionId?: string }; transactionId?: string };
        setTransactionId(res.payment?.transactionId || res.transactionId || "");
      } else {
        const res = (await sellerApi.topup({
          amount,
          method,
          label: paymentLabel,
        })) as { transactionId?: string };
        setTransactionId(res.transactionId || "");
      }
      setCompleted(true);
    } catch (e) {
      const msg =
        e instanceof ApiClientError
          ? e.message
          : e instanceof Error
            ? e.message
            : "To'lov muvaffaqiyatsiz";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    const selected = paymentMethods.find((m) => m.id === paymentMethod)!;
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border p-8 text-center shadow-sm" style={{ borderColor: "var(--border)" }}>
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
          <h2 className="text-xl font-black text-gray-900 mb-2" style={{ fontFamily: "var(--font-sans)" }}>To'lov muvaffaqiyatli!</h2>
          <p className="text-sm text-gray-500 mb-1">
            {formatPrice(amount)} — <span className="font-semibold text-gray-700">{selected.name}</span>
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Tranzaksiya ID:{" "}
            <span className="font-mono font-bold">{transactionId || "—"}</span>
          </p>
          <button
            type="button"
            onClick={() => navigate(returnPath)}
            className="bg-[#00A86B] hover:bg-[#008F5A] text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate(returnPath)}
          className="w-8 h-8 rounded-xl border flex items-center justify-center text-gray-500 hover:bg-gray-50"
          style={{ borderColor: "var(--border)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>{title}</h1>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-4">
          {mode === "topup" && (
            <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Summa (so'm)
              </label>
              <input
                type="number"
                min={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
          )}

          <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-bold text-gray-900 text-sm mb-4">To'lov usulini tanlang</h2>
            <div className="space-y-3">
              {paymentMethods.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                    paymentMethod === m.id ? "border-[#00A86B] bg-[#E8F8F1]" : "hover:border-gray-300"
                  }`}
                  style={paymentMethod !== m.id ? { borderColor: "var(--border)" } : {}}
                >
                  <input
                    type="radio"
                    name="seller-payment"
                    value={m.id}
                    checked={paymentMethod === m.id}
                    onChange={() => setPaymentMethod(m.id)}
                    className="accent-[#00A86B]"
                  />
                  <img
                    src={m.logo}
                    alt={m.name}
                    className="w-10 h-10 rounded-xl shrink-0 object-contain bg-white shadow-sm ring-1 ring-black/5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.desc}</p>
                  </div>
                  {paymentMethod === m.id && (
                    <svg className="w-5 h-5 text-[#00A86B] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
          )}

          <button
            type="button"
            disabled={submitting || amount <= 0}
            onClick={handleSubmit}
            className="w-full bg-[#00A86B] hover:bg-[#008F5A] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60"
          >
            {submitting ? "Yuklanmoqda..." : "To'lovni amalga oshirish"}
          </button>

          <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Barcha to'lovlar SSL shifrlash bilan himoyalangan
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border p-5 shadow-sm sticky top-4" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-bold text-gray-900 text-sm mb-4">To'lov xulosasi</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">{paymentLabel}</span>
                <span className="font-mono font-semibold text-gray-800 shrink-0">{formatPrice(amount)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold" style={{ borderColor: "var(--border)" }}>
                <span>Jami</span>
                <span className="text-[#00A86B] font-mono">{formatPrice(amount)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                To'lovni tasdiqlash orqali siz xizmat shartlariga rozilik bildirasiz. Pul mablag'i tanlangan to'lov tizimi orqali yechiladi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
