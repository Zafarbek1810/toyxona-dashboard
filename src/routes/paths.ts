export const paths = {
  home: "/",
  auth: "/",
  owner: {
    root: "/owner",
    dashboard: "/owner/dashboard",
    venues: "/owner/venues",
    bookings: "/owner/bookings",
    reviews: "/owner/reviews",
    settings: "/owner/settings",
  },
  specialist: {
    root: "/specialist",
    dashboard: "/specialist/dashboard",
    profile: "/specialist/profile",
    reviews: "/specialist/reviews",
    settings: "/specialist/settings",
  },
  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
    venues: "/admin/venues",
    specialists: "/admin/specialists",
    bookings: "/admin/bookings",
    reviews: "/admin/reviews",
    users: "/admin/users",
    categories: "/admin/categories",
    settings: "/admin/settings",
  },
  seller: {
    root: "/owner",
    dashboard: "/owner/dashboard",
  },
} as const;

export const ownerSectionPaths: Record<string, string> = {
  overview: paths.owner.dashboard,
  venues: paths.owner.venues,
  bookings: paths.owner.bookings,
  reviews: paths.owner.reviews,
  settings: paths.owner.settings,
};

export const specialistSectionPaths: Record<string, string> = {
  overview: paths.specialist.dashboard,
  profile: paths.specialist.profile,
  reviews: paths.specialist.reviews,
  settings: paths.specialist.settings,
};

export const adminSectionPaths: Record<string, string> = {
  overview: paths.admin.dashboard,
  venues: paths.admin.venues,
  specialists: paths.admin.specialists,
  bookings: paths.admin.bookings,
  reviews: paths.admin.reviews,
  users: paths.admin.users,
  categories: paths.admin.categories,
  settings: paths.admin.settings,
};

export function getOwnerActiveSection(pathname: string): string {
  for (const [id, path] of Object.entries(ownerSectionPaths)) {
    if (pathname === path) return id;
  }
  return "overview";
}

export function getSpecialistActiveSection(pathname: string): string {
  for (const [id, path] of Object.entries(specialistSectionPaths)) {
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
