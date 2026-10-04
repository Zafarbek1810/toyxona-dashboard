import { useEffect, useMemo, useState } from "react";
import { sellerApi } from "../../lib/api";
import { mediaUrl } from "../../lib/api/client";
import type { Order, OrderStatus } from "../../lib/api/types";
import { formatDateShort, formatPrice, getStatusColor, METHOD_LABEL } from "../../lib/format";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "Barchasi", value: "" },
  { label: "Yangi", value: "new" },
  { label: "Tasdiqlangan", value: "confirmed" },
  { label: "Tayyorlanmoqda", value: "preparing" },
  { label: "Yetkazilmoqda", value: "shipping" },
  { label: "Yetkazildi", value: "delivered" },
  { label: "Bekor qilindi", value: "cancelled" },
];

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "new", label: "Yangi" },
  { value: "confirmed", label: "Tasdiqlangan" },
  { value: "preparing", label: "Tayyorlanmoqda" },
  { value: "shipping", label: "Yetkazilmoqda" },
  { value: "delivered", label: "Yetkazildi" },
  { value: "cancelled", label: "Bekor qilindi" },
];

export default function SellerOrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await sellerApi.orders();
        if (!cancelled) setOrders(list);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (tab ? orders.filter((o) => o.status === tab) : orders),
    [orders, tab],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      map[o.status] = (map[o.status] || 0) + 1;
    }
    return map;
  }, [orders]);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      const updated = await sellerApi.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch {
      /* keep previous */
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-[1400px]">
      <div className="mb-5">
        <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>Buyurtmalar</h1>
        <p className="text-sm text-gray-400 mt-0.5">{orders.length} ta buyurtma</p>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {STATUS_TABS.map((t) => {
          const active = tab === t.value;
          const count = t.value === "" ? orders.length : counts[t.value] || 0;
          return (
            <button
              key={t.value || "all"}
              type="button"
              onClick={() => setTab(t.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium shrink-0 transition-all ${
                active
                  ? "bg-[#00A86B] text-white shadow-md shadow-[#00A86B]/20"
                  : "bg-white border text-gray-600 hover:border-[#00A86B] hover:text-[#00A86B]"
              }`}
              style={!active ? { borderColor: "var(--border)" } : {}}
            >
              {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b" style={{ borderColor: "var(--border)" }}>
                {["Buyurtma", "Mahsulot", "Mijoz", "Miqdor", "To'lov", "Holat", "Sana", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400">Yuklanmoqda...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-gray-400">Buyurtma yo'q</td>
                </tr>
              ) : (
                filtered.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={`border-b hover:bg-blue-50/20 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/20"}`}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-5 py-4 font-mono text-xs text-blue-600 font-bold">{order.orderNumber}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={mediaUrl(order.product?.image || order.items?.[0]?.image) || ""}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover bg-gray-100"
                        />
                        <span className="text-xs font-medium truncate max-w-[130px]">
                          {order.product?.name || order.items?.[0]?.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      {order.customer?.name || order.recipientName || "—"}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-gray-900 text-xs">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-lg font-medium">
                        {METHOD_LABEL[order.paymentMethod] || order.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                        {order.statusLabel || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{formatDateShort(order.date || order.createdAt)}</td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="text-xs border text-gray-600 px-2 py-1.5 rounded-lg bg-white focus:outline-none focus:border-[#00A86B]"
                        style={{ borderColor: "var(--border)" }}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
