import { useEffect, useState } from "react";
import { specialistApi } from "../../lib/api";
import { DISTRICTS, REGIONS } from "../../lib/wedding";

const field = "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]";

export default function SpecialistProfileSection() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("Xorazm");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    specialistApi.profile().then((profile) => {
      setName(profile.name);
      setRegion(profile.region);
      setDistrict(profile.district || "");
      setPhone(profile.phone);
      setBio(profile.bio);
      setPriceFrom(profile.priceFrom == null ? "" : String(profile.priceFrom));
    }).catch(() => undefined);
  }, []);

  const save = async () => {
    await specialistApi.updateProfile({
      name,
      region,
      district,
      phone,
      bio,
      priceFrom: priceFrom ? Number(priceFrom) : null,
    });
    setSaved(true);
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-black text-gray-900">Profil</h1>
      <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
        <input className={field} style={{ borderColor: "var(--border)" }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ism" />
        <select className={field} style={{ borderColor: "var(--border)" }} value={region} onChange={(e) => { setRegion(e.target.value); setDistrict(""); }}>
          {REGIONS.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select className={field} style={{ borderColor: "var(--border)" }} value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">Tuman</option>
          {(DISTRICTS[region] || []).map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <input className={field} style={{ borderColor: "var(--border)" }} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon" />
        <input className={field} style={{ borderColor: "var(--border)" }} value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} placeholder="Narx dan" />
        <textarea className={field} style={{ borderColor: "var(--border)" }} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tavsif" />
        <button type="button" onClick={() => void save()} className="rounded-xl bg-[#00A86B] text-white font-semibold px-4 py-2.5">Saqlash</button>
        {saved && <p className="text-sm text-[#00A86B]">Saqlandi. Admin tasdigidan keyin saytda ko&apos;rinadi.</p>}
      </div>
    </div>
  );
}
