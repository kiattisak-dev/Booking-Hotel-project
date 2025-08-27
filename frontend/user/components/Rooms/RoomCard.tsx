import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Square } from 'lucide-react';
import { Room } from '@/types';
import { th } from '@/lib/i18n';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={room.images[0]}
          alt={room.name}
          fill
          className="object-cover"
        />
        <Badge className="absolute top-2 right-2">
          {room.type}
        </Badge>
      </div>

      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{room.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {room.description}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{room.maxGuests} แขก</span>
          </div>
          <div className="flex items-center space-x-1">
            <Square className="h-4 w-4" />
            <span>{room.size} ตร.ม.</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {room.amenities.slice(0, 3).map((amenity) => (
            <Badge key={amenity} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {room.amenities.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{room.amenities.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-lg font-bold text-primary">
          ฿{room.price.toLocaleString()}
          <span className="text-sm text-gray-500 font-normal">/{th.pricePerNight.split('/')[1]}</span>
        </div>
        <Link href={`/rooms/${room.id}`}>
          <Button size="sm">{th.view}</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}