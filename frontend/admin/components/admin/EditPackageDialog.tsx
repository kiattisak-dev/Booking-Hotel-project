import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, Resolver } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().optional(),
  discountPercent: z.coerce.number().optional(),
  validFrom: z.string().optional(),
  validTo: z.string().optional(),
  active: z.boolean().default(true),
});

export type PackageDoc = {
  _id: string;
  name: string;
  description?: string;
  price?: number;
  discountPercent?: number;
  validFrom?: string;
  validTo?: string;
  active?: boolean;
  createdAt?: string;
};

type FormValues = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: PackageDoc | null;
  onSubmit: (payload: FormValues) => Promise<void>;
  submitting?: boolean;
};

export default function EditPackageDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  submitting,
}: Props) {
  type FormValues = z.infer<typeof schema>;

  const resolver = zodResolver(schema) as Resolver<FormValues>;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver,
    defaultValues: {
      name: initial?.name || "",
      description: initial?.description || "",
      price: initial?.price,
      discountPercent: initial?.discountPercent,
      validFrom: initial?.validFrom?.slice(0, 10),
      validTo: initial?.validTo?.slice(0, 10),
      active: initial?.active ?? true,
    },
  });

  React.useEffect(() => {
    reset({
      name: initial?.name || "",
      description: initial?.description || "",
      price: initial?.price,
      discountPercent: initial?.discountPercent,
      validFrom: initial?.validFrom?.slice(0, 10),
      validTo: initial?.validTo?.slice(0, 10),
      active: initial?.active ?? true,
    });
  }, [initial, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Package" : "Create Package"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (vals) => {
            await onSubmit(vals);
          })}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={3} {...register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" step="0.01" {...register("price")} />
            </div>
            <div className="space-y-2">
              <Label>Discount %</Label>
              <Input type="number" step="1" {...register("discountPercent")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valid From</Label>
              <Input type="date" {...register("validFrom")} />
            </div>
            <div className="space-y-2">
              <Label>Valid To</Label>
              <Input type="date" {...register("validTo")} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label>Active</Label>
            <Controller
              name="active"
              control={control}
              defaultValue={initial?.active ?? true}
              render={({ field }) => (
                <Switch
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!!submitting}>
              {initial ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
