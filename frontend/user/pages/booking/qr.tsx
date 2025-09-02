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

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [finalAmount, setFinalAmount] = useState<number>(0);

  const PROMPTPAY_ID = process.env.NEXT_PUBLIC_PROMPTPAY_ID || '';

  useEffect(() => {
    const storedBooking = localStorage.getItem('pendingBooking');
    const storedContact = localStorage.getItem('pendingContact');
    const pkg = localStorage.getItem('selectedPackageId');
    if (!storedBooking || !storedContact) {
      router.push('/booking/checkout');
      return;
    }
    setBookingData(JSON.parse(storedBooking));
    setContact(JSON.parse(storedContact));
    if (pkg) setSelectedPackageId(pkg);
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
    const calc = async () => {
      if (!bookingData || !bookingData.roomId || !bookingData.checkIn || !bookingData.checkOut) {
        setFinalAmount(total);
        setDiscount(0);
        return;
      }
      if (!selectedPackageId) {
        setFinalAmount(total);
        setDiscount(0);
        return;
      }
      try {
        const res = await apiFetch<{ total: number; discount: number; finalTotal: number }>(
          "/api/packages/apply",
          {
            method: "POST",
            body: JSON.stringify({
              packageId: selectedPackageId,
              roomTypeId: bookingData.roomId,
              checkIn: bookingData.checkIn,
              checkOut: bookingData.checkOut,
            }),
          }
        );
        setDiscount(Number(res.discount || 0));
        setFinalAmount(Number(res.finalTotal || total));
      } catch {
        setDiscount(0);
        setFinalAmount(total);
      }
    };
    calc();
  }, [selectedPackageId, bookingData?.roomId, bookingData?.checkIn, bookingData?.checkOut, total]);

  useEffect(() => {
    const fetchQR = async () => {
      if (!bookingData || !room || !PROMPTPAY_ID || !finalAmount) return;
      try {
        const res = await apiFetch<{ payload: string; qrcodeDataUrl: string }>(
          `/api/payments/qr?pp=${encodeURIComponent(PROMPTPAY_ID)}&amount=${encodeURIComponent(finalAmount)}`
        );
        setQrPayload(res.payload || '');
        setQrDataUrl(res.qrcodeDataUrl || '');
      } catch (e: any) {
        toast.error(e?.message || 'สร้าง QR ไม่สำเร็จ');
      }
    };
    fetchQR();
  }, [bookingData, room, finalAmount, PROMPTPAY_ID]);

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

      await paymentAPI.uploadSlip(paymentSlip, bookingId, finalAmount);

      localStorage.removeItem('pendingBooking');
      localStorage.removeItem('pendingContact');
      localStorage.removeItem('selectedPackageId');

      router.push(`/booking/success?bookingId=${bookingId}`);
    } catch {
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

            <div className="lg:grid lg:grid-cols-2 lg:gap-8">
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
                          <h3 className="font-semibold">{(room as any)?.name}</h3>
                          <p className="text-sm text-gray-600">{(room as any)?.description}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-semibold">วันที่เข้าพัก - ออก</p>
                          <p className="text-sm text-gray-600">
                            {new Date(bookingData.checkIn).toLocaleDateString('th-TH')} -{' '}
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
                          <span>฿{nightlyPrice.toLocaleString()} × {calculateNights()} คืน</span>
                          <span>฿{total.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-green-700">
                            <span>ส่วนลดแพ็กเกจ</span>
                            <span>-฿{discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-semibold text-lg">
                          <span>ยอดรวมชำระ</span>
                          <span>฿{finalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="h-5 w-5" />
                      ชำระเงินผ่าน PromptPay
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {qrDataUrl ? (
                        <div className="flex flex-col items-center">
                          <img src={qrDataUrl} alt="PromptPay QR" className="w-56 h-56 rounded border" />
                          <div className="mt-3 text-sm text-gray-600">
                            พร้อมเพย์: {PROMPTPAY_ID} | จำนวนเงิน: ฿{finalAmount.toLocaleString()}
                          </div>
                          {qrPayload && (
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(qrPayload).then(() => toast.success('คัดลอก Payload แล้ว'))}
                              className="inline-flex items-center gap-2 mt-3 text-blue-600 hover:underline"
                            >
                              <Copy className="h-4 w-4" />
                              คัดลอก Payload
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          กำลังเตรียม QR...
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>{th.paymentSlip}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UploadSlip onFileSelect={setPaymentSlip} currentFile={paymentSlip} />
                    <p className="text-xs text-gray-500 mt-2">
                      แนบสลิปหลังโอนเงินตาม QR ข้างต้น
                    </p>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => router.push('/booking/checkout')}>
                    แก้ไขข้อมูลติดต่อ
                  </Button>
                  <Button type="button" className="flex-1" onClick={onConfirmBooking} disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังจอง...' : th.confirmBooking}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
