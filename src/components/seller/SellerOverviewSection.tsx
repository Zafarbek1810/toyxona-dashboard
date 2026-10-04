import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { useAppContext } from "../../context/AppContext";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { sellerApi } from "../../lib/api";
import { mediaUrl } from "../../lib/api/client";
import type { Order } from "../../lib/api/types";
import { formatCompact, formatPrice, getStatusColor } from "../../lib/format";
import { paths } from "../../routes/paths";

type Period = "week" | "month" | "year";

type AnalyticsKpis = {
  revenue: number;
  orders: number;
  views: number;
  avgOrderValue: number;
  conversion: number;
};

type SeriesPoint = { month: string; revenue: number; orders: number };
type LowStockItem = { id: number; name: string; stock: number; image?: string | null };

const PERIOD_TABS: { label: string; value: Period }[] = [
  { label: "Hafta", value: "week" },
  { label: "Oy", value: "month" },
  { label: "Yil", value: "year" },
];

const STATUS_UZ: Record<string, string> = {
  new: "Yangi",
  confirmed: "Tasdiqlangan",
  preparing: "Tayyorlanmoqda",
  shipping: "Yetkazilmoqda",
  delivered: "Yetkazildi",
  cancelled: "Bekor qilindi",
};

function normalizeOrder(raw: Record<string, unknown>): Order {
  const items = (raw.items as Array<Record<string, unknown>>) || [];
  const first = items[0];
  const customerRaw = raw.customer as Record<string, unknown> | undefined;
  const productRaw = raw.product as Order["product"] | undefined;

  return {
    id: Number(raw.id),
    orderNumber: String(raw.orderNumber || raw.id || ""),
    status: String(raw.status || ""),
    statusLabel: String(raw.statusLabel || STATUS_UZ[String(raw.status)] || raw.status || ""),
    total: Number(raw.total ?? raw.price ?? 0),
    price: Number(raw.price ?? raw.total ?? 0),
    paymentMethod: String(raw.paymentMethod || ""),
    address: String(raw.address || ""),
    date: (raw.date || raw.createdAt) as string | undefined,
    createdAt: raw.createdAt as string | undefined,
    product: productRaw || (first
      ? {
          id: Number(first.productId || first.id || 0),
          name: String(first.name || ""),
          image: (first.image as string) || null,
          price: Number(first.unitPrice || first.price || 0),
        }
      : undefined),
    customer: customerRaw
      ? {
          id: Number(customerRaw.id || 0),
          name: String(
            customerRaw.name ||
              `${customerRaw.firstName || ""} ${customerRaw.lastName || ""}`.trim() ||
              "Mijoz",
          ),
          phone: String(customerRaw.phone || ""),
          email: (customerRaw.email as string) || null,
        }
      : undefined,
  };
}

