export { DISTRICTS, REGIONS } from "./districts";

export const AMENITIES = [
  { id: "parking", name: "Avtoturargoh" },
  { id: "wifi", name: "Wi-Fi" },
  { id: "ac", name: "Konditsioner" },
  { id: "stage", name: "Sahna" },
  { id: "led", name: "LED ekran" },
  { id: "sound", name: "Ovoz uskunalari" },
  { id: "kids", name: "Bolalar maydoni" },
  { id: "halal", name: "Halol sertifikati" },
];

export const SESSIONS: Record<string, string> = {
  morning: "Nahorgi",
  lunch: "Obedki",
  evening: "Kechki",
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Kutilmoqda",
  active: "Faol",
  inactive: "Faol emas",
  blocked: "Bloklangan",
  confirmed: "Tasdiqlangan",
  cancelled: "Bekor qilindi",
};
