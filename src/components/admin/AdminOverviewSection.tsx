import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
} from "recharts";
import { adminApi } from "../../lib/api";
import { mediaUrl } from "../../lib/api/client";
import type { Seller, SubscriptionPlan } from "../../lib/api/types";
import { formatCompact, formatPrice } from "../../lib/format";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { paths } from "../../routes/paths";

type OverviewKpis = {
  users: number;
  sellers: number;
  products: number;
  orders: number;
  pendingProducts: number;
  pendingSellers: number;
  revenueThisMonth: number;
};

type SeriesPoint = {
  month: string;
  sellers: number;
  users: number;
  revenue: number;
  key?: string;
};

export default function AdminOverviewSection() {
  const navigate = useAppNavigate();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<OverviewKpis | null>(null);
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [pendingSellers, setPendingSellers] = useState<Seller[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [overview, analytics, pending, planList] = await Promise.all([
        adminApi.overview() as Promise<{ kpis: OverviewKpis }>,
        adminApi.analytics() as Promise<{ series: SeriesPoint[] }>,
        adminApi.sellers({ status: "pending" }),
        adminApi.plans(),
      ]);
      setKpis(overview.kpis);
      setSeries(analytics.series || []);
      setPendingSellers(pending);
      setPlans(planList);
    } catch {
      setKpis(null);
      setSeries([]);
      setPendingSellers([]);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleApproveSeller = async (id: number) => {
    await adminApi.updateSeller(id, { status: "active", verified: true });
    await load();
  };

  const handleRejectSeller = async (id: number) => {
    await adminApi.updateSeller(id, { status: "suspended" });
    await load();
  };

  const totalSubscribers = plans.reduce((sum, p) => sum + (p.subscribers || 0), 0);
  const subscriptionRevenue = plans.reduce(
    (sum, p) => sum + (p.monthlyPrice || 0) * (p.subscribers || 0),
    0,
  );

  const platformKpis = kpis
    ? [
        { label: "Jami foydalanuvchilar", value: formatCompact(kpis.users), icon: "👤", accent: "#3B82F6" },
        { label: "Faol sotuvchilar", value: formatCompact(kpis.sellers), icon: "🏪", accent: "#8B5CF6" },
        { label: "Jami mahsulotlar", value: formatCompact(kpis.products), icon: "📦", accent: "#F97316" },
        { label: "Oylik daromad", value: formatCompact(kpis.revenueThisMonth), icon: "💰", accent: "#10B981" },
        { label: "Faol obunalar", value: formatCompact(totalSubscribers), icon: "⭐", accent: "#D97706" },
        { label: "Jami buyurtmalar", value: formatCompact(kpis.orders), icon: "🛒", accent: "#6366F1" },
        { label: "Kutilayotgan mahsulot", value: formatCompact(kpis.pendingProducts), icon: "📦", accent: "#F59E0B" },
        { label: "Kutilayotgan sotuvchi", value: formatCompact(kpis.pendingSellers), icon: "⏳", accent: "#EF4444" },
      ]
    : [];

  if (loading) {
    return (
      <div className="max-w-[1500px] py-16 text-center text-sm text-gray-400">
        Yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[1500px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>Boshqaruv paneli</h1>
          <p className="text-sm text-gray-400 mt-0.5">{"To'yxona umumiy ko'rsatkichlari"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {platformKpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl border p-4 shadow-sm relative overflow-hidden" style={{ borderColor: "#E2E6F0" }}>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.06] -translate-y-6 translate-x-6" style={{ background: kpi.accent }}></div>
            <div className="flex items-start justify-between mb-3">
              <span className="text-xl">{kpi.icon}</span>
            </div>
            <p className="text-xl font-black text-gray-900 font-mono leading-tight">{kpi.value}</p>
            <p className="text-[11px] text-gray-500 mt-1">{kpi.label}</p>
            <div className="mt-2 h-0.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ background: kpi.accent, width: "68%" }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Platform daromadi</h2>
              <p className="text-xs text-gray-400 mt-0.5">Oylik dinamika</p>
            </div>
          </div>
          {series.length === 0 ? (
            <p className="text-sm text-gray-400 py-16 text-center">{"Ma'lumot yo'q"}</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={series} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D97706" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} width={40} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
                  formatter={(v) => [formatPrice(Number(v)), "Daromad"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D97706" strokeWidth={2.5} fill="url(#adminRev)" dot={false} activeDot={{ r: 5, fill: "#D97706" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Yangi sotuvchilar</h2>
              <p className="text-xs text-gray-400 mt-0.5">{"Oylik ro'yxatdan o'tish"}</p>
            </div>
          </div>
          {series.length === 0 ? (
            <p className="text-sm text-gray-400 py-16 text-center">{"Ma'lumot yo'q"}</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={series} margin={{ top: 5, right: 5, left: -24, bottom: 0 }} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
                  cursor={{ fill: "#F5F3FF" }}
                />
                <Bar dataKey="sellers" fill="#8B5CF6" radius={[6, 6, 0, 0]} name="Sotuvchilar" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Foydalanuvchilar</h2>
              <p className="text-xs text-gray-400 mt-0.5">{"O'sish tendentsiyasi"}</p>
            </div>
          </div>
          {series.length === 0 ? (
            <p className="text-sm text-gray-400 py-16 text-center">{"Ma'lumot yo'q"}</p>
          ) : (
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={series} margin={{ top: 5, right: 5, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#3B82F6" }} name="Foydalanuvchilar" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-sm">Kutilayotgan tasdiqlash</h2>
            <span className="bg-red-50 text-red-500 text-xs font-bold px-2 py-0.5 rounded-full">
              {pendingSellers.length} ta
            </span>
          </div>
          <div className="space-y-2.5">
            {pendingSellers.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">{"Kutilayotgan sotuvchi yo'q"}</p>
            ) : (
              pendingSellers.slice(0, 4).map(s => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl border hover:border-[#00A86B]/20 hover:bg-[#E8F8F1]/40 transition-all" style={{ borderColor: "#E2E6F0" }}>
                  <img src={mediaUrl(s.logo) || ""} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 bg-gray-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{s.name}</p>
                    <p className="text-[10px] text-gray-400">{s.location || "—"}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => void handleApproveSeller(s.id)}
                      className="w-7 h-7 rounded-lg bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleRejectSeller(s.id)}
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
            <button onClick={() => navigate(paths.admin.sellers)} className="w-full text-center text-xs text-[#00A86B] font-semibold py-2 hover:underline">
              {"Barchasini ko'rish"} ({pendingSellers.length}) →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-sm">Obuna statistikasi</h2>
            <span className="text-xs bg-amber-50 text-amber-600 font-semibold px-2 py-0.5 rounded-full">
              {totalSubscribers.toLocaleString()} faol
            </span>
          </div>
          <div className="space-y-3">
            {plans.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">{"Rejalar yo'q"}</p>
            ) : (
              plans.map(plan => {
                const subs = plan.subscribers || 0;
                const pct = totalSubscribers > 0 ? Math.round((subs / totalSubscribers) * 100) : 0;
                return (
                  <div key={plan.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: plan.color }}></div>
                        <span className="text-xs font-semibold text-gray-700">{plan.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-900">{subs.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ background: plan.color, width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
            <div className="pt-2 border-t" style={{ borderColor: "#E2E6F0" }}>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Jami daromad (obunalar)</span>
                <span className="text-xs font-mono font-bold text-gray-900">{formatPrice(subscriptionRevenue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
