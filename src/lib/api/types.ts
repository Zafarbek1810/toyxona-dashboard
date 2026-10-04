export type AuthRole = "customer" | "seller" | "admin";

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
  seller?: Seller | null;
  settings?: CustomerSettings;
  createdAt?: string;
};

export type CustomerSettings = {
  orderUpdates: boolean;
  promoEmails: boolean;
  smsAlerts: boolean;
  language: string;
  currency: string;
};

export type Seller = {
  id: number;
  userId?: number;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  slug: string;
  logo?: string | null;
  description?: string | null;
  verified: boolean;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  rating?: number;
  reviewCount?: number;
  productCount?: number;
  ordersCount?: number;
  subscription?: string;
  planId?: string;
  sales?: number;
  salesTotal?: number;
  status?: string;
  workingHours?: string;
  joined?: string;
  createdAt?: string;
  daysLeft?: number | null;
  delivery?: {
    minOrderAmount: number;
    deliveryTimeframe: string;
    freeDeliveryThreshold: number;
  };
  notifications?: {
    newOrder: boolean;
    newReview: boolean;
    lowStock: boolean;
    paymentConfirmed: boolean;
  };
};

export type Category = {
  id: number;
  name: string;
  icon?: string | null;
  color: string;
  bg: string;
  count?: number;
  active?: boolean;
  subcategories?: SubCategory[];
};

export type SubCategory = {
  id: number;
  name: string;
  icon?: string | null;
  active?: boolean;
  count?: number;
};

export type Product = {
  id: number;
  name: string;
  brand?: string | null;
  description?: string;
  category?: string;
  categoryId?: number;
  subCategory?: string | null;
  subCategoryId?: number | null;
  price: number;
  oldPrice?: number | null;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  image?: string | null;
  images?: string[];
  seller?: Seller;
  sellerId?: number;
  location?: string | null;
  stock?: number;
  views?: number;
  orders?: number;
  status?: string;
  statusLabel?: string;
  moderationStatus?: string;
  specs?: Record<string, string>;
  sku?: string | null;
  createdAt?: string;
};

export type OrderStatus =
  | "new"
  | "confirmed"
  | "preparing"
  | "shipping"
  | "delivered"
  | "cancelled";

export type Order = {
  id: number;
  orderNumber: string;
  status: OrderStatus | string;
  statusLabel?: string;
  total: number;
  price?: number;
  subtotal?: number;
  deliveryFee?: number;
  discountAmount?: number;
  paymentMethod: string;
  paymentStatus?: string;
  deliveryMethod?: string;
  address: string;
  region?: string;
  recipientName?: string;
  recipientPhone?: string;
  date?: string;
  createdAt?: string;
  reviewed?: boolean;
  product?: { id: number; name: string; image?: string | null; price: number };
  seller?: Seller;
  items?: OrderItem[];
  customer?: { id: number; name: string; phone: string; email?: string | null };
};

export type OrderItem = {
  id: number;
  productId: number;
  name: string;
  image?: string | null;
  unitPrice: number;
  quantity: number;
  product?: Product;
};

export type Address = {
  id: number;
  title: string;
  fullName: string;
  phone: string;
  region: string;
  address: string;
  isDefault: boolean;
};

export type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt?: string;
  time?: string;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  color: string;
  popular?: boolean;
  features: string[];
  limits: string;
  productLimit?: number;
  subscribers?: number;
  active?: boolean;
};

export type CartResponse = {
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    product: Product;
    lineTotal: number;
  }>;
  subtotal: number;
  count: number;
};

export type HomeData = {
  categories: Category[];
  feeds: {
    recommended: Product[];
    newest: Product[];
    onSale: Product[];
  };
  sellers: Seller[];
  promotions: unknown[];
  stats: { products: number; sellers: number; customers: number };
  regions: string[];
};
