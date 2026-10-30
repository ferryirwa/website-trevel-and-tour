export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  PACKAGES: "/packages",
  PACKAGE_DETAIL: (slug: string) => `/packages/${slug}`,
  BOOKING: "/booking",
  PAYMENT: "/payment",
  CONFIRMATION: "/confirmation",
  RATINGS: "/ratings",
  GALLERY: "/gallery",
  EXPERIENCES: "/experiences",
  CONTACT: "/contact",
  LOGIN: "/login",
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_HOME: "/admin/home",
  ADMIN_ABOUT: "/admin/about",
  ADMIN_PACKAGES: "/admin/packages",
  ADMIN_BOOKINGS: "/admin/bookings",
  ADMIN_RATINGS: "/admin/ratings",
  ADMIN_GALLERY: "/admin/gallery",
  ADMIN_EXPERIENCES: "/admin/experiences",
  ADMIN_CONTACT: "/admin/contact",
  ADMIN_USERS: "/admin/users",
} as const;

export const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1541868615250-7e00328bd3b3?w=800&q=80";
