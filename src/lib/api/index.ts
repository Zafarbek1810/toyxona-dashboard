import { apiRequest } from "./client";
import type {
  AuthUser,
  Booking,
  PlatformSettings,
  Review,
  Specialist,
  SpecialistCategory,
  Venue,
} from "./types";

export const uploadsApi = {
  image: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<{ url: string }>("/uploads", { method: "POST", formData });
  },
};

export const authApi = {
  login: (body: { phone?: string; email?: string; password: string }) =>
    apiRequest<{ token: string; user: AuthUser }>("/auth/login", { method: "POST", body, auth: false }),
  register: (body: Record<string, unknown>) =>
    apiRequest<{ token: string; user: AuthUser }>("/auth/register", { method: "POST", body, auth: false }),
  me: () => apiRequest<AuthUser>("/auth/me"),
  forgotPassword: (phone: string) =>
    apiRequest<{ message: string; demoCode?: string }>("/auth/forgot-password", {
      method: "POST",
      body: { phone },
      auth: false,
    }),
  resetPassword: (body: { phone: string; code: string; password: string }) =>
    apiRequest<{ message: string }>("/auth/reset-password", { method: "POST", body, auth: false }),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
};

export const usersApi = {
  me: () => apiRequest<AuthUser>("/users/me"),
  updateMe: (body: Record<string, unknown>) =>
    apiRequest<AuthUser>("/users/me", { method: "PATCH", body }),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    apiRequest("/users/me/change-password", { method: "POST", body }),
};

export const ownerApi = {
  overview: () =>
    apiRequest<{
      kpis: { venues: number; bookings: number; pending: number; reviews: number };
      upcoming: Booking[];
    }>("/owner/overview"),
  venues: () => apiRequest<Venue[]>("/owner/venues"),
  updateVenue: (id: number, body: Record<string, unknown>) =>
    apiRequest<Venue>(`/owner/venues/${id}`, { method: "PATCH", body }),
  bookings: () => apiRequest<Booking[]>("/owner/bookings"),
  updateBooking: (id: number, status: string) =>
    apiRequest<Booking>(`/owner/bookings/${id}/status`, { method: "PATCH", body: { status } }),
  reviews: () => apiRequest<Review[]>("/owner/reviews"),
  replyReview: (id: number, reply: string) =>
    apiRequest(`/owner/reviews/${id}/reply`, { method: "POST", body: { reply } }),
  updateProfile: (body: Record<string, unknown>) =>
    apiRequest("/owner/profile", { method: "PATCH", body }),
};

export const specialistApi = {
  overview: () => apiRequest("/specialist/overview"),
  profile: () => apiRequest<Specialist>("/specialist/profile"),
  updateProfile: (body: Record<string, unknown>) =>
    apiRequest<Specialist>("/specialist/profile", { method: "PATCH", body }),
  reviews: () => apiRequest<Review[]>("/specialist/reviews"),
  replyReview: (id: number, reply: string) =>
    apiRequest(`/specialist/reviews/${id}/reply`, { method: "POST", body: { reply } }),
};

export const adminApi = {
  overview: () =>
    apiRequest<{
      kpis: {
        venues: number;
        specialists: number;
        bookings: number;
        users: number;
        pendingVenues: number;
        pendingSpecialists: number;
        pendingBookings: number;
      };
      series: Array<{ month: string; bookings: number; confirmed: number }>;
    }>("/admin/overview"),
  users: (query?: Record<string, string | undefined>) =>
    apiRequest<AuthUser[]>("/admin/users", { query }),
  updateUser: (id: number, body: Record<string, unknown>) =>
    apiRequest(`/admin/users/${id}`, { method: "PATCH", body }),
  deleteUser: (id: number) => apiRequest(`/admin/users/${id}`, { method: "DELETE" }),
  venues: (query?: Record<string, string | undefined>) =>
    apiRequest<Venue[]>("/admin/venues", { query }),
  createVenue: (body: Record<string, unknown>) =>
    apiRequest<Venue>("/admin/venues", { method: "POST", body }),
  updateVenue: (id: number, body: Record<string, unknown>) =>
    apiRequest<Venue>(`/admin/venues/${id}`, { method: "PATCH", body }),
  deleteVenue: (id: number) => apiRequest(`/admin/venues/${id}`, { method: "DELETE" }),
  setVenueStatus: (id: number, status: string) =>
    apiRequest<Venue>(`/admin/venues/${id}/status`, { method: "PATCH", body: { status } }),
  specialists: (query?: Record<string, string | undefined>) =>
    apiRequest<Specialist[]>("/admin/specialists", { query }),
  createSpecialist: (body: Record<string, unknown>) =>
    apiRequest<Specialist>("/admin/specialists", { method: "POST", body }),
  updateSpecialist: (id: number, body: Record<string, unknown>) =>
    apiRequest<Specialist>(`/admin/specialists/${id}`, { method: "PATCH", body }),
  deleteSpecialist: (id: number) => apiRequest(`/admin/specialists/${id}`, { method: "DELETE" }),
  categories: () => apiRequest<SpecialistCategory[]>("/admin/categories"),
  updateCategory: (id: string, body: Record<string, unknown>) =>
    apiRequest(`/admin/categories/${id}`, { method: "PATCH", body }),
  bookings: (query?: Record<string, string | undefined>) =>
    apiRequest<Booking[]>("/admin/bookings", { query }),
  updateBooking: (id: number, status: string) =>
    apiRequest<Booking>(`/admin/bookings/${id}/status`, { method: "PATCH", body: { status } }),
  reviews: () => apiRequest<Review[]>("/admin/reviews"),
  deleteReview: (id: number) => apiRequest(`/admin/reviews/${id}`, { method: "DELETE" }),
  getSettings: () => apiRequest<PlatformSettings>("/admin/settings"),
  updateSettings: (body: Partial<PlatformSettings>) =>
    apiRequest<PlatformSettings>("/admin/settings", { method: "PATCH", body }),
};
