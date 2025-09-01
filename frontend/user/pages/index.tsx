// frontend/user/pages/index.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import RoomCard from "@/components/Rooms/RoomCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { roomAPI, packageAPI } from "@/lib/api";
import { SearchFilters } from "@/types";
import { th } from "@/lib/i18n";

const toNum = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const fmt = (n: unknown) => toNum(n).toLocaleString("th-TH");
const fallbackImg =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjQwJyBoZWlnaHQ9JzM2MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjZWVlZWVlJy8+PC9zdmc+";

export default function Home() {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const { data: availableRooms, isLoading: roomsLoading } = useQuery({
    queryKey: ["availableRooms", searchFilters],
    queryFn: () => roomAPI.getAvailable(searchFilters),
  });
  const { data: packages } = useQuery({
    queryKey: ["packages"],
    queryFn: packageAPI.getActive,
  });
  const handleSearch = () => {};

  return (
    <Layout>
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {th.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12">
              {th.heroSubtitle}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="checkin">{th.checkIn}</Label>
                    <Input
                      id="checkin"
                      type="date"
                      value={searchFilters.checkIn || ""}
                      onChange={(e) =>
                        setSearchFilters({
                          ...searchFilters,
                          checkIn: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkout">{th.checkOut}</Label>
                    <Input
                      id="checkout"
                      type="date"
                      value={searchFilters.checkOut || ""}
                      onChange={(e) =>
                        setSearchFilters({
                          ...searchFilters,
                          checkOut: e.target.value,
                        })
                      }
                      min={
                        searchFilters.checkIn ||
                        new Date().toISOString().split("T")[0]
                      }
                    />
                  </div>
                  <div>
                    <Label>{th.guests}</Label>
                    <Select
                      value={searchFilters.guests?.toString() || ""}
                      onValueChange={(value) =>
                        setSearchFilters({
                          ...searchFilters,
                          guests: parseInt(value),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกจำนวนแขก" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 แขก</SelectItem>
                        <SelectItem value="2">2 แขก</SelectItem>
                        <SelectItem value="3">3 แขก</SelectItem>
                        <SelectItem value="4">4 แขก</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleSearch} className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      {th.searchAvailable}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12">
              ห้องพักที่มีให้บริการ
            </h2>
            {roomsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 animate-pulse rounded-lg h-96"
                  />
                ))}
              </div>
            ) : !availableRooms || availableRooms.length === 0 ? (
              <div className="text-center text-gray-500">ไม่พบห้องว่าง</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableRooms.map((room: any, idx: number) => {
                  const safe = { ...room, name: room.name || room.type };
                  return (
                    <motion.div
                      key={room.id || room._id || `room-${idx}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <RoomCard room={safe} />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {packages && packages.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-3xl font-bold text-center mb-12">
                แพ็คเกจพิเศษ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.map((pkg, i) => {
                  const original = toNum((pkg as any).originalPrice);
                  const discounted = toNum((pkg as any).discountedPrice);
                  const hasPrices = original > 0 && discounted > 0;
                  const save = Math.max(original - discounted, 0);
                  return (
                    <motion.div
                      key={(pkg as any).id || (pkg as any)._id || `pkg-${i}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative h-48">
                          <img
                            src={(pkg as any).image || fallbackImg}
                            alt={(pkg as any).name}
                            onError={(e) =>
                              ((e.target as HTMLImageElement).src = fallbackImg)
                            }
                            className="w-full h-full object-cover"
                          />
                          {hasPrices && save > 0 && (
                            <Badge className="absolute top-2 right-2 bg-red-500">
                              ประหยัด ฿{fmt(save)}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-2">
                            {(pkg as any).name}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {(pkg as any).description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              {hasPrices ? (
                                <>
                                  <span className="text-lg line-through text-gray-400">
                                    ฿{fmt(original)}
                                  </span>
                                  <span className="text-2xl font-bold text-primary ml-2">
                                    ฿{fmt(discounted)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-2xl font-bold text-primary">
                                  ติดต่อพนักงาน
                                </span>
                              )}
                            </div>
                            <Button>เลือกแพ็คเกจ</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </Layout>
  );
}
