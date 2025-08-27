import { useState } from 'react';
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

export default function RoomFilters({ filters, onFiltersChange }: RoomFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    const currentAmenities = localFilters.amenities || [];
    const newAmenities = checked
      ? [...currentAmenities, amenity]
      : currentAmenities.filter(a => a !== amenity);

    setLocalFilters({
      ...localFilters,
      amenities: newAmenities,
    });
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
              onChange={(e) => setLocalFilters({ ...localFilters, checkIn: e.target.value })}
            />
          </div>

          <div>
            <Label>{th.checkOut}</Label>
            <Input
              type="date"
              value={localFilters.checkOut || ''}
              onChange={(e) => setLocalFilters({ ...localFilters, checkOut: e.target.value })}
            />
          </div>

          <div>
            <Label>{th.numberOfGuests}</Label>
            <Select
              value={localFilters.guests?.toString()}
              onValueChange={(value) => setLocalFilters({ ...localFilters, guests: parseInt(value) })}
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
              value={localFilters.roomType}
              onValueChange={(value) => setLocalFilters({ ...localFilters, roomType: value as RoomType })}
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
                value={localFilters.minPrice || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, minPrice: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label>ราคาสูงสุด</Label>
              <Input
                type="number"
                placeholder="10000"
                value={localFilters.maxPrice || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: parseInt(e.target.value) })}
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