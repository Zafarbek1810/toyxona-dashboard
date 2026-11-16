import { useEffect, useState } from "react";
import StatusPill from "../StatusPill";
import VenueForm, { draftToBody, venueToDraft, type VenueDraft } from "../VenueForm";
import { ownerApi } from "../../lib/api";
import type { Venue } from "../../lib/api/types";
import { STATUS_LABEL } from "../../lib/wedding";

export default function SellerVenuesSection() {
  const [venue, setVenue] = useState<Venue | null>(null);
  const [draft, setDraft] = useState<VenueDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let live = true;
    ownerApi.venues().then((rows) => {
      if (!live) return;
      const assigned = rows[0] || null;
      setVenue(assigned);
      setDraft(assigned ? venueToDraft(assigned) : null);
    }).catch((err) => {
      if (live) setError(err instanceof Error ? err.message : "Ma’lumotlar yuklanmadi");
    }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  const save = async () => {
    if (!venue || !draft || saving) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await ownerApi.updateVenue(venue.id, draftToBody(draft, false));
      setVenue(updated);
      setDraft(venueToDraft(updated));
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saqlanmadi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1100px] space-y-4">
      <h1 className="text-xl font-black text-gray-900">To&apos;yxonam</h1>
      {loading ? <p className="text-sm text-gray-500">Yuklanmoqda...</p> : venue && draft ? (
        <div className="rounded-2xl border bg-white p-5 space-y-5" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-gray-900">{venue.name}</h2>
              <p className="text-sm text-gray-500">To&apos;yxona ma’lumotlari, rasmlari, menyusi, qulayliklari va zallarini tahrirlang.</p>
            </div>
            <StatusPill status={venue.status} label={venue.statusLabel || STATUS_LABEL[venue.status || ""]} />
          </div>
          <fieldset disabled={saving}>
            <VenueForm draft={draft} onChange={(next) => { setDraft(next); setSaved(false); }} />
          </fieldset>
          <button type="button" disabled={saving} onClick={() => void save()} className="rounded-xl bg-[#00A86B] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Saqlanmoqda..." : "O‘zgarishlarni saqlash"}
          </button>
          {saved && <p role="status" className="text-sm text-[#008F5A]">O‘zgarishlar saqlandi.</p>}
        </div>
      ) : !error && <p className="rounded-2xl border bg-white p-5 text-sm text-gray-500" style={{ borderColor: "var(--border)" }}>Sizga hali to&apos;yxona biriktirilmagan. Administratorga murojaat qiling.</p>}
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
