import { useEffect, useState } from "react";
import { formatPrice } from "../../lib/format";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { useAppContext } from "../../context/AppContext";
import { sellerApi } from "../../lib/api";
import { mediaUrl } from "../../lib/api/client";
import type { Product } from "../../lib/api/types";
import { paths } from "../../routes/paths";
import Modal from "../Modal";

export default function SellerProductsSection() {
  const navigate = useAppNavigate();
  const { showToast } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const loadProducts = async (query?: string) => {
    setLoading(true);
    try {
      const list = await sellerApi.products({ q: query || undefined });
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await sellerApi.products({ q: q || undefined });
        if (!cancelled) setProducts(list);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q]);

  const handleActivate = async (product: Product) => {
    setActivatingId(product.id);
    try {
      await sellerApi.setProductStatus(product.id, "active");
      showToast("Mahsulot aktivlashtirildi");
      await loadProducts(q);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Aktivlashtirishda xatolik", "error");
    } finally {
      setActivatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await sellerApi.deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      if (result.softDeleted) {
        showToast("Mahsulotda buyurtmalar bor — arxivlandi");
      } else {
        showToast("Mahsulot o'chirildi");
      }
      await loadProducts(q);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "O'chirishda xatolik", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-[1400px] space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>
            Mahsulotlarim
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} ta mahsulot</p>
        </div>
        <button
          onClick={() => navigate(paths.seller.productsNew)}
          className="bg-[#00A86B] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#008F5A]"
        >
          + Yangi mahsulot
        </button>
      </div>

      <div className="bg-white rounded-2xl border p-4 flex gap-3" style={{ borderColor: "var(--border)" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Qidirish..."
          className="flex-1 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#00A86B]"
          style={{ borderColor: "var(--border)" }}
        />
        <span className="ml-auto text-sm text-gray-400 self-center">{products.length} ta natija</span>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b" style={{ borderColor: "var(--border)" }}>
                {["Mahsulot", "Narx", "Ombor", "Holat", "Ko'rishlar", "Buyurtmalar", "Amallar"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase">
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
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                    Mahsulot yo'q
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50" style={{ borderColor: "var(--border)" }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={mediaUrl(p.image) || ""} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-semibold text-xs text-gray-900 max-w-[220px] truncate">{p.name}</p>
                          <p className="text-[11px] text-gray-400">
                            {[p.category, p.subCategory].filter(Boolean).join(" / ")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs font-bold text-[#00A86B]">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3 text-xs">{p.stock}</td>
                    <td className="px-5 py-3 text-xs">
                      <span className={`inline-flex px-2.5 py-1 rounded-full font-medium ${
                        p.status === "active"
                          ? "bg-green-50 text-green-600"
                          : p.status === "draft"
                            ? "bg-amber-50 text-amber-700"
                            : p.status === "archived"
                              ? "bg-red-50 text-red-500"
                              : "bg-gray-100 text-gray-500"
                      }`}>
                        {p.statusLabel || p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{p.views || 0}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">{p.orders || 0}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {p.status === "draft" && (
                          <button
                            type="button"
                            disabled={activatingId === p.id}
                            onClick={() => void handleActivate(p)}
                            className="h-8 px-2.5 rounded-lg border border-[#00A86B]/40 bg-[#E8F8F1] text-[#00A86B] text-[11px] font-semibold hover:bg-[#00A86B] hover:text-white disabled:opacity-60 whitespace-nowrap"
                            title="Aktivlashtirish"
                          >
                            {activatingId === p.id ? "..." : "Aktivlashtirish"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(paths.seller.productsEdit(p.id))}
                          className="w-8 h-8 rounded-lg border flex items-center justify-center text-gray-500 hover:bg-[#E8F8F1] hover:text-[#00A86B] hover:border-[#00A86B]/40 transition-colors"
                          style={{ borderColor: "var(--border)" }}
                          aria-label="Tahrirlash"
                          title="Tahrirlash"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          className="w-8 h-8 rounded-lg border flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                          style={{ borderColor: "var(--border)" }}
                          aria-label="O'chirish"
                          title="O'chirish"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Mahsulotni o'chirish"
        description="Bu amalni bekor qilib bo'lmaydi"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
              className="px-5 py-2.5 rounded-xl border text-gray-600 font-semibold text-sm hover:bg-gray-50 disabled:opacity-60"
              style={{ borderColor: "#E2E6F0" }}
            >
              Bekor qilish
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => void handleConfirmDelete()}
              className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shadow-sm disabled:opacity-60"
            >
              {deleting ? "O'chirilmoqda..." : "O'chirish"}
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="flex items-start gap-3">
            <img
              src={mediaUrl(deleteTarget.image) || ""}
              alt=""
              className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-100"
            />
            <div>
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">{deleteTarget.name}</span> mahsulotini
                {" o'chirmoqchimisiz?"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatPrice(deleteTarget.price)} · {deleteTarget.orders || 0} ta buyurtma
              </p>
              {(deleteTarget.orders || 0) > 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  Buyurtmalar bor — mahsulot to'liq o'chirilmaydi, arxivlanadi.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
