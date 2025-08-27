import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import RoomCard from '@/components/Rooms/RoomCard';
import RoomFilters from '@/components/Rooms/RoomFilters';
import { roomAPI } from '@/lib/api';
import { SearchFilters } from '@/types';
import { th } from '@/lib/i18n';

export default function Rooms() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);

  const { data: roomsData, isLoading } = useQuery({
    queryKey: ['rooms', filters, page],
    queryFn: () => roomAPI.getAll(page, 10),
  });

  const { data: filteredRooms } = useQuery({
    queryKey: ['filteredRooms', filters],
    queryFn: () => roomAPI.getAvailable(filters),
    enabled: Object.keys(filters).length > 0,
  });

  const displayRooms = filteredRooms || roomsData?.rooms || [];

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
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <RoomFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                />
              </div>
            </div>

            {/* Rooms Grid */}
            <div className="lg:col-span-3 mt-8 lg:mt-0">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96"></div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-gray-600">
                      แสดง {displayRooms.length} ห้อง
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayRooms.map((room, index) => (
                      <motion.div
                        key={room.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <RoomCard room={room} />
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