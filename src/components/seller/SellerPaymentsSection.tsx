import { useEffect, useState } from "react";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { sellerApi } from "../../lib/api";
import {
  formatCompact,
  formatDateShort,
  formatPrice,
  METHOD_LABEL,
  PAYMENT_STATUS_UZ,
  PAYMENT_TYPE_UZ,
} from "../../lib/format";
import { paths } from "../../routes/paths";

type PaymentRow = {
  id: number;
  transactionId: string;
  description?: string;
  method: string;
  amount: number;
  status: string;
  type: string;
  date?: string;
  createdAt?: string;
};

type PaymentsData = {
  kpis: {
    totalRevenue: number;
    thisMonth: number;
    pending: number;
    refunded: number;
  };
  payments: PaymentRow[];
};

function statusClass(status: string) {
  if (status === "confirmed") return "bg-green-50 text-green-600";
  if (status === "pending") return "bg-amber-50 text-amber-600";
  if (status === "refunded") return "bg-red-50 text-red-500";
  if (status === "failed") return "bg-red-50 text-red-500";
  return "bg-blue-50 text-blue-600";
}

export default function SellerPaymentsSection() {
  const navigate = useAppNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaymentsData | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = (await sellerApi.payments()) as PaymentsData;
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
  }, []);

  const kpis = data?.kpis;
  const cards = [
    { label: "Jami daromad", value: kpis ? `${formatCompact(kpis.totalRevenue)} so'm` : "—", icon: "💰", color: "#10B981", bg: "#ECFDF5" },
    { label: "Bu oy", value: kpis ? `${formatCompact(kpis.thisMonth)} so'm` : "—", icon: "📅", color: "#00A86B", bg: "#E8F8F1" },
    { label: "Kutilayotgan", value: kpis ? `${formatCompact(kpis.pending)} so'm` : "—", icon: "⏳", color: "#D97706", bg: "#FFFBEB" },
    { label: "Qaytarilgan", value: kpis ? `${formatCompact(kpis.refunded)} so'm` : "—", icon: "↩️", color: "#EF4444", bg: "#FEF2F2" },
  ];

  const payments = data?.payments || [];

  return (
    <div className="max-w-[1400px] space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>To'lovlar</h1>
          <p className="text-sm text-gray-400 mt-0.5">Daromad va to'lov tarixi</p>
        </div>
        <button
          type="button"
          onClick={() => navigate(paths.seller.paymentsCheckout)}
          className="bg-[#00A86B] hover:bg-[#008F5A] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          To'lov qilish
        </button>
      </div>

      {loading && !data ? (
        <div className="py-16 text-center text-gray-400">Yuklanmoqda...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border p-4 shadow-sm relative overflow-hidden" style={{ borderColor: "var(--border)" }}>
                <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 -translate-y-4 translate-x-4" style={{ background: s.color }} />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: s.bg }}>{s.icon}</div>
                <p className="text-xl font-black font-mono text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "var(--border)" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <h2 className="font-bold text-gray-900 text-sm">To'lov tarixi</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/60 border-b" style={{ borderColor: "var(--border)" }}>
                    {["Sana", "Tavsif", "To'lov usuli", "Miqdor", "Holat"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-gray-400">To'lovlar yo'q</td>
                    </tr>
                  ) : (
                    payments.map((row) => {
                      const pos = row.type === "sale" || row.type === "topup";
                      const amountColor = row.type === "refund" || row.status === "refunded" ? "#EF4444" : pos ? "#10B981" : "#EF4444";
                      return (
                        <tr key={row.id} className="border-b hover:bg-gray-50/40 transition-colors" style={{ borderColor: "var(--border)" }}>
                          <td className="px-5 py-3.5 text-xs text-gray-500">{formatDateShort(row.date || row.createdAt)}</td>
                          <td className="px-5 py-3.5 text-xs font-medium text-gray-800">
                            {row.description || PAYMENT_TYPE_UZ[row.type] || row.type}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-lg">
                              {METHOD_LABEL[row.method] || row.method}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-mono font-bold text-xs" style={{ color: amountColor }}>
                            {pos && row.type !== "refund" ? "+" : "-"}
                            {formatPrice(row.amount).replace(" so'm", "")} so'm
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusClass(row.status)}`}>
                              {PAYMENT_STATUS_UZ[row.status] || row.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