export default function SellerOverviewSection() {
  const navigate = useAppNavigate();
  const { user } = useAppContext();
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<AnalyticsKpis | null>(null);
  const [series, setSeries] = useState<SeriesPoint[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [overview, analytics] = await Promise.all([
          sellerApi.overview() as Promise<{
            kpis?: Record<string, number>;
            recentOrders?: Record<string, unknown>[];
          }>,
          sellerApi.analytics(period) as Promise<{
            kpis?: AnalyticsKpis;
            series?: SeriesPoint[];
            lowStock?: LowStockItem[];
          }>,
        ]);
        if (cancelled) return;
        setKpis(analytics.kpis || null);
        setSeries(analytics.series || []);
        setLowStock(analytics.lowStock || []);
        setRecentOrders((overview.recentOrders || []).map(normalizeOrder));
      } catch {
        if (!cancelled) {
          setKpis(null);
          setSeries([]);
          setLowStock([]);
          setRecentOrders([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const sellerName = user?.seller?.name || user?.firstName || "Sotuvchi";

  const kpiCards = [
    {
      label: "Jami savdo",
      value: kpis ? formatCompact(kpis.revenue) : "—",
      suffix: " so'm",
      icon: "💰",
      bg: "#E8F8F1",
      accent: "#00A86B",
    },
    {
      label: "Buyurtmalar",
      value: kpis ? String(kpis.orders) : "—",
      icon: "📦",
      bg: "#ECFDF5",
      accent: "#059669",
    },
    {
      label: "Ko'rishlar",
      value: kpis ? formatCompact(kpis.views) : "—",
      icon: "👁️",
      bg: "#F5F3FF",
      accent: "#7C3AED",
    },
    {
      label: "Konversiya",
      value: kpis ? `${kpis.conversion}%` : "—",
      icon: "📈",
      bg: "#FFFBEB",
      accent: "#D97706",
    },
  ];

  if (loading && !kpis) {
    return (
      <div className="max-w-[1400px] py-16 text-center text-gray-400">Yuklanmoqda...</div>
    );
  }

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>
            Xush kelibsiz, {sellerName}!
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Bu oy savdo ko'rsatkichlari</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="bg-white border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B] shadow-sm"
            style={{ borderColor: "var(--border)" }}
          >
            <option value="week">Bu hafta</option>
            <option value="month">Bu oy</option>
            <option value="year">Bu yil</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((k) => (
          <div key={k.label} className="bg-white rounded-2xl p-4 shadow-sm border relative overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-8 translate-x-8" style={{ background: k.accent }} />
            <div className="flex items-start justify-between mb-4">
              <span className="text-2xl">{k.icon}</span>
            </div>
            <p className="text-2xl font-black text-gray-900 font-mono leading-tight">{k.value}</p>
            {k.suffix && <p className="text-xs text-gray-400">{k.suffix}</p>}
            <p className="text-xs text-gray-500 mt-1">{k.label}</p>
            <div className="mt-3 h-1 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full" style={{ background: k.accent, width: "72%" }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900">Savdo dinamikasi</h2>
              <p className="text-xs text-gray-400 mt-0.5">Davr bo'yicha ko'rsatkichlar</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {PERIOD_TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setPeriod(t.value)}
                  className={`text-xs px-3 py-1 rounded-md transition-all ${
                    period === t.value ? "bg-white text-[#00A86B] font-semibold shadow-sm" : "text-gray-500"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          {series.length === 0 ? (
            <div className="h-[210px] flex items-center justify-center text-sm text-gray-400">Ma'lumot yo'q</div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={series} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sellerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00A86B" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#00A86B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} width={38} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
                  formatter={(v) => [formatPrice(Number(v)), "Daromad"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00A86B" strokeWidth={2.5} fill="url(#sellerGrad)" dot={false} activeDot={{ r: 5, fill: "#00A86B" }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-gray-900">Buyurtmalar</h2>
              <p className="text-xs text-gray-400 mt-0.5">Davr bo'yicha</p>
            </div>
          </div>
          {series.length === 0 ? (
            <div className="h-[210px] flex items-center justify-center text-sm text-gray-400">Ma'lumot yo'q</div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={series.slice(-6)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f8" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9AA3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E2E6F0", borderRadius: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
                  cursor={{ fill: "#F0F2F8" }}
                />
                <Bar dataKey="orders" fill="#D97706" radius={[6, 6, 0, 0]} name="Buyurtmalar" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-bold text-gray-900 text-sm">So'nggi buyurtmalar</h2>
            <button type="button" onClick={() => navigate(paths.seller.orders)} className="text-xs text-[#00A86B] font-semibold hover:underline">
              Barchasini ko'rish →
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {recentOrders.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">Buyurtma yo'q</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <img
                    src={mediaUrl(order.product?.image) || ""}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{order.product?.name || "Mahsulot"}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{order.orderNumber}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${getStatusColor(order.status)}`}>
                    {order.statusLabel || order.status}
                  </span>
                  <span className="font-mono font-bold text-xs text-gray-800 shrink-0">{formatPrice(order.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-bold text-gray-900 text-sm">Ombor holati</h2>
            {lowStock.length > 0 && (
              <span className="text-xs bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                {lowStock.length} ta kam
              </span>
            )}
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {lowStock.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-gray-400">Kam qolgan mahsulot yo'q</div>
            ) : (
              lowStock.map((p) => (
                <div key={p.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <img
                    src={mediaUrl(p.image) || ""}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            background: p.stock <= 5 ? "#EF4444" : p.stock <= 15 ? "#F59E0B" : "#10B981",
                            width: `${Math.min((p.stock / 50) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500">{p.stock} ta qoldi</span>
                    </div>
                  </div>
                  {p.stock <= 5 && (
                    <span className="text-[10px] bg-red-50 text-red-500 font-semibold px-2 py-0.5 rounded-full shrink-0">Kam!</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
