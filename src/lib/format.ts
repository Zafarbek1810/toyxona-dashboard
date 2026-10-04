export const formatPrice = (price: number) =>
  new Intl.NumberFormat("uz-UZ").format(price) + " so'm";

export const formatCompact = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

export const formatDateShort = (value?: string | Date | null) => {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" });
};

export const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    Yangi: "bg-blue-50 text-blue-700",
    Tasdiqlangan: "bg-purple-50 text-purple-700",
    "Tayyorlanmoqda": "bg-yellow-50 text-yellow-700",
    "Yetkazilmoqda": "bg-orange-50 text-orange-700",
    Yetkazildi: "bg-green-50 text-green-700",
    "Bekor qilindi": "bg-red-50 text-red-700",
    new: "bg-blue-50 text-blue-700",
    confirmed: "bg-purple-50 text-purple-700",
    preparing: "bg-yellow-50 text-yellow-700",
    shipping: "bg-orange-50 text-orange-700",
    delivered: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
    active: "bg-green-50 text-green-700",
    pending: "bg-yellow-50 text-yellow-700",
    suspended: "bg-red-50 text-red-700",
    blocked: "bg-red-50 text-red-700",
    confirmed_payment: "bg-green-50 text-green-700",
    refunded: "bg-red-50 text-red-700",
    PRO: "bg-amber-50 text-amber-700",
    BUSINESS: "bg-blue-50 text-blue-700",
    START: "bg-gray-50 text-gray-700",
  };
  return map[status] || "bg-gray-50 text-gray-700";
};

export const PAYMENT_STATUS_UZ: Record<string, string> = {
  confirmed: "Tasdiqlangan",
  pending: "Kutilmoqda",
  refunded: "Qaytarilgan",
  failed: "Muvaffaqiyatsiz",
};

export const PAYMENT_TYPE_UZ: Record<string, string> = {
  sale: "Savdo",
  topup: "To'ldirish",
  subscription: "Obuna",
  refund: "Qaytarish",
};

export const METHOD_LABEL: Record<string, string> = {
  payme: "Payme",
  click: "Click",
  clickuz: "Click",
  uzum: "Uzum",
  paynet: "Paynet",
  card: "Karta",
};

export const PROMO_STATUS_UZ: Record<string, string> = {
  active: "Faol",
  scheduled: "Kutilmoqda",
  ended: "Tugadi",
};

export const PROMO_TYPE_UZ: Record<string, string> = {
  banner: "Banner",
  popup: "Pop-up",
  email: "Email",
  flash: "Flash",
};
