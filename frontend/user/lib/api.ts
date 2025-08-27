import { Room, Package, Booking, User, Payment, SearchFilters } from '@/types';
import { mockRooms, mockPackages, mockBookings } from './mock-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth APIs
export const authAPI = {
  register: async (data: { name: string; email: string; password: string }): Promise<User> => {
    await delay(1000);
    return {
      id: '1',
      name: data.name,
      email: data.email,
    };
  },

  login: async (data: { email: string; password: string }): Promise<User> => {
    await delay(1000);
    return {
      id: '1',
      name: 'John Doe',
      email: data.email,
    };
  },

  me: async (): Promise<User> => {
    await delay(500);
    return {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    };
  },
};

// Room APIs
export const roomAPI = {
  getAvailable: async (filters: SearchFilters): Promise<Room[]> => {
    await delay(1000);
    return mockRooms.filter(room => {
      if (filters.guests && room.maxGuests < filters.guests) return false;
      if (filters.roomType && room.type !== filters.roomType) return false;
      if (filters.minPrice && room.price < filters.minPrice) return false;
      if (filters.maxPrice && room.price > filters.maxPrice) return false;
      return true;
    });
  },

  getAll: async (page = 1, limit = 10): Promise<{ rooms: Room[]; total: number }> => {
    await delay(800);
    return {
      rooms: mockRooms,
      total: mockRooms.length,
    };
  },

  getById: async (id: string): Promise<Room | null> => {
    await delay(500);
    return mockRooms.find(room => room.id === id) || null;
  },
};

// Package APIs
export const packageAPI = {
  getActive: async (): Promise<Package[]> => {
    await delay(500);
    return mockPackages.filter(pkg => pkg.active);
  },
};

// Booking APIs
export const bookingAPI = {
  create: async (data: {
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    contactDetails: any;
  }): Promise<Booking> => {
    await delay(1000);
    const room = mockRooms.find(r => r.id === data.roomId);
    if (!room) throw new Error('Room not found');

    return {
      id: Date.now().toString(),
      userId: '1',
      roomId: data.roomId,
      room,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      guests: data.guests,
      totalAmount: room.price * 2, // Simplified calculation
      status: 'PENDING_PAYMENT' as any,
      contactDetails: data.contactDetails,
      createdAt: new Date().toISOString(),
    };
  },

  getMyBookings: async (): Promise<Booking[]> => {
    await delay(800);
    return mockBookings;
  },

  attachPayment: async (bookingId: string, paymentId: string): Promise<Booking> => {
    await delay(1000);
    const booking = mockBookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    return {
      ...booking,
      paymentId,
      status: 'AWAITING_REVIEW' as any,
    };
  },
};

// Payment APIs
export const paymentAPI = {
  uploadSlip: async (file: File, bookingId: string): Promise<Payment> => {
    await delay(1500);
    return {
      id: Date.now().toString(),
      bookingId,
      amount: 2400,
      slipUrl: URL.createObjectURL(file),
      status: 'PENDING' as any,
      createdAt: new Date().toISOString(),
    };
  },
};