import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { usersApi } from "../../lib/api";

const field = "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:border-[#00A86B]";

export default function SpecialistSettingsSection() {
  const { user, refreshUser } = useAppContext();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [city, setCity] = useState(user?.city || "");
  const [saved, setSaved] = useState(false);

  const save = async () => {
    await usersApi.updateMe({ firstName, lastName, city });
    await refreshUser();
    setSaved(true);
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-black text-gray-900">Sozlamalar</h1>
      <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
        <input className={field} style={{ borderColor: "var(--border)" }} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input className={field} style={{ borderColor: "var(--border)" }} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input className={field} style={{ borderColor: "var(--border)" }} value={city || ""} onChange={(e) => setCity(e.target.value)} placeholder="Shahar" />
        <p className="text-xs text-gray-400">Telefon: {user?.phone}</p>
        <button type="button" onClick={() => void save()} className="rounded-xl bg-[#063528] text-white font-semibold px-4 py-2.5">Saqlash</button>
        {saved && <p className="text-sm text-[#00A86B]">Saqlandi</p>}
      </div>
    </div>
  );
}
