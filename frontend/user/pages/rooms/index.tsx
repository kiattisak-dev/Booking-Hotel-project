import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import RoomCard from '@/components/Rooms/RoomCard';
import RoomFilters from '@/components/Rooms/RoomFilters';
import { roomAPI } from '@/lib/api';
import { SearchFilters } from '@/types';
import { th } from '@/lib/i18n';

function hasActiveFilters(f: SearchFilters) {
  if (!f) return false;
  if (f.guests && f.guests > 0) return true;
  if (f.minPrice || f.maxPrice) return true;
  if (f.roomType) return true;
  if (Array.isArray(f.amenities) && f.amenities.length > 0) return true;
  // วันที่ backend ยังไม่ใช้เช็คความว่างจริง แต่ไม่ถือเป็นตัวตัดสิน filter active
  return false;
}

function toAvailableParams(f: SearchFilters) {
  const out: Record<string, any> = {};
  if (f.guests) out.guests = f.guests;
  if (f.minPrice) out.minPrice = f.minPrice;
  if (f.maxPrice) out.maxPrice = f.maxPrice;
  if (f.roomType) out.roomType = f.roomType;
  if (Array.isArray(f.amenities) && f.amenities.length) {
    out.amenities = f.amenities.join(',');
  }
  // ส่ง checkIn/checkOut ไปด้วยได้ เผื่อ backend ใช้ภายหลัง (ไม่มีผลตอนนี้)
  if (f.checkIn) out.checkIn = f.checkIn;
  if (f.checkOut) out.checkOut = f.checkOut;
  return out;
}

export default function Rooms() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);

  const active = useMemo(() => hasActiveFilters(filters), [filters]);

  const { data, isLoading } = useQuery({
    queryKey: ['rooms-list', active ? 'filtered' : 'all', filters, page],
    queryFn: async () => {
      if (active) {
        // เรียก /available พร้อม params ที่ sanitize แล้ว
        const params = toAvailableParams(filters);
        const list = await roomAPI.getAvailable(params as any);
        return { mode: 'filtered', rooms: list, total: list.length } as {
          mode: 'filtered';
          rooms: any[];
          total: number;
        };
      } else {
        // เรียกหน้า list ปกติ
        const res = await roomAPI.getAll(page, 10);
        return { mode: 'all', rooms: res.rooms || [], total: res.total || 0 } as {
          mode: 'all';
          rooms: any[];
          total: number;
        };
      }
    },
  });

  const displayRooms = data?.rooms || [];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-center mb-12">{th.rooms}</h1>

          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <RoomFilters
                  filters={filters}
                  onFiltersChange={(next) => {
                    setPage(1);
                    setFilters(next);
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-3 mt-8 lg:mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">
                      แสดง {displayRooms.length}{' '}
                      {data?.mode === 'all' && typeof data?.total === 'number'
                        ? `จากทั้งหมด ${data.total} ห้อง`
                        : 'ห้อง'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayRooms.map((room: any, index: number) => (
                      <motion.div
                        key={room.id || room._id || `${room.type}-${room.code || index}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.06 }}
                      >
                        <RoomCard room={{ ...room, name: room.name || room.type }} />
                      </motion.div>
                    ))}
                  </div>

                  {displayRooms.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg">
                        ไม่พบห้องพักที่ตรงกับเงื่อนไขที่เลือก
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
