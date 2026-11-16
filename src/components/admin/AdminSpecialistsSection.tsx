import TableActionButton from "../TableActionButton";
import { useEffect, useState } from "react";
import Modal from "../Modal";
import StatusPill from "../StatusPill";
import { adminApi } from "../../lib/api";
import type { Specialist, SpecialistCategory } from "../../lib/api/types";
import { DISTRICTS, REGIONS, STATUS_LABEL } from "../../lib/wedding";

const field = "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]";

export default function AdminSpecialistsSection() {
  const [rows, setRows] = useState<Specialist[]>([]);
  const [categories, setCategories] = useState<SpecialistCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("host");
  const [region, setRegion] = useState("Xorazm");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [priceFrom, setPriceFrom] = useState("");

  const load = async () => {
    try {
      const [list, cats] = await Promise.all([adminApi.specialists(), adminApi.categories()]);
      setRows(list);
      setCategories(cats);
      if (cats[0]) setCategoryId(cats[0].id);
    } catch {
      setRows([]);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    await adminApi.createSpecialist({
      name,
      categoryId,
      region,
      district,
      phone,
      bio,
      priceFrom: priceFrom ? Number(priceFrom) : null,
      status: "active",
    });
    setOpen(false);
    setName("");
    setBio("");
    await load();
  };

  return (
    <div className="max-w-[1400px] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Mutaxassislar</h1>
          <p className="text-sm text-gray-400">{rows.length} ta profil</p>
        </div>
        <button type="button" className="rounded-xl bg-[#00A86B] text-white text-sm font-semibold px-4 py-2" onClick={() => setOpen(true)}>Qo&apos;shish</button>
      </div>
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-400">
            <tr>
              <th className="px-4 py-3">Ism</th>
              <th className="px-4 py-3">Yo&apos;nalish</th>
              <th className="px-4 py-3">Hudud</th>
              <th className="px-4 py-3">Holat</th>
              <th className="px-4 py-3 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-3 font-semibold">{item.name}</td>
                <td className="px-4 py-3">{item.category || item.categoryId}</td>
                <td className="px-4 py-3 text-gray-500">{item.region}</td>
                <td className="px-4 py-3"><StatusPill status={item.status} label={item.statusLabel || STATUS_LABEL[item.status || ""]} /></td>
                <td className="px-4 py-3 text-right space-x-2">
                  {item.status !== "active" && (
                    <TableActionButton icon="check" label="Tasdiqlash" tone="success" onClick={() => adminApi.updateSpecialist(item.id, { status: "active" }).then(load)} />
                  )}
                  <TableActionButton icon="star" label={item.featured ? "Tavsiyadan olish" : "Tavsiya qilish"} tone="warning" active={!!item.featured} onClick={() => adminApi.updateSpecialist(item.id, { featured: !item.featured }).then(load)} />
                  <TableActionButton icon="trash" label="O'chirish" tone="danger" onClick={() => adminApi.deleteSpecialist(item.id).then(load)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Mutaxassis qo'shish">
        <div className="space-y-3">
          <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Ism" value={name} onChange={(e) => setName(e.target.value)} />
          <select className={field} style={{ borderColor: "var(--border)" }} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select className={field} style={{ borderColor: "var(--border)" }} value={region} onChange={(e) => { setRegion(e.target.value); setDistrict(""); }}>
            {REGIONS.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className={field} style={{ borderColor: "var(--border)" }} value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="">Tuman</option>
            {(DISTRICTS[region] || []).map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className={field} style={{ borderColor: "var(--border)" }} placeholder="Narx dan" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} />
          <textarea className={field} style={{ borderColor: "var(--border)" }} rows={3} placeholder="Qisqa tavsif" value={bio} onChange={(e) => setBio(e.target.value)} />
          <button type="button" onClick={() => void create()} className="w-full rounded-xl bg-[#00A86B] text-white font-semibold py-2.5">Saqlash</button>
        </div>
      </Modal>
    </div>
  );
}
