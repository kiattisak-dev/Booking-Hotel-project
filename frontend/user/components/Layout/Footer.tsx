import { Hotel, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Hotel className="h-8 w-8" />
              <span className="text-xl font-bold">Hotel Booking</span>
            </div>
            <p className="text-gray-300 mb-4">
              ระบบจองโรงแรมออนไลน์ที่ดีที่สุด พร้อมให้บริการคุณตลอด 24 ชั่วโมง
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">ติดต่อเรา</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-gray-300">02-123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-gray-300">info@hotelbooking.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="text-gray-300">กรุงเทพมหานคร, ประเทศไทย</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">บริการ</h3>
            <ul className="space-y-2 text-gray-300">
              <li>จองห้องพัก</li>
              <li>แพ็คเกจท่องเที่ยว</li>
              <li>บริการลูกค้า</li>
              <li>นโยบายความเป็นส่วนตัว</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 Hotel Booking. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    </footer>
  );
}