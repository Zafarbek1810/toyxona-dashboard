import { useEffect, useState } from "react";
import { specialistApi } from "../../lib/api";
import type { Review } from "../../lib/api/types";

export default function SpecialistReviewsSection() {
  const [rows, setRows] = useState<Review[]>([]);
  const [reply, setReply] = useState<Record<number, string>>({});

  const load = async () => {
    try {
      setRows(await specialistApi.reviews());
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-black text-gray-900">Sharhlar</h1>
      {rows.map((review) => (
        <article key={review.id} className="bg-white rounded-2xl border p-4 space-y-2" style={{ borderColor: "var(--border)" }}>
          <p className="font-semibold">{review.name} · {review.rating}/5</p>
          <p className="text-sm text-gray-600">{review.text}</p>
          {review.reply ? <p className="text-sm text-[#008F5A]">Javob: {review.reply}</p> : (
            <div className="flex gap-2">
              <input value={reply[review.id] || ""} onChange={(e) => setReply({ ...reply, [review.id]: e.target.value })} className="flex-1 rounded-xl border px-3 py-2 text-sm" style={{ borderColor: "var(--border)" }} placeholder="Javob" />
              <button type="button" className="rounded-xl bg-[#063528] text-white text-sm px-3" onClick={() => specialistApi.replyReview(review.id, reply[review.id] || "").then(load)}>Yuborish</button>
            </div>
          )}
        </article>
      ))}
      {!rows.length && <p className="text-sm text-gray-400">Sharh yo&apos;q.</p>}
    </div>
  );
}
