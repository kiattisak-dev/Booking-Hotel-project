import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, Resolver } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImagePicker from "@/components/admin/ImagePicker";

const schema = z.object({
  capacity: z.coerce.number().min(0).optional(),
  bedType: z.string().optional(),
  pricePerNight: z.coerce.number().min(0).optional(),
  typeStatus: z.enum(["active", "inactive"]).optional(),
  roomStatus: z.enum(["available", "occupied", "maintenance", "inactive"]).optional(),
});

export type EditRoomInitial = {
  typeId: string;
  roomCode: string;
  type: string;
  capacity?: number;
  bedType?: string;
  pricePerNight?: number;
  typeStatus?: "active" | "inactive";
  roomStatus?: "available" | "occupied" | "maintenance" | "inactive";
  typeImages?: string[];
  roomImages?: string[];
};

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: EditRoomInitial | null;
  onSubmit: (vals: {
    capacity?: number;
    bedType?: string;
    pricePerNight?: number;
    typeStatus?: "active" | "inactive";
    roomStatus?: "available" | "occupied" | "maintenance" | "inactive";
    typeImages?: string[];
  }) => Promise<void>;
  submitting?: boolean;
};

export default function EditRoomDialog({ open, onOpenChange, initial, onSubmit, submitting }: Props) {
  const resolver = zodResolver(schema) as Resolver<FormValues>;
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver,
    defaultValues: {
      capacity: initial?.capacity,
      bedType: initial?.bedType ?? "",
      pricePerNight: initial?.pricePerNight,
      typeStatus: initial?.typeStatus ?? "active",
      roomStatus: initial?.roomStatus ?? "available",
    },
  });

  const [typeImages, setTypeImages] = React.useState<string[]>(initial?.typeImages || []);

  React.useEffect(() => {
    reset({
      capacity: initial?.capacity,
      bedType: initial?.bedType ?? "",
      pricePerNight: initial?.pricePerNight,
      typeStatus: initial?.typeStatus ?? "active",
      roomStatus: initial?.roomStatus ?? "available",
    });
    setTypeImages(initial?.typeImages || []);
  }, [initial, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Room — {initial?.type} {initial?.roomCode}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (vals) => {
            await onSubmit({
              capacity: vals.capacity,
              bedType: vals.bedType,
              pricePerNight: vals.pricePerNight,
              typeStatus: vals.typeStatus,
              roomStatus: vals.roomStatus,
              typeImages,
            });
          })}
          className="space-y-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Capacity</Label>
              <Input type="number" step="1" {...register("capacity")} />
              {errors.capacity && <p className="text-sm text-red-600">{errors.capacity.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Price / Night</Label>
              <Input type="number" step="0.01" {...register("pricePerNight")} />
              {errors.pricePerNight && <p className="text-sm text-red-600">{errors.pricePerNight.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bed Type</Label>
            <Input placeholder="King / Twin / Double ..." {...register("bedType")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type Status</Label>
              <Controller
                name="typeStatus"
                control={control}
                defaultValue={initial?.typeStatus ?? "active"}
                render={({ field }) => (
                  <Select value={field.value ?? "active"} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="active" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="inactive">inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Room Status</Label>
              <Controller
                name="roomStatus"
                control={control}
                defaultValue={initial?.roomStatus ?? "available"}
                render={({ field }) => (
                  <Select value={field.value ?? "available"} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="available" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">available</SelectItem>
                      <SelectItem value="occupied">occupied</SelectItem>
                      <SelectItem value="maintenance">maintenance</SelectItem>
                      <SelectItem value="inactive">inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <ImagePicker label="Type Images" value={typeImages} onChange={setTypeImages} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!!submitting}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
