import TableActionButton from "../TableActionButton";
import { useEffect, useState } from "react";
import StatusPill from "../StatusPill";
import { adminApi } from "../../lib/api";
import type { Booking } from "../../lib/api/types";
import { SESSIONS, STATUS_LABEL } from "../../lib/wedding";

export default function AdminBookingsSection() {
  const [rows, setRows] = useState<Booking[]>([]);

  const load = async () => {
    try {
      setRows(await adminApi.bookings());
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="max-w-[1400px] space-y-4">
      <div>
        <h1 className="text-xl font-black text-gray-900">Bronlar</h1>
        <p className="text-sm text-gray-400">{rows.length} ta so&apos;rov</p>
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-400">
            <tr>
              <th className="px-4 py-3">To&apos;yxona</th>
              <th className="px-4 py-3">Sana</th>
              <th className="px-4 py-3">Seans</th>
              <th className="px-4 py-3">Mijoz</th>
              <th className="px-4 py-3">Holat</th>
              <th className="px-4 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-3 font-semibold">{item.venueName}</td>
                <td className="px-4 py-3">{item.date}</td>
                <td className="px-4 py-3">{SESSIONS[item.session] || item.session}</td>
                <td className="px-4 py-3">{item.name}<div className="text-xs text-gray-400">{item.guests} mehmon</div></td>
                <td className="px-4 py-3"><StatusPill status={item.status} label={item.statusLabel || STATUS_LABEL[item.status]} /></td>
                <td className="px-4 py-3 text-right space-x-2">
                  {item.status === "pending" && (
                    <TableActionButton icon="check" label="Tasdiqlash" tone="success" onClick={() => adminApi.updateBooking(item.id, "confirmed").then(load)} />
                  )}
                  {item.status !== "cancelled" && (
                    <TableActionButton icon="close" label="Bekor qilish" tone="danger" onClick={() => adminApi.updateBooking(item.id, "cancelled").then(load)} />
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
