import { useEffect, useMemo, useState } from "react";
import { sellerApi } from "../../lib/api";
import { formatDateShort } from "../../lib/format";

type Review = {
  id: number;
  rating: number;
  comment?: string;
  text?: string;
  authorName?: string;
  product?: { name?: string } | null;
  sellerReply?: string | null;
  replied?: boolean;
  date?: string;
  createdAt?: string;
};

export default function SellerReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = (await sellerApi.reviews()) as Review[];
        if (!cancelled) setReviews(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setReviews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { average, histogram, count } = useMemo(() => {
    const count = reviews.length;
    if (!count) {
      return {
        average: 0,
        histogram: [5, 4, 3, 2, 1].map((stars) => ({ stars, pct: 0 })),
        count: 0,
      };
    }
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    const buckets: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 0)));
      buckets[star] += 1;
    }
    return {
      average: Math.round((sum / count) * 10) / 10,
      histogram: [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        pct: Math.round((buckets[stars] / count) * 100),
      })),
      count,
    };
  }, [reviews]);

  const submitReply = async (id: number) => {
    if (!replyText.trim()) return;
    setSaving(true);
    try {
      const updated = (await sellerApi.replyReview(id, replyText.trim())) as Review;
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      setReplyingId(null);
      setReplyText("");
    } catch {
      /* keep form open */
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl py-16 text-center text-gray-400">Yuklanmoqda...</div>;
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>Sharhlar</h1>
          <p className="text-sm text-gray-400 mt-0.5">Mijozlar fikr-mulohazalari</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border p-5 shadow-sm flex gap-8" style={{ borderColor: "var(--border)" }}>
        <div className="text-center shrink-0">
          <p className="text-5xl font-black text-gray-900 font-mono">{average.toFixed(1)}</p>
          <div className="flex justify-center gap-0.5 my-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} className={`w-5 h-5 ${i <= Math.round(average) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-xs text-gray-400">{count} ta sharh</p>
        </div>
        <div className="flex-1 space-y-2">
          {histogram.map((r) => (
            <div key={r.stars} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-4 text-right">{r.stars}</span>
              <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-amber-400" style={{ width: `${r.pct}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-8">{r.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border p-10 text-center text-gray-400" style={{ borderColor: "var(--border)" }}>
            Sharhlar yo'q
          </div>
        ) : (
          reviews.map((r) => {
            const name = r.authorName || "Mijoz";
            const avatar = name.charAt(0).toUpperCase();
            const text = r.comment || r.text || "";
            const replied = r.replied || Boolean(r.sellerReply);
            return (
              <div key={r.id} className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00A86B] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-900">{name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <svg key={i} className={`w-3 h-3 ${i <= r.rating ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400 ml-auto">{formatDateShort(r.date || r.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      Mahsulot: <span className="text-[#00A86B] font-medium">{r.product?.name || "—"}</span>
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
                    {replied ? (
                      <div className="mt-3 bg-[#E8F8F1] rounded-xl p-3 border-l-2 border-[#00A86B]">
                        <p className="text-xs font-bold text-[#00A86B] mb-1">Sotuvchi javobi:</p>
                        <p className="text-xs text-gray-600">{r.sellerReply}</p>
                      </div>
                    ) : replyingId === r.id ? (
                      <div className="mt-3 space-y-2">
                        <textarea
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Javobingizni yozing..."
                          className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B] resize-none"
                          style={{ borderColor: "var(--border)" }}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => submitReply(r.id)}
                            className="text-xs bg-[#00A86B] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#008F5A] disabled:opacity-60"
                          >
                            {saving ? "Yuborilmoqda..." : "Yuborish"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingId(null);
                              setReplyText("");
                            }}
                            className="text-xs border text-gray-500 px-3 py-1.5 rounded-lg font-medium"
                            style={{ borderColor: "var(--border)" }}
                          >
                            Bekor
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingId(r.id);
                          setReplyText("");
                        }}
                        className="mt-3 text-xs border text-[#00A86B] border-[#00A86B]/30 px-3 py-1.5 rounded-lg hover:bg-[#E8F8F1] font-medium transition-colors"
                      >
                        Javob berish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
