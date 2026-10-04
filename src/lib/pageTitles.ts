export const SITE_NAME = "To'yxona";

/** Exact pathname → page title (without brand suffix). */
const exactTitles: Record<string, string> = {
  "/": "Bosh sahifa",
  "/products": "Mahsulotlar",
  "/auth": "Kirish",
  "/cart": "Savatcha",
  "/favorites": "Sevimlilar",
  "/account": "Kabinet",
  "/account/orders": "Buyurtmalarim",
  "/account/favorites": "Sevimlilar",
  "/account/profile": "Profil",
  "/account/addresses": "Manzillar",
  "/account/notifications": "Bildirishnomalar",
  "/account/settings": "Sozlamalar",
  "/seller/dashboard": "Sotuvchi kabineti",
  "/seller/products": "Mahsulotlar",
  "/seller/products/new": "Mahsulot qo'shish",
  "/seller/orders": "Buyurtmalar",
  "/seller/analytics": "Analitika",
  "/seller/payments": "To'lovlar",
  "/seller/payments/checkout": "To'lov qilish",
  "/seller/subscription": "Obuna",
  "/seller/subscription/checkout": "Obunani yangilash",
  "/seller/reviews": "Sharhlar",
  "/seller/settings": "Sozlamalar",
  "/admin/dashboard": "Admin panel",
  "/admin/sellers": "Sotuvchilar",
  "/admin/subscriptions": "Obunalar",
  "/admin/products": "Mahsulotlar",
  "/admin/payments": "To'lovlar",
  "/admin/analytics": "Analitika",
  "/admin/users": "Xaridorlar",
  "/admin/categories": "Kategoriyalar",
  "/admin/orders": "Buyurtmalar",
  "/admin/promotions": "Reklamalar",
  "/admin/settings": "Sozlamalar",
};

export function formatDocumentTitle(pageTitle?: string | null): string {
  const trimmed = pageTitle?.trim();
  if (!trimmed || trimmed === SITE_NAME) return SITE_NAME;
  return `${trimmed} | ${SITE_NAME}`;
}

export function getPageTitleForPath(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, "") || "/";

  if (normalized === "/" || normalized === "/login" || normalized === "/auth") {
    return "Kabinetga kirish";
  }

  if (exactTitles[normalized]) return exactTitles[normalized];

  if (normalized.startsWith("/products/")) return "Mahsulot";
  if (/^\/seller\/products\/\d+\/edit$/.test(normalized)) return "Mahsulotni tahrirlash";
  if (normalized.startsWith("/store/")) return "Do'kon";
  if (normalized.startsWith("/account")) return "Kabinet";
  if (normalized.startsWith("/seller")) return "Sotuvchi kabineti";
  if (normalized.startsWith("/admin")) return "Admin panel";

  return SITE_NAME;
}
