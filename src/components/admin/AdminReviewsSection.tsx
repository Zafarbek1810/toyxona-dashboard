import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";
import type { Review } from "../../lib/api/types";

export default function AdminReviewsSection() {
  const [rows, setRows] = useState<Review[]>([]);

  const load = async () => {
    try {
      setRows(await adminApi.reviews());
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="max-w-[900px] space-y-4">
      <div>
        <h1 className="text-xl font-black text-gray-900">Sharhlar</h1>
        <p className="text-sm text-gray-400">{rows.length} ta</p>
      </div>
      <div className="space-y-3">
        {rows.map((review) => (
          <article key={review.id} className="bg-white rounded-2xl border p-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">{review.name}</p>
                <p className="text-xs text-gray-400">{review.venueName || review.specialistName} · {review.rating}/5</p>
              </div>
              <button type="button" className="text-xs text-red-500" onClick={() => adminApi.deleteReview(review.id).then(load)}>O&apos;chirish</button>
            </div>
            <p className="text-sm text-gray-600 mt-2">{review.text}</p>
          </article>
        ))}
        {!rows.length && <p className="text-sm text-gray-400">Hali sharh yo&apos;q.</p>}
      </div>
    </div>
  );
}
