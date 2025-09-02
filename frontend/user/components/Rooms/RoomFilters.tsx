import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RoomType, SearchFilters } from '@/types';
import { th } from '@/lib/i18n';

interface RoomFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const amenitiesList = ['WiFi', 'แอร์', 'ทีวี', 'ตู้เย็น', 'ระเบียง', 'วิวทะเล'];

function sanitize(filters: SearchFilters): SearchFilters {
  const out: SearchFilters = {};
  if (filters.checkIn) out.checkIn = filters.checkIn;
  if (filters.checkOut) out.checkOut = filters.checkOut;
  if (typeof filters.guests === 'number' && Number.isFinite(filters.guests) && filters.guests > 0) {
    out.guests = filters.guests;
  }
  if (typeof filters.minPrice === 'number' && Number.isFinite(filters.minPrice)) {
    out.minPrice = filters.minPrice;
  }
  if (typeof filters.maxPrice === 'number' && Number.isFinite(filters.maxPrice)) {
    out.maxPrice = filters.maxPrice;
  }
  if (filters.roomType) out.roomType = filters.roomType;
  if (Array.isArray(filters.amenities) && filters.amenities.length > 0) {
    out.amenities = filters.amenities;
  }
  return out;
}

export default function RoomFilters({ filters, onFiltersChange }: RoomFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(sanitize(localFilters));
  };

  const handleClearFilters = () => {
    const empty: SearchFilters = {};
    setLocalFilters(empty);
    onFiltersChange(empty);
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const current = localFilters.amenities || [];
    const next = checked ? Array.from(new Set([...current, amenity])) : current.filter(a => a !== amenity);
    setLocalFilters({ ...localFilters, amenities: next });
  };

  const setNumber = (key: 'guests' | 'minPrice' | 'maxPrice') => (v: string) => {
    if (v === '' || v === undefined) {
      const next = { ...localFilters };
      delete (next as any)[key];
      setLocalFilters(next);
      return;
    }
    const n = Number(v);
    setLocalFilters({ ...localFilters, [key]: Number.isFinite(n) ? n : undefined });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{th.filters}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>{th.checkIn}</Label>
            <Input
              type="date"
              value={localFilters.checkIn || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, checkIn: e.target.value || undefined })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label>{th.checkOut}</Label>
            <Input
              type="date"
              value={localFilters.checkOut || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, checkOut: e.target.value || undefined })}
              min={localFilters.checkIn || new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <Label>{th.numberOfGuests}</Label>
            <Select
              value={localFilters.guests?.toString() || ''}
              onValueChange={(value) => setNumber('guests')(value)}
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

          <div>
            <Label>{th.roomType}</Label>
            <Select
              value={localFilters.roomType || ''}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, roomType: (value as RoomType) || undefined })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภทห้อง" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RoomType.STANDARD}>Standard</SelectItem>
                <SelectItem value={RoomType.DELUXE}>Deluxe</SelectItem>
                <SelectItem value={RoomType.SUITE}>Suite</SelectItem>
                <SelectItem value={RoomType.VILLA}>Villa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>ราคาต่ำสุด</Label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters.minPrice ?? ''}
                onChange={(e) => setNumber('minPrice')(e.target.value)}
                min={0}
              />
            </div>
            <div>
              <Label>ราคาสูงสุด</Label>
              <Input
                type="number"
                placeholder="10000"
                value={localFilters.maxPrice ?? ''}
                onChange={(e) => setNumber('maxPrice')(e.target.value)}
                min={0}
              />
            </div>
          </div>

          <div>
            <Label>{th.facilities}</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    checked={(localFilters.amenities || []).includes(amenity)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity, !!checked)}
                  />
                  <Label className="text-sm">{amenity}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={handleApplyFilters} className="flex-1">
            {th.applyFilters}
          </Button>
          <Button variant="outline" onClick={handleClearFilters}>
            {th.clearFilters}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
