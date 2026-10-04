import { useEffect, useState } from "react";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { catalogApi, sellerApi } from "../../lib/api";
import type { SubscriptionPlan } from "../../lib/api/types";
import { formatDateShort, formatPrice } from "../../lib/format";
import { paths } from "../../routes/paths";

type SubscriptionInfo = {
  plan: SubscriptionPlan | null;
  status: string;
  billingCycle?: string;
  expiresAt?: string | null;
  daysLeft?: number;
  history?: unknown[];
};

export default function SellerSubscriptionSection() {
  const navigate = useAppNavigate();
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [subscription, planList] = await Promise.all([
          sellerApi.subscription() as Promise<SubscriptionInfo>,
          catalogApi.plans(),
        ]);
        if (cancelled) return;
        setSub(subscription);
        setPlans(planList);
      } catch {
        if (!cancelled) {
          setSub(null);
          setPlans([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentPlanId = sub?.plan?.id;
  const cycle = sub?.billingCycle === "yearly" ? "yearly" : "monthly";

  const goCheckout = (planId: string) => {
    navigate(`${paths.seller.subscriptionCheckout}?planId=${planId}&billingCycle=${cycle}`);
  };

  if (loading) {
    return <div className="max-w py-16 text-center text-gray-400">Yuklanmoqda...</div>;
  }

  return (
    <div className="max-w">
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>Obuna va to'lovlar</h1>
        <p className="text-sm text-gray-400 mt-0.5">Joriy obuna holati va rejalar</p>
      </div>

      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 mb-5 flex items-center justify-between shadow-lg shadow-amber-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="text-white">
            <p className="font-black text-lg">
              {sub?.plan?.name || "START"} Obuna — {sub?.status === "active" ? "Faol" : sub?.status || "—"}
            </p>
            <p className="text-white/80 text-sm">
              Muddati: {formatDateShort(sub?.expiresAt)} · {sub?.daysLeft ?? 0} kun qoldi
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => goCheckout(currentPlanId || "pro")}
            className="bg-white text-amber-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-50"
          >
            Yangilash
          </button>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="py-10 text-center text-gray-400">Tariflar yo'q</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border-2 p-5 relative shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  plan.popular || isCurrent ? "border-[#00A86B]" : ""
                }`}
                style={!plan.popular && !isCurrent ? { borderColor: "var(--border)" } : {}}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00A86B] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                    Mashhur
                  </div>
                )}
                <div className="mb-4">
                  <div
                    className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center text-white text-xs font-black"
                    style={{ background: plan.color }}
                  >
                    {plan.name[0]}
                  </div>
                  <h3 className="font-black text-lg" style={{ color: plan.color, fontFamily: "var(--font-sans)" }}>
                    {plan.name}
                  </h3>
                </div>
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-gray-900">{formatPrice(plan.monthlyPrice)}</span>
                  </div>
                  <span className="text-xs text-gray-400">/oy · Yillik: {formatPrice(plan.yearlyPrice)}</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {(plan.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <svg className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    if (!isCurrent) goCheckout(plan.id);
                  }}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isCurrent
                      ? "bg-amber-500 text-white ring-2 ring-amber-400 ring-offset-2"
                      : plan.popular
                        ? "bg-[#00A86B] text-white hover:bg-[#008F5A]"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {isCurrent ? "✓ Joriy reja" : "Tanlash"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
