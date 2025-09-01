import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Square } from 'lucide-react';
import { th } from '@/lib/i18n';

type AnyRoom = {
  id?: string;
  _id?: string;
  name?: string;
  type?: string;
  description?: string;
  images?: string[];
  amenities?: string[];
  price?: number;
  pricePerNight?: number;
  maxGuests?: number;
  capacity?: number;
  size?: number;
  area?: number;
};

const fallbackImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjQwJyBoZWlnaHQ9JzM2MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPScjZWVlZWVlJy8+PC9zdmc+';

export default function RoomCard({ room }: { room: AnyRoom }) {
  const id = room.id || room._id || '';
  const name = room.name || room.type || 'Room';
  const type = room.type || '';
  const images = Array.isArray(room.images) ? room.images : [];
  const imgSrc = images[0] || fallbackImg;
  const description = room.description || '';
  const amenities = Array.isArray(room.amenities) ? room.amenities : [];
  const priceNum = Number((room as any).price ?? (room as any).pricePerNight ?? 0);
  const guests = Number((room as any).maxGuests ?? (room as any).capacity ?? 0);
  const size = Number((room as any).size ?? (room as any).area ?? 0);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image src={imgSrc} alt={name} fill className="object-cover" />
        {type ? <Badge className="absolute top-2 right-2">{type}</Badge> : null}
      </div>

      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        {description ? (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {description}
          </p>
        ) : null}

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{guests || "-"} แขก</span>
          </div>
          <div className="flex items-center space-x-1">
            <Square className="h-4 w-4" />
            <span>{size || "-"} ตร.ม.</span>
          </div>
        </div>

        {amenities.length > 0 ? (
          <div className="flex flex-wrap gap-1 mb-3">
            {amenities.slice(0, 3).map((a) => (
              <Badge key={a} variant="secondary" className="text-xs">
                {a}
              </Badge>
            ))}
            {amenities.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{amenities.length - 3}
              </Badge>
            )}
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-lg font-bold text-primary">
          ฿{priceNum.toLocaleString()}
          <span className="text-sm text-gray-500 font-normal">
            /{th.pricePerNight.split("/")[1]}
          </span>
        </div>
        <Link href={id ? `/rooms/${id}` : "#"}>
          <Button size="sm">{th.view}</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
