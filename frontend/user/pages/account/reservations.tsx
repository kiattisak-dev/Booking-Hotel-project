import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import UploadSlip from '@/components/Booking/UploadSlip';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar, MapPin, Users, Upload } from 'lucide-react';
import { bookingAPI, paymentAPI } from '@/lib/api';
import { BookingStatus } from '@/types';
import { th } from '@/lib/i18n';
import { toast } from 'sonner';

export default function Reservations() {
  const [reuploadingBooking, setReuploadingBooking] = useState<string | null>(null);
  const [newSlip, setNewSlip] = useState<File | null>(null);

  const { data: bookings, isLoading, refetch } = useQuery({
    queryKey: ['myBookings'],
    queryFn: bookingAPI.getMyBookings,
  });

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING_PAYMENT:
        return 'bg-yellow-100 text-yellow-800';
      case BookingStatus.AWAITING_REVIEW:
        return 'bg-blue-100 text-blue-800';
      case BookingStatus.CONFIRMED:
        return 'bg-green-100 text-green-800';
      case BookingStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case BookingStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING_PAYMENT:
        return th.pendingPayment;
      case BookingStatus.AWAITING_REVIEW:
        return th.awaitingReview;
      case BookingStatus.CONFIRMED:
        return th.confirmed;
      case BookingStatus.REJECTED:
        return th.rejected;
      case BookingStatus.CANCELLED:
        return th.cancelled;
      default:
        return status;
    }
  };

  const handleReuploadSlip = async (bookingId: string) => {
    if (!newSlip) {
      toast.error('กรุณาเลือกไฟล์สลิป');
      return;
    }

    try {
      // Upload new slip
      const payment = await paymentAPI.uploadSlip(newSlip, bookingId);
      
      // Attach to booking
      await bookingAPI.attachPayment(bookingId, payment.id);
      
      toast.success('อัปโหลดสลิปใหม่สำเร็จ');
      setReuploadingBooking(null);
      setNewSlip(null);
      refetch();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการอัปโหลด');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <ProtectedRoute>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
              ))}
            </div>
          </div>
        </ProtectedRoute>
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
            <h1 className="text-3xl font-bold text-center mb-12">{th.myReservations}</h1>

            {bookings && bookings.length > 0 ? (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{booking.room.name}</CardTitle>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">วันที่เข้าพัก</p>
                              <p className="text-sm text-gray-600">
                                {new Date(booking.checkIn).toLocaleDateString('th-TH')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">วันที่ออก</p>
                              <p className="text-sm text-gray-600">
                                {new Date(booking.checkOut).toLocaleDateString('th-TH')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium">จำนวนแขก</p>
                              <p className="text-sm text-gray-600">{booking.guests} แขก</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold">
                              ฿{booking.totalAmount.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              จองเมื่อ {new Date(booking.createdAt).toLocaleDateString('th-TH')}
                            </p>
                          </div>

                          {booking.status === BookingStatus.REJECTED && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Upload className="h-4 w-4 mr-2" />
                                  {th.reuploadSlip}
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>อัปโหลดสลิปใหม่</DialogTitle>
                                  <DialogDescription>
                                    การจองของคุณถูกปฏิเสธ กรุณาอัปโหลดสลิปการโอนเงินใหม่
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <UploadSlip
                                    onFileSelect={setNewSlip}
                                    currentFile={newSlip}
                                  />
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => handleReuploadSlip(booking.id)}
                                      disabled={!newSlip}
                                    >
                                      อัปโหลด
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ยังไม่มีการจอง
                </h3>
                <p className="text-gray-600 mb-6">
                  เริ่มต้นการเดินทางของคุณด้วยการจองห้องพักกับเรา
                </p>
                <Button onClick={() => window.location.href = '/rooms'}>
                  ดูห้องพักทั้งหมด
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}