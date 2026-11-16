import TableActionButton from "../TableActionButton";
import { useEffect, useState } from "react";
import StatusPill from "../StatusPill";
import { ownerApi } from "../../lib/api";
import type { Booking, Venue } from "../../lib/api/types";
import { SESSIONS, STATUS_LABEL } from "../../lib/wedding";

export default function SellerBookingsSection() {
  const [rows, setRows] = useState<Booking[]>([]);

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const [venues, bookings] = await Promise.all([ownerApi.venues(), ownerApi.bookings()]);
      const assigned = venues[0] || null;
      setVenue(assigned);
      setRows(assigned ? bookings.filter((item) => item.venueId === assigned.id) : []);
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : "Bronlar yuklanmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const refresh = () => { void load(); };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await ownerApi.updateBooking(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bron holati o‘zgartirilmadi");
    }
  };

  return (
    <div className="max-w-[1100px] space-y-4">
      <div>
        <h1 className="text-xl font-black text-gray-900">Bronlar</h1>
        {venue && <p className="mt-1 text-sm text-gray-500">{venue.name} · {rows.length} ta bron</p>}
      </div>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-400">
            <tr>
              <th className="px-4 py-3">To&apos;yxona</th>
              <th className="px-4 py-3">Sana</th>
              <th className="px-4 py-3">Mijoz</th>
              <th className="px-4 py-3">Holat</th>
              <th className="px-4 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {(loading || (!error && rows.length === 0)) && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                {loading ? "Yuklanmoqda..." : venue ? "Bu to‘yxonaga hali bron yuborilmagan." : "Sizga hali to‘yxona biriktirilmagan."}
              </td></tr>
            )}
            {rows.map((item) => (
              <tr key={item.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-3 font-semibold">{item.venueName}<div className="text-xs text-gray-400">{SESSIONS[item.session]}</div></td>
                <td className="px-4 py-3">{item.date}</td>
                <td className="px-4 py-3">{item.name}<div className="text-xs text-gray-400">{item.phone} · {item.guests} mehmon</div></td>
                <td className="px-4 py-3"><StatusPill status={item.status} label={item.statusLabel || STATUS_LABEL[item.status]} /></td>
                <td className="px-4 py-3 text-right space-x-2">
                  {item.status === "pending" && (
                    <TableActionButton icon="check" label="Tasdiqlash" tone="success" onClick={() => void updateStatus(item.id, "confirmed")} />
                  )}
                  {item.status !== "cancelled" && (
                    <TableActionButton icon="close" label="Bekor qilish" tone="danger" onClick={() => void updateStatus(item.id, "cancelled")} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
