import { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import DateRangePicker from '@/components/Rooms/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Square, Wifi, Car, Coffee, Waves } from 'lucide-react';
import { roomAPI } from '@/lib/api';
import { useAuth } from '@/store/useAuth';
import { th } from '@/lib/i18n';
import { toast } from 'sonner';

const fallbackImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjQwJyBoZWlnaHQ9JzM2MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjZWVlZWVlJy8+PC9zdmc+';

type SafeRoom = {
  id: string;
  name: string;
  type: string;
  description: string;
  images: string[];
  amenities: string[];
  price: number;
  maxGuests: number;
  size: number;
  unavailableDates: string[];
};

export default function RoomDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, setIntendedPath } = useAuth();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { data: room, isLoading } = useQuery({
    queryKey: ['room', id],
    queryFn: () => roomAPI.getById(id as string),
    enabled: !!id,
  });

  const safe = useMemo<SafeRoom>(() => {
    const r: any = room || {};
    const images: string[] = Array.isArray(r.images) && r.images.length ? (r.images as string[]) : [fallbackImg];
    return {
      id: r.id || r._id || '',
      name: r.name || r.type || 'Room',
      type: r.type || '',
      description: r.description || '',
      images,
      amenities: Array.isArray(r.amenities) ? (r.amenities as string[]) : [],
      price: Number(r.price ?? r.pricePerNight ?? 0),
      maxGuests: Number(r.maxGuests ?? r.capacity ?? 0),
      size: Number(r.size ?? r.area ?? 0),
      unavailableDates: Array.isArray(r.unavailableDates) ? (r.unavailableDates as string[]) : [],
    };
  }, [room]);

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      setIntendedPath(router.asPath);
      router.push('/login');
      toast.error(th.loginRequired);
      return;
    }
    setShowDatePicker(true);
  };

  const handleDateConfirm = (data: { checkIn: string; checkOut: string; guests: number }) => {
    if (!safe.id) return;
    const bookingData = { roomId: safe.id, ...data };
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    router.push('/booking/checkout');
  };

  const amenityIcons: { [key: string]: React.ReactNode } = {
    WiFi: <Wifi className="h-4 w-4" />,
    แอร์: <Car className="h-4 w-4" />,
    ทีวี: <Coffee className="h-4 w-4" />,
    วิวทะเล: <Waves className="h-4 w-4" />,
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-96 rounded-lg mb-8"></div>
            <div className="bg-gray-200 h-8 w-1/2 rounded mb-4"></div>
            <div className="bg-gray-200 h-4 w-3/4 rounded mb-8"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">ไม่พบห้องพักที่ต้องการ</h1>
            <Button onClick={() => router.push('/rooms')}>กลับไปดูห้องพักทั้งหมด</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <div className="relative h-96 lg:h-full">
              <img src={safe.images[0]} alt={safe.name} className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {safe.images.slice(1, 5).map((image: string, index: number) => (
                <div key={index} className="relative h-44">
                  <img src={image} alt={`${safe.name} ${index + 2}`} className="w-full h-full object-cover rounded-lg" />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{safe.name}</h1>
                {safe.type ? <Badge variant="outline" className="text-lg px-3 py-1">{safe.type}</Badge> : null}
              </div>

              {safe.description ? <p className="text-gray-600 text-lg mb-6">{safe.description}</p> : null}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span>สูงสุด {safe.maxGuests || '-'} แขก</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Square className="h-5 w-5 text-gray-500" />
                  <span>{safe.size || '-'} ตร.ม.</span>
                </div>
              </div>

              {safe.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">{th.amenities}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {safe.amenities.map((amenity: string) => (
                      <div key={amenity} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                        {amenityIcons[amenity] || <Coffee className="h-4 w-4" />}
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary mb-2">
                      ฿{safe.price.toLocaleString()}
                    </div>
                    <div className="text-gray-500">{th.pricePerNight}</div>
                  </div>

                  <Button onClick={handleBookingClick} className="w-full text-lg py-6" size="lg">
                    {th.selectDatesAndBook}
                  </Button>

                  <div className="mt-4 text-center text-sm text-gray-500">ยังไม่มีการเรียกเก็บเงิน</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        <DateRangePicker
          open={showDatePicker}
          onOpenChange={setShowDatePicker}
          onConfirm={handleDateConfirm}
          unavailableDates={safe.unavailableDates}
        />
      </div>
    </Layout>
  );
}
