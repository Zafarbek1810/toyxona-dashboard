import { useEffect, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "max-w-lg",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col border`}
        style={{ borderColor: "#E2E6F0" }}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b shrink-0" style={{ borderColor: "#E2E6F0" }}>
          <div>
            <h2 id="modal-title" className="text-lg font-black text-gray-900" style={{ fontFamily: "var(--font-sans)" }}>
              {title}
            </h2>
            {description && <p className="text-sm text-gray-400 mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            aria-label="Yopish"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t flex items-center justify-end gap-3 shrink-0" style={{ borderColor: "#E2E6F0" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
        {label}
        {required && " *"}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export const inputClass = (hasError?: boolean) =>
  `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B] focus:ring-2 focus:ring-[#00A86B]/10 ${
    hasError ? "border-red-400" : ""
  }`;

export const selectClass = (hasError?: boolean) =>
  `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00A86B] ${
    hasError ? "border-red-400" : ""
  }`;
