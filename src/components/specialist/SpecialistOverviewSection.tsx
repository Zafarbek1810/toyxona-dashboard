import { useEffect, useState } from "react";
import { specialistApi } from "../../lib/api";
import type { Specialist } from "../../lib/api/types";
import StatusPill from "../StatusPill";
import { STATUS_LABEL } from "../../lib/wedding";

export default function SpecialistOverviewSection() {
  const [profile, setProfile] = useState<Specialist | null>(null);

  useEffect(() => {
    specialistApi.profile().then(setProfile).catch(() => setProfile(null));
  }, []);

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-xl font-black text-gray-900">Kabinet</h1>
      {profile && (
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold">{profile.name}</p>
            <StatusPill status={profile.status} label={profile.statusLabel || STATUS_LABEL[profile.status || ""]} />
          </div>
          <p className="text-sm text-gray-500 mt-2">{profile.category} · {profile.region}</p>
          <p className="text-sm text-gray-600 mt-3">{profile.bio}</p>
          <p className="text-sm mt-3">Reyting {profile.rating.toFixed(1)} · {profile.reviewCount} sharh</p>
        </div>
      )}
    </div>
  );
}
