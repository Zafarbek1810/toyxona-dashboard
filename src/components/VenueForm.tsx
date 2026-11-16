import { useRef, useState } from "react";
import { uploadsApi } from "../lib/api";
import type { Venue } from "../lib/api/types";
import { AMENITIES, DISTRICTS, REGIONS } from "../lib/wedding";

export type HallDraft = {
  name: string;
  capacity: string;
  price: string;
};

export type VenueDraft = {
  name: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  hours: string;
  description: string;
  minGuests: string;
  maxGuests: string;
  priceFrom: string;
  image: string;
  gallery: string;
  amenities: string[];
  menu: string;
  halls: HallDraft[];
  status: string;
};

const field = "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]";

function emptyHall(): HallDraft {
  return { name: "", capacity: "", price: "" };
}

function lines(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

export function emptyVenue(): VenueDraft {
  return {
    name: "",
    region: "Xorazm",
    district: "",
    address: "",
    phone: "",
    hours: "09:00 - 23:00",
    description: "",
    minGuests: "100",
    maxGuests: "500",
    priceFrom: "",
    image: "",
    gallery: "",
    amenities: [],
    menu: "",
    halls: [],
    status: "active",
  };
}

export function venueToDraft(venue: Venue): VenueDraft {
  return {
    name: venue.name,
    region: venue.region,
    district: venue.district,
    address: venue.address,
    phone: venue.phone,
    hours: venue.hours,
    description: venue.description,
    minGuests: String(venue.minGuests || 0),
    maxGuests: String(venue.maxGuests || 0),
    priceFrom: venue.priceFrom == null ? "" : String(venue.priceFrom),
    image: venue.image || "",
    gallery: (venue.gallery || []).join("\n"),
    amenities: venue.amenities || [],
    menu: (venue.menu || []).join("\n"),
    halls: (venue.halls || []).map((hall) => ({
      name: hall.name,
      capacity: String(hall.capacity ?? ""),
      price: hall.price == null ? "" : String(hall.price),
    })),
    status: venue.status || "active",
  };
}

export function draftToBody(draft: VenueDraft, includeStatus: boolean) {
  const gallery = lines(draft.gallery);
  const image = draft.image.trim() || gallery[0] || null;
  const body: Record<string, unknown> = {
    name: draft.name.trim(),
    region: draft.region,
    district: draft.district.trim(),
    address: draft.address.trim(),
    phone: draft.phone.trim(),
    hours: draft.hours.trim() || "09:00 - 23:00",
    description: draft.description.trim(),
    minGuests: Number(draft.minGuests) || 0,
    maxGuests: Number(draft.maxGuests) || 0,
    priceFrom: draft.priceFrom.trim() ? Number(draft.priceFrom) : null,
    image,
    gallery,
    amenities: draft.amenities,
    menu: lines(draft.menu),
    halls: draft.halls
      .filter((hall) => hall.name.trim())
      .map((hall) => ({
        name: hall.name.trim(),
        capacity: Number(hall.capacity) || 0,
        price: hall.price.trim() && Number.isFinite(Number(hall.price)) ? Number(hall.price) : null,
      })),
  };
  if (includeStatus) body.status = draft.status;
  return body;
}

export default function VenueForm({
  draft,
  onChange,
  showStatus,
}: {
  draft: VenueDraft;
  onChange: (next: VenueDraft) => void;
  showStatus?: boolean;
}) {
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const set = (patch: Partial<VenueDraft>) => onChange({ ...draftRef.current, ...patch });
  const [uploadError, setUploadError] = useState("");

  const upload = async (file: File | undefined, target: "image" | "gallery") => {
    if (!file) return;
    setUploadError("");
    try {
      const saved = await uploadsApi.image(file);
      const current = draftRef.current;
      if (target === "image") onChange({ ...current, image: saved.url });
      else onChange({ ...current, gallery: lines(`${current.gallery}\n${saved.url}`).join("\n") });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Rasm yuklanmadi");
    }
  };

  const setHall = (index: number, patch: Partial<HallDraft>) => {
    set({
      halls: draft.halls.map((hall, i) => (i === index ? { ...hall, ...patch } : hall)),
    });
  };

  return (
    <div className="space-y-3">
      <input className={field} style={{ borderColor: "var(--border)" }} placeholder="To'yxona nomi" value={draft.name} onChange={(e) => set({ name: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <select className={field} style={{ borderColor: "var(--border)" }} value={draft.region} onChange={(e) => {
          const region = e.target.value;
          const list = DISTRICTS[region] || [];
          set({ region, district: list.includes(draft.district) ? draft.district : "" });
        }}>
          {REGIONS.map((region) => <option key={region}>{region}</option>)}
        </select>
        <select className={field} style={{ borderColor: "var(--border)" }} value={draft.district} onChange={(e) => set({ district: e.target.value })}>
          <option value="">Tuman</option>
          {(DISTRICTS[draft.region] || []).map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </div>
      <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Manzil" value={draft.address} onChange={(e) => set({ address: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Telefon" value={draft.phone} onChange={(e) => set({ phone: e.target.value })} />
        <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Ish vaqti" value={draft.hours} onChange={(e) => set({ hours: e.target.value })} />
      </div>
      <textarea className={field} style={{ borderColor: "var(--border)" }} rows={3} placeholder="Tavsif" value={draft.description} onChange={(e) => set({ description: e.target.value })} />
      <div className="grid grid-cols-3 gap-3">
        <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Min mehmon" value={draft.minGuests} onChange={(e) => set({ minGuests: e.target.value })} />
        <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Max mehmon" value={draft.maxGuests} onChange={(e) => set({ maxGuests: e.target.value })} />
        <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Narx dan" value={draft.priceFrom} onChange={(e) => set({ priceFrom: e.target.value })} />
      </div>

      <div className="rounded-2xl border p-3 space-y-2" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-semibold text-gray-500">Asosiy rasm</p>
        <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Rasm havolasi" value={draft.image} onChange={(e) => set({ image: e.target.value })} />
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { void upload(e.target.files?.[0], "image"); e.target.value = ""; }} className="text-xs text-gray-500" />
        {draft.image && <img src={draft.image} alt="" className="h-24 w-full object-cover rounded-xl" />}
      </div>

      <div className="rounded-2xl border p-3 space-y-2" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs font-semibold text-gray-500">Galereya</p>
        <textarea className={field} style={{ borderColor: "var(--border)" }} rows={3} placeholder="Har qatorda bitta rasm havolasi" value={draft.gallery} onChange={(e) => set({ gallery: e.target.value })} />
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { void upload(e.target.files?.[0], "gallery"); e.target.value = ""; }} className="text-xs text-gray-500" />
        {lines(draft.gallery).length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {lines(draft.gallery).map((src) => (
              <img key={src} src={src} alt="" className="h-16 w-20 object-cover rounded-lg shrink-0" />
            ))}
          </div>
        )}
      </div>
      {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}

      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Qulayliklar</p>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((item) => {
            const on = draft.amenities.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => set({ amenities: on ? draft.amenities.filter((id) => id !== item.id) : [...draft.amenities, item.id] })}
                className={`rounded-full px-3 py-1 text-xs border ${on ? "bg-[#00A86B] text-white border-[#00A86B]" : "bg-white text-gray-600"}`}
                style={{ borderColor: on ? "#00A86B" : "var(--border)" }}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      <textarea className={field} style={{ borderColor: "var(--border)" }} rows={3} placeholder="Menyu, har qator alohida" value={draft.menu} onChange={(e) => set({ menu: e.target.value })} />

      <div className="rounded-2xl border p-3 space-y-2" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500">Zallar va narxlar</p>
          <button type="button" className="text-xs font-semibold text-[#00A86B]" onClick={() => set({ halls: [...draft.halls, emptyHall()] })}>
            Zal qo&apos;shish
          </button>
        </div>
        {draft.halls.length === 0 && <p className="text-xs text-gray-400">Zal kiritilmasa, narx kelishilgan hisoblanadi.</p>}
        {draft.halls.map((hall, index) => (
          <div key={index} className="grid grid-cols-[1.2fr_0.7fr_0.8fr_auto] gap-2">
            <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Zal nomi" value={hall.name} onChange={(e) => setHall(index, { name: e.target.value })} />
            <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Sig'im" value={hall.capacity} onChange={(e) => setHall(index, { capacity: e.target.value })} />
            <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Narx / kishi" value={hall.price} onChange={(e) => setHall(index, { price: e.target.value })} />
            <button type="button" className="text-xs text-red-500 px-1" onClick={() => set({ halls: draft.halls.filter((_, i) => i !== index) })}>
              Olib tashlash
            </button>
          </div>
        ))}
      </div>

      {showStatus && (
        <select className={field} style={{ borderColor: "var(--border)" }} value={draft.status} onChange={(e) => set({ status: e.target.value })}>
          <option value="active">Faol</option>
          <option value="pending">Kutilmoqda</option>
          <option value="inactive">Faol emas</option>
          <option value="blocked">Bloklangan</option>
        </select>
      )}
    </div>
  );
}
