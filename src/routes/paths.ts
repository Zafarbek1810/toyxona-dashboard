export const paths = {
  home: "/",
  products: "/products",
  product: (id: number | string) => `/products/${id}`,
  store: (slug = "techplus") => `/store/${slug}`,
  auth: "/auth",
  cart: "/cart",
  favorites: "/favorites",
  account: {
    root: "/account",
    orders: "/account/orders",
    favorites: "/account/favorites",
    profile: "/account/profile",
    addresses: "/account/addresses",
    notifications: "/account/notifications",
    settings: "/account/settings",
  },
  seller: {
    root: "/seller",
    dashboard: "/seller/dashboard",
    products: "/seller/products",
    productsNew: "/seller/products/new",
    productsEdit: (id: number | string) => `/seller/products/${id}/edit`,
    orders: "/seller/orders",
    analytics: "/seller/analytics",
    payments: "/seller/payments",
    paymentsCheckout: "/seller/payments/checkout",
    subscription: "/seller/subscription",
    subscriptionCheckout: "/seller/subscription/checkout",
    reviews: "/seller/reviews",
    settings: "/seller/settings",
  },
  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
    sellers: "/admin/sellers",
    subscriptions: "/admin/subscriptions",
    products: "/admin/products",
    payments: "/admin/payments",
    analytics: "/admin/analytics",
    users: "/admin/users",
    categories: "/admin/categories",
    orders: "/admin/orders",
    promotions: "/admin/promotions",
    settings: "/admin/settings",
  },
} as const;

export const sellerSectionPaths: Record<string, string> = {
  overview: paths.seller.dashboard,
  products: paths.seller.products,
  orders: paths.seller.orders,
  analytics: paths.seller.analytics,
  payments: paths.seller.payments,
  subscription: paths.seller.subscription,
  reviews: paths.seller.reviews,
  settings: paths.seller.settings,
};

export const adminSectionPaths: Record<string, string> = {
  overview: paths.admin.dashboard,
  sellers: paths.admin.sellers,
  subscriptions: paths.admin.subscriptions,
  products: paths.admin.products,
  payments: paths.admin.payments,
  analytics: paths.admin.analytics,
  users: paths.admin.users,
  categories: paths.admin.categories,
  orders: paths.admin.orders,
  promotions: paths.admin.promotions,
  settings: paths.admin.settings,
};

export const accountSectionPaths: Record<string, string> = {
  overview: paths.account.root,
  orders: paths.account.orders,
  favorites: paths.account.favorites,
  profile: paths.account.profile,
  addresses: paths.account.addresses,
  notifications: paths.account.notifications,
  settings: paths.account.settings,
};

export function getSellerActiveSection(pathname: string): string {
  if (pathname.includes("/products/new") || /\/products\/\d+\/edit/.test(pathname)) return "products";
  if (pathname.includes("/payments/checkout")) return "payments";
  if (pathname.includes("/subscription/checkout")) return "subscription";

  for (const [id, path] of Object.entries(sellerSectionPaths)) {
    if (pathname === path) return id;
  }
  return "overview";
}

export function getAdminActiveSection(pathname: string): string {
  for (const [id, path] of Object.entries(adminSectionPaths)) {
    if (pathname === path) return id;
  }
  return "overview";
}

export function getAccountSection(pathname: string): string {
  for (const [id, path] of Object.entries(accountSectionPaths)) {
    if (pathname === path) return id;
  }
  return "overview";
}
