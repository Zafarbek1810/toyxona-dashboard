export default function StatusPill({ status, label }: { status?: string; label?: string }) {
  const tone =
    status === "active" || status === "confirmed"
      ? "bg-green-50 text-green-700"
      : status === "pending"
        ? "bg-amber-50 text-amber-700"
        : status === "cancelled" || status === "blocked"
          ? "bg-red-50 text-red-700"
          : "bg-gray-100 text-gray-600";
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone}`}>{label || status}</span>;
}
