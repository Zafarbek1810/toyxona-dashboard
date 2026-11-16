export const SITE_NAME = "To'yxona";

const exactTitles: Record<string, string> = {
  "/": "Kabinetga kirish",
  "/owner/dashboard": "To'yxona kabineti",
  "/owner/venues": "To'yxonam",
  "/owner/bookings": "Bronlar",
  "/owner/reviews": "Sharhlar",
  "/owner/settings": "Sozlamalar",
  "/specialist/dashboard": "Mutaxassis kabineti",
  "/specialist/profile": "Profil",
  "/specialist/reviews": "Sharhlar",
  "/specialist/settings": "Sozlamalar",
  "/admin/dashboard": "Admin panel",
  "/admin/venues": "To'yxonalar",
  "/admin/specialists": "Mutaxassislar",
  "/admin/bookings": "Bronlar",
  "/admin/reviews": "Sharhlar",
  "/admin/users": "Foydalanuvchilar",
  "/admin/categories": "Yo'nalishlar",
  "/admin/settings": "Sozlamalar",
};

export function formatDocumentTitle(pageTitle?: string | null): string {
  const trimmed = pageTitle?.trim();
  if (!trimmed || trimmed === SITE_NAME) return SITE_NAME;
  return `${trimmed} | ${SITE_NAME}`;
}

export function getPageTitleForPath(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (exactTitles[normalized]) return exactTitles[normalized];
  if (normalized.startsWith("/owner")) return "To'yxona kabineti";
  if (normalized.startsWith("/specialist")) return "Mutaxassis kabineti";
  if (normalized.startsWith("/admin")) return "Admin panel";
  return SITE_NAME;
}
