import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import UploadSlip from '@/components/Booking/UploadSlip';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Users, MapPin } from 'lucide-react';
import { roomAPI, bookingAPI, paymentAPI } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { th } from '@/lib/i18n';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  name: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('กรุณาใส่อีเมลที่ถูกต้อง'),
  phone: z.string().min(10, 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก'),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
  });

  useEffect(() => {
    const stored = localStorage.getItem('pendingBooking');
    if (stored) {
      setBookingData(JSON.parse(stored));
    } else {
      router.push('/rooms');
    }
  }, []);

  const { data: room } = useQuery({
    queryKey: ['room', bookingData?.roomId],
    queryFn: () => roomAPI.getById(bookingData.roomId),
    enabled: !!bookingData?.roomId,
  });

  const calculateNights = () => {
    if (!bookingData) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!room) return 0;
    return room.price * calculateNights();
  };

  const onSubmit = async (formData: CheckoutForm) => {
    if (!paymentSlip) {
      toast.error('กรุณาอัปโหลดสลิปการโอนเงิน');
      return;
    }

    if (!bookingData || !room) return;

    setIsSubmitting(true);
    try {
      // 1. Create booking
      const booking = await bookingAPI.create({
        roomId: bookingData.roomId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        contactDetails: formData,
      });

      // 2. Upload payment slip
      const payment = await paymentAPI.uploadSlip(paymentSlip, booking.id);

      // 3. Attach payment to booking
      await bookingAPI.attachPayment(booking.id, payment.id);

      // Clear pending booking data
      localStorage.removeItem('pendingBooking');

      toast.success(th.bookingSuccess);
      router.push(`/booking/success?bookingId=${booking.id}`);
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingData || !room) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">ไม่พบข้อมูลการจอง</h1>
            <Button onClick={() => router.push('/rooms')}>
              กลับไปเลือกห้องพัก
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-center mb-12">ยืนยันการจอง</h1>

            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
              {/* Booking Summary */}
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>สรุปการจอง</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                        <div>
                          <h3 className="font-semibold">{room.name}</h3>
                          <p className="text-sm text-gray-600">{room.description}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-semibold">วันที่เข้าพัก - ออก</p>
                          <p className="text-sm text-gray-600">
                            {new Date(bookingData.checkIn).toLocaleDateString('th-TH')} - {' '}
                            {new Date(bookingData.checkOut).toLocaleDateString('th-TH')}
                          </p>
                          <p className="text-sm text-gray-600">
                            {calculateNights()} {th.nights}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-semibold">จำนวนแขก</p>
                          <p className="text-sm text-gray-600">
                            {bookingData.guests} แขก
                          </p>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>฿{room.price.toLocaleString()} × {calculateNights()} คืน</span>
                          <span>฿{calculateTotal().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg">
                          <span>ยอดรวม</span>
                          <span>฿{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>{th.contactDetails}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">{th.name}</Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="กรุณาใส่ชื่อ"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">{th.email}</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          placeholder="กรุณาใส่อีเมล"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="phone">{th.phone}</Label>
                        <Input
                          id="phone"
                          {...register('phone')}
                          placeholder="กรุณาใส่เบอร์โทรศัพท์"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="notes">{th.notes}</Label>
                        <Textarea
                          id="notes"
                          {...register('notes')}
                          placeholder="หมายเหตุเพิ่มเติม (ไม่บังคับ)"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>{th.paymentSlip}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UploadSlip
                        onFileSelect={setPaymentSlip}
                        currentFile={paymentSlip}
                      />
                    </CardContent>
                  </Card>

                  <Button
                    type="submit"
                    className="w-full text-lg py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'กำลังจอง...' : th.confirmBooking}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}