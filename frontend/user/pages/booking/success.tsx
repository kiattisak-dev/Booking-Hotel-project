import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Phone } from 'lucide-react';

export default function BookingSuccess() {
  const router = useRouter();
  const { bookingId } = router.query;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-green-600 mb-4">
            จองสำเร็จ!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            ขอบคุณที่ใช้บริการของเรา การจองของคุณได้รับการส่งไปยังเจ้าหน้าที่เรียบร้อยแล้ว
          </p>

          <Card className="text-left mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>ขั้นตอนถัดไป</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-semibold">การตรวจสอบการชำระเงิน</p>
                  <p className="text-sm text-gray-600">
                    เจ้าหน้าที่จะตรวจสอบสลิปการโอนเงินของคุณภายใน 24 ชั่วโมง
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-gray-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-semibold">การยืนยันการจอง</p>
                  <p className="text-sm text-gray-600">
                    หากการชำระเงินถูกต้อง เราจะยืนยันการจองและส่งรายละเอียดให้คุณทางอีเมล
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="bg-gray-300 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-semibold">เตรียมตัวเข้าพัก</p>
                  <p className="text-sm text-gray-600">
                    คุณสามารถเข้าพักได้ตามวันที่ที่จองไว้
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-2">
              <Phone className="h-5 w-5 text-blue-500 mt-1" />
              <div className="text-left">
                <p className="font-semibold text-blue-800">ต้องการความช่วยเหลือ?</p>
                <p className="text-blue-600 text-sm">
                  โทร 02-123-4567 หรือ LINE: @hotelbooking
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => router.push('/account/reservations')}
              className="w-full"
            >
              ดูการจองของฉัน
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              กลับสู่หน้าหลัก
            </Button>
          </div>

          {bookingId && (
            <p className="text-sm text-gray-500 mt-4">
              รหัสการจอง: {bookingId}
            </p>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}