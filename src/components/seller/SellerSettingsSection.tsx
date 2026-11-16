import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { ownerApi } from "../../lib/api";
import { REGIONS } from "../../lib/wedding";

const field = "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]";

export default function SellerSettingsSection() {
  const { user, refreshUser } = useAppContext();
  const owner = user?.owner;
  const [name, setName] = useState(owner?.name || "");
  const [region, setRegion] = useState(owner?.region || "Xorazm");
  const [description, setDescription] = useState(owner?.description || "");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await ownerApi.updateProfile({ name, region, description });
    await refreshUser();
    setSaved(true);
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-black text-gray-900">Sozlamalar</h1>
      <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
        <p className="text-sm text-gray-500">{user?.firstName} {user?.lastName} · {user?.phone}</p>
        <input className={field} style={{ borderColor: "var(--border)" }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Brend nomi" />
        <select className={field} style={{ borderColor: "var(--border)" }} value={region || ""} onChange={(e) => setRegion(e.target.value)}>
          {REGIONS.map((item) => <option key={item}>{item}</option>)}
        </select>
        <textarea className={field} style={{ borderColor: "var(--border)" }} rows={3} value={description || ""} onChange={(e) => setDescription(e.target.value)} placeholder="Tavsif" />
        <button type="button" onClick={() => void save()} className="rounded-xl bg-[#063528] text-white font-semibold px-4 py-2.5">Saqlash</button>
        {saved && <p className="text-sm text-[#00A86B]">Saqlandi</p>}
      </div>
    </div>
  );
}
