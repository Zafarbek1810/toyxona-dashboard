import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { adminApi } from "../../lib/api";
import { formatCompact, formatPrice } from "../../lib/format";

type AnalyticsKpis = {
  revenue: number;
  users: number;
  sellers: number;
  products: number;
  orders: number;
};

type SeriesPoint = {
  month: string;
  sellers: number;
  users: number;
  revenue: number;
  key?: string;
};

export default function AdminAnalyticsSection() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<AnalyticsKpis | null>(null);
  const [series, setSeries] = useState<SeriesPoint[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = (await adminApi.analytics()) as { kpis: AnalyticsKpis; series: SeriesPoint[] };
        if (!cancelled) {
          setKpis(data.kpis);
          setSeries(data.series || []);
        }
      } catch {
        if (!cancelled) {
          setKpis(null);
          setSeries([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1400px] py-16 text-center text-sm text-gray-400">
        Yuklanmoqda...
      </div>
    );
  }

  const kpiCards = kpis
    ? [
        { label: "Daromad", value: formatCompact(kpis.revenue), color: "#D97706" },
        { label: "Foydalanuvchilar", value: formatCompact(kpis.users), color: "#3B82F6" },
        { label: "Sotuvchilar", value: formatCompact(kpis.sellers), color: "#8B5CF6" },
        { label: "Mahsulotlar", value: formatCompact(kpis.products), color: "#F97316" },
        { label: "Buyurtmalar", value: formatCompact(kpis.orders), color: "#10B981" },
      ]
    : [];

  return (
    <div className="max-w-[1400px] space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>Platforma analitikasi</h1>
        <p className="text-sm text-gray-400 mt-0.5">{"Kengaytirilgan ko'rsatkichlar"}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {kpiCards.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
            <div className="w-2 h-2 rounded-full mb-3" style={{ background: s.color }} />
            <p className="text-xl font-black font-mono text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
          <h2 className="font-bold text-gray-900 mb-4">Daromad</h2>
          {series.length === 0 ? (
            <p className="text-sm text-gray-400 py-16 text-center">{"Ma'lumot yo'q"}</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={series} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D97706" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} width={40} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 12, fontSize: 12 }} formatter={(v) => [formatPrice(Number(v)), "Daromad"]} />
                <Area type="monotone" dataKey="revenue" stroke="#D97706" strokeWidth={2.5} fill="url(#analyRev)" dot={false} activeDot={{ r: 5, fill: "#D97706" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
          <h2 className="font-bold text-gray-900 mb-4">{"Foydalanuvchi o'sishi"}</h2>
          {series.length === 0 ? (
            <p className="text-sm text-gray-400 py-16 text-center">{"Ma'lumot yo'q"}</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={series} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "#3B82F6" }} name="Foydalanuvchilar" />
                <Line type="monotone" dataKey="sellers" stroke="#8B5CF6" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#8B5CF6" }} name="Sotuvchilar" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
