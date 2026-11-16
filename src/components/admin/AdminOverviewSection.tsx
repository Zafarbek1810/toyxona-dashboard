import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import { paths } from "../../routes/paths";

type Kpis = {
  venues: number;
  specialists: number;
  bookings: number;
  users: number;
  pendingVenues: number;
  pendingSpecialists: number;
  pendingBookings: number;
};

export default function AdminOverviewSection() {
  const navigate = useAppNavigate();
  const [kpis, setKpis] = useState<Kpis | null>(null);

  useEffect(() => {
    adminApi.overview().then((data) => setKpis(data.kpis)).catch(() => setKpis(null));
  }, []);

  const cards = [
    { label: "To'yxonalar", value: kpis?.venues ?? "—", path: paths.admin.venues },
    { label: "Mutaxassislar", value: kpis?.specialists ?? "—", path: paths.admin.specialists },
    { label: "Bronlar", value: kpis?.bookings ?? "—", path: paths.admin.bookings },
    { label: "Mijozlar", value: kpis?.users ?? "—", path: paths.admin.users },
  ];

  return (
    <div className="max-w-[1400px] space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900">Boshqaruv</h1>
        <p className="text-sm text-gray-400 mt-0.5">To&apos;yxonalar, mutaxassislar va bronlar</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <button key={card.label} type="button" onClick={() => navigate(card.path)} className="bg-white rounded-2xl border p-4 text-left" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs text-gray-400">{card.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{card.value}</p>
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <button type="button" onClick={() => navigate(paths.admin.venues)} className="bg-white rounded-2xl border p-4 text-left" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold text-gray-900">Tasdiq kutayotgan to&apos;yxonalar</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{kpis?.pendingVenues ?? "—"}</p>
        </button>
        <button type="button" onClick={() => navigate(paths.admin.specialists)} className="bg-white rounded-2xl border p-4 text-left" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold text-gray-900">Tasdiq kutayotgan mutaxassislar</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{kpis?.pendingSpecialists ?? "—"}</p>
        </button>
        <button type="button" onClick={() => navigate(paths.admin.bookings)} className="bg-white rounded-2xl border p-4 text-left" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm font-semibold text-gray-900">Yangi bronlar</p>
          <p className="text-2xl font-black text-[#00A86B] mt-1">{kpis?.pendingBookings ?? "—"}</p>
        </button>
      </div>
    </div>
  );
}
