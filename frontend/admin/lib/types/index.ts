export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  type: 'Standard' | 'Deluxe' | 'Suite';
  capacity: number;
  bedType: string;
  pricePerNight: number;
  description: string;
  amenities: string[];
  images: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price?: number;
  discountPercent?: number;
  validFrom: string;
  validTo: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  room: {
    id: string;
    code: string;
    name: string;
    type: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSlip {
  id: string;
  booking: {
    id: string;
    user: {
      email: string;
      firstName: string;
      lastName: string;
    };
    room: {
      code: string;
      name: string;
    };
    totalAmount: number;
  };
  slipImage: string;
  amount: number;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  submittedAt: string;
  processedAt?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  todayBookings: number;
  pendingSlips: number;
  occupancyRate: number;
  revenueChange: number;
  bookingsChange: number;
}