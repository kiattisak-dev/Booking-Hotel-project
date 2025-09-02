import { Hotel, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Hotel className="h-8 w-8" />
            <span className="text-xl font-bold">Hotel Service Booking</span>
          </div>
          <p className="text-gray-300 mb-4 max-w-2xl">
            ระบบจองโรงแรมออนไลน์ที่ดีที่สุด พร้อมให้บริการคุณตลอด 24 ชั่วโมง
          </p>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2025 Hotel Booking. สงวนลิขสิทธิ์.</p>
        </div>
      </div>
    </footer>
  );
}
