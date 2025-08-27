import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const statusConfig = {
  // Booking statuses
  PENDING: { variant: 'outline' as const, className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  CONFIRMED: { variant: 'outline' as const, className: 'bg-green-50 text-green-700 border-green-200' },
  CANCELLED: { variant: 'outline' as const, className: 'bg-red-50 text-red-700 border-red-200' },
  COMPLETED: { variant: 'outline' as const, className: 'bg-blue-50 text-blue-700 border-blue-200' },
  
  // Payment statuses
  PAID: { variant: 'outline' as const, className: 'bg-green-50 text-green-700 border-green-200' },
  REFUNDED: { variant: 'outline' as const, className: 'bg-gray-50 text-gray-700 border-gray-200' },
  
  // Payment slip statuses
  SUBMITTED: { variant: 'outline' as const, className: 'bg-blue-50 text-blue-700 border-blue-200' },
  APPROVED: { variant: 'outline' as const, className: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED: { variant: 'outline' as const, className: 'bg-red-50 text-red-700 border-red-200' },
  
  // Room statuses
  active: { variant: 'outline' as const, className: 'bg-green-50 text-green-700 border-green-200' },
  inactive: { variant: 'outline' as const, className: 'bg-gray-50 text-gray-700 border-gray-200' },
};

export default function StatusBadge({ status, variant }: StatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig];
  
  return (
    <Badge 
      variant={variant || config?.variant || 'outline'} 
      className={cn(config?.className)}
    >
      {status}
    </Badge>
  );
}