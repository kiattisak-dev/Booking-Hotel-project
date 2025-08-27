import { useState } from 'react';
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
    if (!room) return;
    
    // Store booking data and redirect to checkout
    const bookingData = {
      roomId: room.id,
      ...data,
    };
    
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    router.push('/booking/checkout');
  };

  const amenityIcons: { [key: string]: React.ReactNode } = {
    'WiFi': <Wifi className="h-4 w-4" />,
    'แอร์': <Car className="h-4 w-4" />,
    'ทีวี': <Coffee className="h-4 w-4" />,
    'วิวทะเล': <Waves className="h-4 w-4" />,
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
            <Button onClick={() => router.push('/rooms')}>
              กลับไปดูห้องพักทั้งหมด
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <div className="relative h-96 lg:h-full">
              <img
                src={room.images[0]}
                alt={room.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {room.images.slice(1, 5).map((image, index) => (
                <div key={index} className="relative h-44">
                  <img
                    src={image}
                    alt={`${room.name} ${index + 2}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Room Details */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{room.name}</h1>
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {room.type}
                </Badge>
              </div>

              <p className="text-gray-600 text-lg mb-6">{room.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span>สูงสุด {room.maxGuests} แขก</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Square className="h-5 w-5 text-gray-500" />
                  <span>{room.size} ตร.ม.</span>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">{th.amenities}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {room.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      {amenityIcons[amenity] || <Coffee className="h-4 w-4" />}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary mb-2">
                      ฿{room.price.toLocaleString()}
                    </div>
                    <div className="text-gray-500">{th.pricePerNight}</div>
                  </div>

                  <Button 
                    onClick={handleBookingClick}
                    className="w-full text-lg py-6"
                    size="lg"
                  >
                    {th.selectDatesAndBook}
                  </Button>

                  <div className="mt-4 text-center text-sm text-gray-500">
                    ยังไม่มีการเรียกเก็บเงิน
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>

        {/* Date Range Picker Modal */}
        <DateRangePicker
          open={showDatePicker}
          onOpenChange={setShowDatePicker}
          onConfirm={handleDateConfirm}
          unavailableDates={room.unavailableDates}
        />
      </div>
    </Layout>
  );
}