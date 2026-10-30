export type MediaType = 'IMAGE' | 'VIDEO';
export type GalleryCategory = 'NATURE' | 'ACTIVITY' | 'FACILITY' | 'VIDEO';
export type BookingStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type RatingSource = 'GOOGLE' | 'TRIPADVISOR';
export type ExperienceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PackageStatus = 'DRAFT' | 'ACTIVE';

export interface TourType {
  id: string;
  nameEn: string;
  nameId: string;
  slug: string;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Package {
  id: string;
  typeId: string;
  locationId: string;
  nameEn: string;
  nameId: string;
  slug: string;
  descriptionEn: string;
  descriptionId: string;
  durationHours: number;
  price: string;
  maxGuests: number;
  status: PackageStatus;
  type?: TourType;
  location?: Location;
  media?: { url: string; type: MediaType }[];
  itineraries?: { time: string; description: string }[];
  includes?: { item: string }[];
  excludes?: { item: string }[];
}

export interface GalleryItem {
  id: string;
  url: string;
  type: MediaType;
  category: GalleryCategory;
  caption?: string;
}

export interface GuestExperience {
  id: string;
  guestName: string;
  guestEmail?: string;
  country: string;
  verifiedVia: RatingSource;
  rating: number;
  story: string;
  status: ExperienceStatus;
  createdAt: string;
  media?: { url: string; type: MediaType }[];
}

export interface Booking {
  id: string;
  bookingCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string;
  bookingDate: string;
  timeSlot: string;
  adults: number;
  children: number;
  totalAmount: string;
  status: BookingStatus;
  notes?: string;
  package?: Package;
}

export interface RatingSnapshot {
  source: RatingSource;
  score: string;
  totalReviews: number;
  fetchedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER' | 'EDITOR' | 'BOOKING';
  isActive: boolean;
}