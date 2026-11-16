import { useEffect, useState } from "react";
import { ownerApi } from "../../lib/api";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { paths } from "../../routes/paths";
import { SESSIONS } from "../../lib/wedding";
import type { Booking } from "../../lib/api/types";

export default function SellerOverviewSection() {
  const navigate = useAppNavigate();
  const [kpis, setKpis] = useState({ venues: 0, bookings: 0, pending: 0, reviews: 0 });
  const [upcoming, setUpcoming] = useState<Booking[]>([]);

  useEffect(() => {
    ownerApi.overview().then((data) => {
      setKpis(data.kpis);
      setUpcoming(data.upcoming);
    }).catch(() => undefined);
  }, []);

  const cards = [
    { label: "To'yxonam", value: kpis.venues, path: paths.owner.venues },
    { label: "Bronlar", value: kpis.bookings, path: paths.owner.bookings },
    { label: "Kutilmoqda", value: kpis.pending, path: paths.owner.bookings },
    { label: "Sharhlar", value: kpis.reviews, path: paths.owner.reviews },
  ];

  return (
    <div className="max-w-[1100px] space-y-5">
      <h1 className="text-xl font-black text-gray-900">Boshqaruv</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <button key={card.label} type="button" onClick={() => navigate(card.path)} className="bg-white rounded-2xl border p-4 text-left" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs text-gray-400">{card.label}</p>
            <p className="text-2xl font-black mt-1">{card.value}</p>
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border" style={{ borderColor: "var(--border)" }}>
        <div className="px-4 py-3 border-b font-semibold" style={{ borderColor: "var(--border)" }}>Yaqin bronlar</div>
        {upcoming.map((item) => (
          <div key={item.id} className="px-4 py-3 border-t text-sm flex justify-between" style={{ borderColor: "var(--border)" }}>
            <span>{item.venueName} · {item.date} · {SESSIONS[item.session] || item.session}</span>
            <span className="text-gray-500">{item.name}</span>
          </div>
        ))}
        {!upcoming.length && <p className="px-4 py-6 text-sm text-gray-400">Yaqin bron yo&apos;q.</p>}
      </div>
    </div>
  );
}
