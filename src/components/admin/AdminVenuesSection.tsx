import TableActionButton from "../TableActionButton";
import { useEffect, useState } from "react";
import Modal from "../Modal";
import StatusPill from "../StatusPill";
import VenueForm, { draftToBody, emptyVenue, venueToDraft, type VenueDraft } from "../VenueForm";
import { adminApi } from "../../lib/api";
import type { Venue } from "../../lib/api/types";
import { STATUS_LABEL } from "../../lib/wedding";

export default function AdminVenuesSection() {
  const [rows, setRows] = useState<Venue[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);
  const [draft, setDraft] = useState<VenueDraft>(emptyVenue());
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setRows(await adminApi.venues());
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    setError("");
    try {
      const body = draftToBody(draft, true);
      if (editing) await adminApi.updateVenue(editing.id, body);
      else await adminApi.createVenue(body);
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saqlanmadi");
    }
  };

  return (
    <div className="max-w-[1400px] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">To&apos;yxonalar</h1>
          <p className="text-sm text-gray-400">{rows.length} ta zal</p>
        </div>
        <button type="button" className="rounded-xl bg-[#00A86B] text-white text-sm font-semibold px-4 py-2" onClick={() => { setEditing(null); setDraft(emptyVenue()); setOpen(true); }}>
          Qo&apos;shish
        </button>
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-400">
            <tr>
              <th className="px-4 py-3">Nomi</th>
              <th className="px-4 py-3">Joylashuv</th>
              <th className="px-4 py-3">Sig&apos;im</th>
              <th className="px-4 py-3">Holat</th>
              <th className="px-4 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((venue) => (
              <tr key={venue.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-3 font-semibold">{venue.name}</td>
                <td className="px-4 py-3 text-gray-500">{venue.region}, {venue.district}</td>
                <td className="px-4 py-3">{venue.maxGuests ? `${venue.minGuests}–${venue.maxGuests}` : "—"}</td>
                <td className="px-4 py-3"><StatusPill status={venue.status} label={venue.statusLabel || STATUS_LABEL[venue.status || ""]} /></td>
                <td className="px-4 py-3 text-right space-x-2">
                  {venue.status !== "active" && (
                    <TableActionButton icon="check" label="Tasdiqlash" tone="success" onClick={() => adminApi.setVenueStatus(venue.id, "active").then(load)} />
                  )}
                  <TableActionButton icon="edit" label="Tahrirlash" tone="neutral" onClick={() => { setEditing(venue); setDraft(venueToDraft(venue)); setOpen(true); }} />
                  <TableActionButton icon="trash" label="O'chirish" tone="danger" onClick={() => adminApi.deleteVenue(venue.id).then(load)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "To'yxonani tahrirlash" : "Yangi to'yxona"} maxWidth="max-w-2xl">
        <VenueForm draft={draft} onChange={setDraft} showStatus />
        {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        <button type="button" onClick={() => void save()} className="mt-4 w-full rounded-xl bg-[#00A86B] text-white font-semibold py-2.5">Saqlash</button>
      </Modal>
    </div>
  );
}
