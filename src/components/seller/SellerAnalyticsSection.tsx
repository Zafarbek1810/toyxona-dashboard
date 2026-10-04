import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { sellerApi } from "../../lib/api";
import { formatCompact, formatPrice } from "../../lib/format";

type Period = "week" | "month" | "year";

type AnalyticsData = {
  kpis: {
    revenue: number;
    orders: number;
    views: number;
    avgOrderValue: number;
    conversion: number;
  };
  series: { month: string; revenue: number; orders: number }[];
};

export default function SellerAnalyticsSection() {
  const [period, setPeriod] = useState<Period>("year");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = (await sellerApi.analytics(period)) as AnalyticsData;
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const kpis = data?.kpis;
  const cards = [
    {
      label: "Jami daromad",
      value: kpis ? `${formatCompact(kpis.revenue)} so'm` : "—",
      bg: "#E8F8F1",
      color: "#00A86B",
    },
    {
      label: "Unikal tashrif",
      value: kpis ? formatCompact(kpis.views) : "—",
      bg: "#ECFDF5",
      color: "#059669",
    },
    {
      label: "Konversiya",
      value: kpis ? `${kpis.conversion}%` : "—",
      bg: "#FFFBEB",
      color: "#D97706",
    },
    {
      label: "O'rtacha chek",
      value: kpis ? formatPrice(kpis.avgOrderValue) : "—",
      bg: "#F5F3FF",
      color: "#7C3AED",
    },
  ];

  return (
    <div className="max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>Analitika</h1>
          <p className="text-sm text-gray-400 mt-0.5">Savdo va foydalanuvchi statistikasi</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(
            [
              { label: "Hafta", value: "week" as Period },
              { label: "Oy", value: "month" as Period },
              { label: "Yil", value: "year" as Period },
            ]
          ).map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setPeriod(t.value)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                period === t.value ? "bg-white text-[#00A86B] font-semibold shadow-sm" : "text-gray-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !data ? (
        <div className="py-16 text-center text-gray-400">Yuklanmoqda...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((m) => (
              <div key={m.label} className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: "var(--border)" }}>
                <div className="w-8 h-8 rounded-xl mb-3 opacity-20" style={{ background: m.color }} />
                <p className="text-2xl font-black text-gray-900 font-mono">{m.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-bold text-gray-900 mb-4">Daromad grafigi</h2>
            {!data?.series?.length ? (
              <div className="h-[300px] flex items-center justify-center text-sm text-gray-400">Ma'lumot yo'q</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.series} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D97706" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} width={38} />
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 12, fontSize: 12 }} formatter={(v) => [formatPrice(Number(v)), "Daromad"]} />
                  <Area type="monotone" dataKey="revenue" stroke="#D97706" strokeWidth={2.5} fill="url(#analyticsGrad)" dot={false} activeDot={{ r: 5, fill: "#D97706" }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
