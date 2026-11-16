export type AuthRole = "customer" | "seller" | "specialist" | "admin";

export type ListingStatus = "pending" | "active" | "inactive" | "blocked";
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type SessionId = "morning" | "lunch" | "evening";

export type OwnerProfile = {
  id: number;
  userId?: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  region?: string | null;
  description?: string | null;
  verified: boolean;
  status?: ListingStatus | string;
  statusLabel?: string;
  venueCount?: number;
  createdAt?: string;
};

export type AuthUser = {
  id: number;
  phone: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  name?: string;
  role: AuthRole;
  birthDate?: string | null;
  city?: string | null;
  active?: boolean;
  owner?: OwnerProfile | null;
  specialist?: Specialist | null;
  bookingsCount?: number;
  settings?: {
    bookingUpdates: boolean;
    promoEmails: boolean;
    smsAlerts: boolean;
    language: string;
    currency: string;
  };
  createdAt?: string;
};

export type Hall = {
  id: string;
  name: string;
  capacity: number;
  price: number | null;
};

export type Venue = {
  id: number;
  ownerId?: number | null;
  name: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  hours: string;
  description: string;
  minGuests: number;
  maxGuests: number;
  priceFrom: number | null;
  image?: string | null;
  gallery: string[];
  amenities: string[];
  halls: Hall[];
  menu: string[];
  rating: number;
  reviewCount: number;
  status?: ListingStatus | string;
  statusLabel?: string;
  bookingCount?: number;
  owner?: OwnerProfile;
  createdAt?: string;
};

export type Specialist = {
  id: number;
  userId?: number | null;
  name: string;
  categoryId: string;
  category?: string;
  region: string;
  district?: string;
  phone: string;
  priceFrom: number | null;
  rating: number;
  reviewCount: number;
  image?: string | null;
  bio: string;
  featured?: boolean;
  status?: ListingStatus | string;
  statusLabel?: string;
  createdAt?: string;
};

export type SpecialistCategory = {
  id: string;
  name: string;
  short: string;
  icon: string;
  active?: boolean;
  sortOrder?: number;
  count?: number;
};

export type Booking = {
  id: number;
  venueId: number;
  venueName?: string;
  image?: string | null;
  region?: string;
  session: SessionId;
  date: string;
  guests: number;
  name: string;
  phone: string;
  note: string;
  status: BookingStatus | string;
  statusLabel?: string;
  createdAt?: string;
};

export type Review = {
  id: number;
  target: "venue" | "specialist";
  targetId?: number;
  venueId?: number | null;
  specialistId?: number | null;
  venueName?: string;
  specialistName?: string;
  name: string;
  rating: number;
  text: string;
  reply?: string | null;
  createdAt?: string;
};

export type PlatformSettings = {
  name: string;
  supportEmail: string;
  phone: string;
  address: string;
  autoApproveVenues: boolean;
  autoApproveSpecialists: boolean;
  maintenanceMode: boolean;
};
