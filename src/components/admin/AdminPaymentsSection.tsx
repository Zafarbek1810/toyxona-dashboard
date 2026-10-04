import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";
import {
  formatCompact,
  formatDateShort,
  formatPrice,
  getStatusColor,
  METHOD_LABEL,
  PAYMENT_STATUS_UZ,
  PAYMENT_TYPE_UZ,
} from "../../lib/format";

type PaymentKpis = {
  gmv: number;
  commission: number;
  refunds: number;
  commissionPct: number;
};

type Payment = {
  id?: number;
  transactionId: string;
  type: string;
  amount: number;
  method: string;
  status: string;
  description?: string;
  date?: string;
  sellerId?: number;
  sellerName?: string;
};

export default function AdminPaymentsSection() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<PaymentKpis | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = (await adminApi.payments()) as { kpis: PaymentKpis; payments: Payment[] };
        if (!cancelled) {
          setKpis(data.kpis);
          setPayments(data.payments || []);
        }
      } catch {
        if (!cancelled) {
          setKpis(null);
          setPayments([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const net = kpis ? kpis.commission - kpis.refunds : 0;

  const cards = kpis
    ? [
        { label: "Jami tushum", value: formatCompact(kpis.gmv), color: "#10B981" },
        { label: "Komissiya", value: formatCompact(kpis.commission), color: "#D97706" },
        { label: "Qaytarilgan", value: formatCompact(kpis.refunds), color: "#EF4444" },
        { label: "Sof daromad", value: formatCompact(net), color: "#3B82F6" },
      ]
    : [];

  return (
    <div className="max-w-[1400px] space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>{"To'lovlar va moliya"}</h1>
        <p className="text-sm text-gray-400 mt-0.5">Platforma moliyaviy hisoboti</p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-10 text-center">Yuklanmoqda...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(s => (
              <div key={s.label} className="bg-white rounded-2xl border p-4 shadow-sm" style={{ borderColor: "#E2E6F0" }}>
                <div className="w-2 h-2 rounded-full mb-3" style={{ background: s.color }}></div>
                <p className="text-xl font-black font-mono text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                {s.label === "Komissiya" && kpis && (
                  <p className="text-xs font-bold mt-1 text-gray-500">{kpis.commissionPct}%</p>
                )}
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#E2E6F0" }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "#E2E6F0" }}>
              <h2 className="font-bold text-gray-900 text-sm">{"So'nggi tranzaksiyalar"}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/60 border-b" style={{ borderColor: "#E2E6F0" }}>
                    {["ID", "Tavsif", "Tur", "Miqdor", "To'lov usuli", "Sana", "Holat"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                        Tranzaksiyalar topilmadi
                      </td>
                    </tr>
                  ) : (
                    payments.map((p, idx) => (
                      <tr key={p.transactionId || idx} className={`border-b hover:bg-gray-50/40 transition-colors ${idx % 2 !== 0 ? "bg-gray-50/20" : ""}`} style={{ borderColor: "#E2E6F0" }}>
                        <td className="px-5 py-3.5 font-mono text-xs text-blue-600 font-bold">{p.transactionId}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-700 font-medium max-w-[180px] truncate">{p.description || "—"}</td>
                        <td className="px-5 py-3.5">
                          <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-lg font-medium">
                            {PAYMENT_TYPE_UZ[p.type] || p.type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-bold text-xs text-gray-900">{formatPrice(p.amount)}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">{METHOD_LABEL[p.method] || p.method}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-400">{formatDateShort(p.date)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(p.status)}`}>
                            {PAYMENT_STATUS_UZ[p.status] || p.status}
                          </span>
                        </td>
                      </tr>
                    ))
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
