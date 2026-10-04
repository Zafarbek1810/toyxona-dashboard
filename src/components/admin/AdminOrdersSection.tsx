import { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import { adminApi } from "../../lib/api";
import type { Order } from "../../lib/api/types";
import { formatDateShort, formatPrice, getStatusColor, METHOD_LABEL } from "../../lib/format";

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "new", label: "Yangi" },
  { key: "preparing", label: "Tayyorlanmoqda" },
  { key: "shipping", label: "Yetkazilmoqda" },
  { key: "delivered", label: "Yetkazildi" },
  { key: "cancelled", label: "Bekor qilindi" },
];

function productLabel(o: Order): string {
  if (o.product?.name) return o.product.name;
  if (o.items?.length) return o.items.map(i => i.name).join(", ");
  return "—";
}

function quantityOf(o: Order): number {
  if (o.items?.length) return o.items.reduce((s, i) => s + (i.quantity || 1), 0);
  return 1;
}

export default function AdminOrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const load = async (status?: string) => {
    setLoading(true);
    try {
      const query: Record<string, string> = { limit: "100" };
      if (status && status !== "all") query.status = status;
      const list = await adminApi.orders(query);
      setOrders(list);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(tab);
  }, [tab]);

  const stats = useMemo(() => {
    const delivered = orders.filter(o => o.status === "delivered").length;
    const inProgress = orders.filter(o =>
      ["new", "confirmed", "preparing", "shipping"].includes(String(o.status)),
    ).length;
    const cancelled = orders.filter(o => o.status === "cancelled").length;
    return [
      { label: "Jami buyurtmalar", value: String(orders.length), color: "#00A86B" },
      { label: "Yetkazildi", value: String(delivered), color: "#10B981" },
      { label: "Jarayonda", value: String(inProgress), color: "#D97706" },
      { label: "Bekor qilindi", value: String(cancelled), color: "#EF4444" },
    ];
  }, [orders]);

  return (
    <>
      <div className="max-w-[1400px] space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>
              Barcha buyurtmalar
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{orders.length} ta buyurtma</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
              <div className="w-2 h-2 rounded-full mb-3" style={{ background: s.color }} />
              <p className="text-xl font-black font-mono text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_TABS.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium shrink-0 transition-all ${
                tab === t.key
                  ? "bg-[#00A86B] text-white shadow-md"
                  : "bg-white border text-gray-600 hover:border-[#00A86B] hover:text-[#00A86B]"
              }`}
              style={tab !== t.key ? { borderColor: "#E2E6F0" } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#E2E6F0" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/60 border-b" style={{ borderColor: "#E2E6F0" }}>
                {["Buyurtma ID", "Mijoz", "Sotuvchi", "Mahsulot", "Summa", "To'lov", "Sana", "Holat", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    Buyurtmalar topilmadi
                  </td>
                </tr>
              ) : (
                orders.map(o => {
                  const statusLabel = o.statusLabel || o.status;
                  return (
                    <tr key={o.id} className="border-b hover:bg-gray-50/40 transition-colors" style={{ borderColor: "#E2E6F0" }}>
                      <td className="px-4 py-3.5 font-mono text-xs text-blue-600 font-bold">{o.orderNumber}</td>
                      <td className="px-4 py-3.5 text-xs font-medium text-gray-800">{o.customer?.name || o.recipientName || "—"}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">{o.seller?.name || "—"}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-700 max-w-[140px] truncate">{productLabel(o)}</td>
                      <td className="px-4 py-3.5 font-mono font-bold text-xs text-gray-900">{formatPrice(o.total)}</td>
                      <td className="px-4 py-3.5">
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-lg">
                          {METHOD_LABEL[o.paymentMethod] || o.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">{formatDateShort(o.date || o.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatusColor(String(statusLabel))}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => setViewOrder(o)}
                          className="text-xs border text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium"
                          style={{ borderColor: "#E2E6F0" }}
                        >
                          {"Ko'rish"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <div className="px-5 py-4 border-t flex items-center justify-between" style={{ borderColor: "#E2E6F0" }}>
            <span className="text-xs text-gray-400">
              {orders.length === 0 ? "0" : `1–${orders.length}`} / {orders.length} ta
            </span>
          </div>
        </div>
      </div>

      <Modal
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title="Buyurtma tafsilotlari"
        description={viewOrder?.orderNumber}
        maxWidth="max-w-lg"
        footer={
          <button
            type="button"
            onClick={() => setViewOrder(null)}
            className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold text-sm hover:bg-gray-50"
            style={{ borderColor: "#E2E6F0" }}
          >
            Yopish
          </button>
        }
      >
        {viewOrder && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-bold text-blue-600">{viewOrder.orderNumber}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(viewOrder.date || viewOrder.createdAt)}</p>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatusColor(String(viewOrder.statusLabel || viewOrder.status))}`}>
                {viewOrder.statusLabel || viewOrder.status}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">Mahsulot</p>
              <div className="rounded-xl bg-gray-50 px-3.5 py-3">
                <p className="text-sm font-semibold text-gray-900">{productLabel(viewOrder)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {quantityOf(viewOrder)} dona · {viewOrder.seller?.name || "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Mijoz", value: viewOrder.customer?.name || viewOrder.recipientName || "—" },
                { label: "Telefon", value: viewOrder.customer?.phone || viewOrder.recipientPhone || "—" },
                { label: "Email", value: viewOrder.customer?.email || "—" },
                { label: "Sotuvchi", value: viewOrder.seller?.name || "—" },
                { label: "To'lov", value: METHOD_LABEL[viewOrder.paymentMethod] || viewOrder.paymentMethod },
                { label: "Summa", value: formatPrice(viewOrder.total) },
              ].map(item => (
                <div key={item.label} className="rounded-xl bg-gray-50 px-3.5 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-1 break-all">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-gray-50 px-3.5 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Yetkazish manzili</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{viewOrder.address}</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
