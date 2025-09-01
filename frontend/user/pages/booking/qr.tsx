import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import UploadSlip from '@/components/Booking/UploadSlip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Users, MapPin, QrCode, Copy } from 'lucide-react';
import { roomAPI, bookingAPI, paymentAPI, apiFetch } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { th } from '@/lib/i18n';
import { toast } from 'sonner';

export default function BookingQR() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);
  const [contact, setContact] = useState<any>(null);
  const [paymentSlip, setPaymentSlip] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrPayload, setQrPayload] = useState<string>('');

  const PROMPTPAY_ID = process.env.NEXT_PUBLIC_PROMPTPAY_ID || '';

  useEffect(() => {
    const storedBooking = localStorage.getItem('pendingBooking');
    const storedContact = localStorage.getItem('pendingContact');
    if (!storedBooking || !storedContact) {
      router.push('/booking/checkout');
      return;
    }
    setBookingData(JSON.parse(storedBooking));
    setContact(JSON.parse(storedContact));
  }, []);

  const { data: room } = useQuery({
    queryKey: ['room', bookingData?.roomId],
    queryFn: () => roomAPI.getById(bookingData.roomId),
    enabled: !!bookingData?.roomId,
  });

  const nightlyPrice = useMemo(
    () => Number((room as any)?.pricePerNight ?? (room as any)?.price ?? 0),
    [room]
  );

  const calculateNights = () => {
    if (!bookingData) return 0;
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const total = useMemo(() => {
    return Number(nightlyPrice) * Number(calculateNights() || 0);
  }, [nightlyPrice, bookingData]);

  useEffect(() => {
    const fetchQR = async () => {
      if (!bookingData || !room || !PROMPTPAY_ID || !total) return;
      try {
        const res = await apiFetch<{ payload: string; qrcodeDataUrl: string }>(
          `/api/payments/qr?pp=${encodeURIComponent(PROMPTPAY_ID)}&amount=${encodeURIComponent(total)}`
        );
        setQrPayload(res.payload || '');
        setQrDataUrl(res.qrcodeDataUrl || '');
      } catch (e: any) {
        toast.error(e?.message || 'สร้าง QR ไม่สำเร็จ');
      }
    };
    fetchQR();
  }, [bookingData, room, total, PROMPTPAY_ID]);

  const onConfirmBooking = async () => {
    if (!paymentSlip) {
      toast.error('กรุณาอัปโหลดสลิปการโอนเงิน');
      return;
    }
    if (!bookingData || !room || !contact) return;

    setIsSubmitting(true);
    try {
      const booking = await bookingAPI.create({
        roomId: bookingData.roomId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        contactDetails: contact,
      });

      const bookingId = (booking as any).id ?? (booking as any)._id;

      await paymentAPI.uploadSlip(paymentSlip, bookingId, total);

      localStorage.removeItem('pendingBooking');
      localStorage.removeItem('pendingContact');

      router.push(`/booking/success?bookingId=${bookingId}`);
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
            <Button onClick={() => router.push('/rooms')}>กลับไปเลือกห้องพัก</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl font-bold text-center mb-2">ชำระเงินและอัปโหลดสลิป</h1>
            <p className="text-center text-gray-500 mb-8">ขั้นตอน 2 / 2</p>
            {/* ... ส่วน UI อื่น ๆ คงเดิม ... */}
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.push('/booking/checkout')}>
                แก้ไขข้อมูลติดต่อ
              </Button>
              <Button type="button" className="flex-1" onClick={onConfirmBooking} disabled={isSubmitting}>
                {isSubmitting ? 'กำลังจอง...' : th.confirmBooking}
              </Button>
            </div>
          </motion.div>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
