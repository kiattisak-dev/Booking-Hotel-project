// pages/admin/rooms/new.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { withAdminAuth } from '@/lib/auth-guards';
import { apiFetch } from '@/lib/api';

const roomSchema = z.object({
  code: z.string().min(1, 'Room code is required'),
  name: z.string().min(1, 'Room name is required'),
  type: z.enum(['Standard', 'Deluxe', 'Suite']),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  bedType: z.string().min(1, 'Bed type is required'),
  pricePerNight: z.number().min(0, 'Price must be non-negative'),
  description: z.string().min(1, 'Description is required'),
  amenities: z.string().optional(),
  status: z.enum(['active', 'inactive']),
});

type RoomForm = z.infer<typeof roomSchema>;

function NewRoomPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<RoomForm>({
    resolver: zodResolver(roomSchema),
    defaultValues: { status: 'active', capacity: 1, pricePerNight: 0 },
  });

  const onSubmit = async (data: RoomForm) => {
    const amenities = data.amenities ? data.amenities.split(',').map(s => s.trim()).filter(Boolean) : [];
    await apiFetch("/api/rooms", {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        type: data.type,
        description: data.description,
        capacity: data.capacity,
        bedType: data.bedType,
        pricePerNight: data.pricePerNight,
        images: [],
        status: data.status === 'active' ? 'active' : 'inactive',
        rooms: [{ code: data.code, status: 'available', images: [] }],
        amenities
      })
    });
    router.push('/admin/rooms');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Add New Room</h1>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader><CardTitle>Room Information</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="code">Room Code</Label>
                    <Input id="code" placeholder="e.g., D101" {...register('code')} />
                    {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Room Name</Label>
                    <Input id="name" placeholder="e.g., Deluxe Double Room" {...register('name')} />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select onValueChange={(v) => setValue('type', v as any)}>
                      <SelectTrigger><SelectValue placeholder="Select room type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Deluxe">Deluxe</SelectItem>
                        <SelectItem value="Suite">Suite</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input id="capacity" type="number" min="1" {...register('capacity', { valueAsNumber: true })} />
                    {errors.capacity && <p className="text-sm text-red-600">{errors.capacity.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedType">Bed Type</Label>
                    <Input id="bedType" placeholder="e.g., Double, King, Twin" {...register('bedType')} />
                    {errors.bedType && <p className="text-sm text-red-600">{errors.bedType.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerNight">Price per Night</Label>
                    <Input id="pricePerNight" type="number" min="0" step="0.01" {...register('pricePerNight', { valueAsNumber: true })} />
                    {errors.pricePerNight && <p className="text-sm text-red-600">{errors.pricePerNight.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the room features and amenities..." rows={4} {...register('description')} />
                  {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities</Label>
                  <Textarea id="amenities" placeholder="Enter amenities separated by commas (e.g., WiFi, TV, Mini Bar)" rows={3} {...register('amenities')} />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select onValueChange={(v) => setValue('status', v as any)}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit">Create Room</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(NewRoomPage);
