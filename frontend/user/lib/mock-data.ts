import { Room, Package, Booking, RoomType, BookingStatus } from '@/types';

export const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Standard Twin Room',
    description: 'ห้องสแตนดาร์ดขนาดกะทัดรัด เหมาะสำหรับผู้เดินทาง 1-2 คน',
    images: [
      'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
    ],
    price: 1200,
    maxGuests: 2,
    size: 25,
    type: RoomType.STANDARD,
    amenities: ['WiFi', 'แอร์', 'ทีวี', 'ตู้เย็น'],
    unavailableDates: ['2024-12-25', '2024-12-26'],
  },
  {
    id: '2',
    name: 'Deluxe Ocean View',
    description: 'ห้องดีลักซ์วิวทะเล พร้อมระเบียงส่วนตัว',
    images: [
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg',
      'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg',
    ],
    price: 2500,
    maxGuests: 3,
    size: 35,
    type: RoomType.DELUXE,
    amenities: ['WiFi', 'แอร์', 'ทีวี', 'ตู้เย็น', 'ระเบียง', 'วิวทะเล'],
    unavailableDates: ['2024-12-31'],
  },
  {
    id: '3',
    name: 'Executive Suite',
    description: 'สวีทหรู พื้นที่กว้างขวาง เหมาะสำหรับครอบครัว',
    images: [
      'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg',
      'https://images.pexels.com/photos/2029731/pexels-photo-2029731.jpeg',
    ],
    price: 4500,
    maxGuests: 4,
    size: 60,
    type: RoomType.SUITE,
    amenities: ['WiFi', 'แอร์', 'ทีวี', 'ตู้เย็น', 'ห้องนั่งเล่น', 'ระเบียง', 'วิวทะเล'],
    unavailableDates: [],
  },
];

export const mockPackages: Package[] = [
  {
    id: '1',
    name: 'Weekend Getaway',
    description: 'แพ็คเกจพักผ่อนสุดสัปดาห์ 2 วัน 1 คืน',
    image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg',
    originalPrice: 3000,
    discountedPrice: 2400,
    active: true,
    validUntil: '2024-12-31',
  },
  {
    id: '2',
    name: 'Romantic Dinner',
    description: 'แพ็คเกจโรแมนติก รวมดินเนอร์แคนเดิลไลท์',
    image: 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg',
    originalPrice: 5000,
    discountedPrice: 3500,
    active: true,
    validUntil: '2024-12-31',
  },
];

export const mockBookings: Booking[] = [
  {
    id: '1',
    userId: 'user1',
    roomId: '1',
    room: mockRooms[0],
    checkIn: '2024-12-20',
    checkOut: '2024-12-22',
    guests: 2,
    totalAmount: 2400,
    status: BookingStatus.CONFIRMED,
    contactDetails: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '0812345678',
    },
    createdAt: '2024-12-01T10:00:00Z',
  },
];