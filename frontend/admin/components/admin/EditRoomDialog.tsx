import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, Resolver } from "react-hook-form";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import ImagePicker from "@/components/admin/ImagePicker";

const schema = z.object({
  capacity: z.coerce.number().min(0).optional(),
  bedType: z.string().optional(),
  pricePerNight: z.coerce.number().min(0).optional(),
  description: z.string().optional(), // ✅ เพิ่ม
  typeStatus: z.enum(["active", "inactive"]).optional(),
  roomStatus: z.enum(["available", "occupied", "maintenance", "inactive"]).optional(),
});

export type EditRoomInitial = {
  typeId: string;
  roomCode: string;
  type: string;
  description?: string; // ✅ เพิ่ม
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
    description?: string;
    typeStatus?: "active" | "inactive";
    roomStatus?: "available" | "occupied" | "maintenance" | "inactive";
    typeImages?: string[];
  }) => Promise<void>;
  submitting?: boolean;
};

export default function EditRoomDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting
}: Props) {

  const resolver = zodResolver(schema) as Resolver<FormValues>;

  const {
    register, handleSubmit, reset, control,
    formState: { errors }
  } = useForm<FormValues>({
    resolver,
    defaultValues: {
      capacity: initial?.capacity,
      bedType: initial?.bedType ?? "",
      pricePerNight: initial?.pricePerNight,
      description: initial?.description ?? "", // ✅ เพิ่ม
      typeStatus: initial?.typeStatus ?? "active",
      roomStatus: initial?.roomStatus ?? "available",
    },
  });

  const [typeImages, setTypeImages] =
    React.useState<string[]>(initial?.typeImages || []);

  React.useEffect(() => {
    reset({
      capacity: initial?.capacity,
      bedType: initial?.bedType ?? "",
      pricePerNight: initial?.pricePerNight,
      description: initial?.description ?? "", // ✅ เพิ่ม
      typeStatus: initial?.typeStatus ?? "active",
      roomStatus: initial?.roomStatus ?? "available",
    });
    setTypeImages(initial?.typeImages || []);
  }, [initial, reset]);

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      className="
        w-[95vw]
        max-w-3xl
        max-h-[90vh]
        overflow-y-auto
        p-4 sm:p-6
      "
    >
      <DialogHeader>
        <DialogTitle className="text-lg sm:text-xl font-semibold">
          Edit Room — {initial?.type} {initial?.roomCode}
        </DialogTitle>
      </DialogHeader>

      <form
        onSubmit={handleSubmit(async (vals) => {
          await onSubmit({
            capacity: vals.capacity,
            bedType: vals.bedType,
            pricePerNight: vals.pricePerNight,
            description: vals.description,
            typeStatus: vals.typeStatus,
            roomStatus: vals.roomStatus,
            typeImages,
          });
        })}
        className="space-y-5 sm:space-y-6"
      >
        {/* capacity + price */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Capacity</Label>
            <Input type="number" {...register("capacity")} />
          </div>

          <div className="space-y-2">
            <Label>Price / Night</Label>
            <Input type="number" {...register("pricePerNight")} />
          </div>
        </div>

        {/* bed type */}
        <div className="space-y-2">
          <Label>Bed Type</Label>
          <Input {...register("bedType")} />
        </div>

        {/* description */}
        <div className="space-y-2">
          <Label>Description</Label>
          <textarea
            className="
              w-full rounded-md border px-3 py-2
              text-sm
              focus:outline-none focus:ring-2 focus:ring-primary
              min-h-[90px]
            "
            placeholder="Room description..."
            {...register("description")}
          />
        </div>

        {/* status selects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type Status</Label>
            <Controller
              name="typeStatus"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? "active"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              render={({ field }) => (
                <Select
                  value={field.value ?? "available"}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
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

        {/* images */}
        <div className="space-y-2">
          <ImagePicker
            label="Type Images"
            value={typeImages}
            onChange={setTypeImages}
          />
        </div>

        {/* footer buttons */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={!!submitting}
            className="w-full sm:w-auto"
          >
            Save
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);
}