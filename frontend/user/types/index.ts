export interface Room {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  maxGuests: number;
  size: number;
  type: RoomType;
  amenities: string[];
  unavailableDates: string[];
}

export interface Package {
  id: string;
  name: string;
  description: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  active: boolean;
  validUntil: string;
}

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  token?: string;      // เพิ่มสำหรับถือ JWT จาก /login
  role?: UserRole;     // เผื่อ backend ส่ง role กลับมา
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  room: Room;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: BookingStatus;
  contactDetails: ContactDetails;
  paymentId?: string;
  createdAt: string;
}

export interface ContactDetails {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  slipUrl: string;
  status: PaymentStatus;
  createdAt: string;
}

export enum RoomType {
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE',
  VILLA = 'VILLA',
}

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  AWAITING_REVIEW = 'AWAITING_REVIEW',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export interface SearchFilters {
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  roomType?: RoomType;
  amenities?: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  intendedPath: string | null;
  login: (user: User) => void;
  logout: () => void;
  setIntendedPath: (path: string) => void;
}
