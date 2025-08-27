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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { th } from '@/lib/i18n';

interface DateRangePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { checkIn: string; checkOut: string; guests: number }) => void;
  unavailableDates?: string[];
}

export default function DateRangePicker({ 
  open, 
  onOpenChange, 
  onConfirm,
  unavailableDates = []
}: DateRangePickerProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const handleConfirm = () => {
    if (checkIn && checkOut && guests) {
      onConfirm({ checkIn, checkOut, guests });
      onOpenChange(false);
    }
  };

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMinCheckOut = () => {
    if (checkIn) {
      const date = new Date(checkIn);
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
    }
    return getTomorrow();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{th.selectDatesAndBook}</DialogTitle>
          <DialogDescription>
            เลือกวันที่เข้าพักและออก พร้อมจำนวนแขก
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkin">{th.checkIn}</Label>
              <Input
                id="checkin"
                type="date"
                value={checkIn}
                min={getTomorrow()}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="checkout">{th.checkOut}</Label>
              <Input
                id="checkout"
                type="date"
                value={checkOut}
                min={getMinCheckOut()}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>{th.guests}</Label>
            <Select value={guests.toString()} onValueChange={(value) => setGuests(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 แขก</SelectItem>
                <SelectItem value="2">2 แขก</SelectItem>
                <SelectItem value="3">3 แขก</SelectItem>
                <SelectItem value="4">4 แขก</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {th.cancel}
          </Button>
          <Button onClick={handleConfirm} disabled={!checkIn || !checkOut}>
            {th.confirmBooking}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}