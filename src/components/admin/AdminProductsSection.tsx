import { useEffect, useState } from "react";
import { formatPrice } from "../../lib/format";
import Modal from "../Modal";
import { adminApi } from "../../lib/api";
import type { Product } from "../../lib/api/types";

type ModerationStatus = "pending" | "approved" | "rejected";

const STATUS_UI: Record<ModerationStatus, { label: string; className: string }> = {
  pending: { label: "Kutilmoqda", className: "bg-amber-50 text-amber-600" },
  approved: { label: "Tasdiqlangan", className: "bg-green-50 text-green-600" },
  rejected: { label: "Rad etilgan", className: "bg-red-50 text-red-500" },
};

export default function AdminProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveProduct, setApproveProduct] = useState<Product | null>(null);
  const [rejectProduct, setRejectProduct] = useState<Product | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await adminApi.products({ limit: "100" });
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const pendingCount = products.filter((p) => p.moderationStatus === "pending").length;

  const handleConfirmApprove = async () => {
    if (!approveProduct) return;
    await adminApi.moderateProduct(approveProduct.id, "approve");
    setApproveProduct(null);
    await load();
  };

  const handleConfirmReject = async () => {
    if (!rejectProduct) return;
    await adminApi.moderateProduct(rejectProduct.id, "reject");
    setRejectProduct(null);
    await load();
  };

  return (
    <>
      <div className="max-w-[1400px]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>
              Mahsulotlar moderatsiyasi
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Tasdiqlanmagan va shubhali mahsulotlar</p>
          </div>
          <span className="bg-orange-50 text-orange-600 font-bold text-sm px-3 py-1.5 rounded-xl border border-orange-100">
            {pendingCount} kutilmoqda
          </span>
        </div>
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "#E2E6F0" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/60 border-b" style={{ borderColor: "#E2E6F0" }}>
                  {["Mahsulot", "Sotuvchi", "Kategoriya", "Narxi", "Ko'rishlar", "Holat", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : (
                  products.map((p, idx) => {
                    const status = STATUS_UI[(p.moderationStatus as ModerationStatus) || "pending"];
                    return (
                      <tr
                        key={p.id}
                        className={`border-b hover:bg-amber-50/20 transition-colors ${idx % 2 !== 0 ? "bg-gray-50/20" : ""}`}
                        style={{ borderColor: "#E2E6F0" }}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img src={p.image || ""} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                            <p className="font-semibold text-xs text-gray-900 max-w-[180px] truncate">{p.name}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-gray-600">{p.seller?.name}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-600">{p.category}</td>
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#00A86B]">{formatPrice(p.price)}</td>
                        <td className="px-5 py-3.5 text-xs text-gray-500">{p.views || 0}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {p.moderationStatus === "pending" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setApproveProduct(p)}
                                className="text-xs font-semibold text-green-600 hover:underline"
                              >
                                Tasdiqlash
                              </button>
                              <button
                                onClick={() => setRejectProduct(p)}
                                className="text-xs font-semibold text-red-500 hover:underline"
                              >
                                Rad etish
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={!!approveProduct} onClose={() => setApproveProduct(null)} title="Mahsulotni tasdiqlash?">
        <p className="text-sm text-gray-600 mb-4">{approveProduct?.name}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setApproveProduct(null)} className="px-4 py-2 rounded-xl border text-sm">
            Bekor
          </button>
          <button onClick={() => void handleConfirmApprove()} className="px-4 py-2 rounded-xl bg-[#00A86B] text-white text-sm font-semibold">
            Tasdiqlash
          </button>
        </div>
      </Modal>

      <Modal open={!!rejectProduct} onClose={() => setRejectProduct(null)} title="Mahsulotni rad etish?">
        <p className="text-sm text-gray-600 mb-4">{rejectProduct?.name}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => setRejectProduct(null)} className="px-4 py-2 rounded-xl border text-sm">
            Bekor
          </button>
          <button onClick={() => void handleConfirmReject()} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold">
            Rad etish
          </button>
        </div>
      </Modal>
    </>
  );
}
