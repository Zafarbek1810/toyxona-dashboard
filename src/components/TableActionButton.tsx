import type { ButtonHTMLAttributes } from "react";

type ActionIcon = "check" | "close" | "edit" | "trash" | "star" | "lock" | "unlock";

const paths: Record<ActionIcon, string> = {
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12M6 18 18 6",
  edit: "m16 3 5 5M4 20l4-1L21 6a2.12 2.12 0 0 0-3-3L5 16l-1 4Z",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z",
  lock: "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10Zm7 4v3",
  unlock: "M7 10V7a5 5 0 0 1 9.6-2M5 10h14v11H5V10Zm7 4v3",
};

export default function TableActionButton({
  icon,
  label,
  tone = "neutral",
  active = false,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
  icon: ActionIcon;
  label: string;
  tone?: "neutral" | "success" | "danger" | "warning";
  active?: boolean;
}) {
  const colors = {
    neutral: "text-gray-600 hover:bg-gray-100",
    success: "text-[#00A86B] hover:bg-emerald-50",
    danger: "text-red-500 hover:bg-red-50",
    warning: "text-amber-600 hover:bg-amber-50",
  };

  return (
    <button
      {...props}
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg align-middle transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current disabled:opacity-50 ${colors[tone]}`}
    >
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill={icon === "star" && active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d={paths[icon]} />
      </svg>
    </button>
  );
}
