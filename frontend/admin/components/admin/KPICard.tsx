import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const colorVariants = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
};

export default function KPICard({ title, value, change, icon: Icon, color }: KPICardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardContent className="p-4 xl:p-6 h-full min-h-[120px] flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            {/* Text section - ให้ขยายเต็มที่ก่อน icon */}
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{title}</p>
              <motion.p
                key={String(value)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xl sm:text-2xl xl:text-3xl font-semibold text-gray-900 break-all leading-tight"
              >
                {value}
              </motion.p>
              {change !== undefined && (
                <p className={`text-xs sm:text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change >= 0 ? '+' : ''}{change}%
                </p>
              )}
            </div>

            {/* Icon - shrink ไม่ได้ */}
            <div className={`flex-shrink-0 p-2 xl:p-3 rounded-full ${colorVariants[color]}`}>
              <Icon className="h-5 w-5 xl:h-6 xl:w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}