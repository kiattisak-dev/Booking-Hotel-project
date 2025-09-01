import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  status: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
};

const MAP: Record<
  string,
  { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  PENDING: { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  CONFIRMED: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
  CANCELLED: { variant: "outline", className: "bg-red-50 text-red-700 border-red-200" },
  COMPLETED: { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200" },
  PAID: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
  REFUNDED: { variant: "outline", className: "bg-gray-50 text-gray-700 border-gray-200" },
  SUBMITTED: { variant: "outline", className: "bg-blue-50 text-blue-700 border-blue-200" },
  APPROVED: { variant: "outline", className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED: { variant: "outline", className: "bg-red-50 text-red-700 border-red-200" },
  ACTIVE: { variant: "outline", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  INACTIVE: { variant: "outline", className: "bg-gray-50 text-gray-700 border-gray-200" },
  AVAILABLE: { variant: "outline", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  OCCUPIED: { variant: "outline", className: "bg-rose-50 text-rose-700 border-rose-200" },
  MAINTENANCE: { variant: "outline", className: "bg-amber-50 text-amber-700 border-amber-200" }
};

function formatLabel(s: string) {
  return s.replace(/[_-]+/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export default function StatusBadge({ status, variant }: Props) {
  const key = String(status || "").trim().toUpperCase();
  const cfg = MAP[key];
  return (
    <Badge
      variant={variant || cfg?.variant || "outline"}
      className={cn(cfg?.className || "bg-slate-50 text-slate-700 border-slate-200")}
    >
      {formatLabel(key)}
    </Badge>
  );
}
