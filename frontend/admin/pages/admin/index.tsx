// pages/admin/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, FileText, TrendingUp } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import KPICard from '@/components/admin/KPICard';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { withAdminAuth } from '@/lib/auth-guards';
import { apiFetch } from '@/lib/api';

type Booking = {
  _id: string;
  user: { firstName?: string; lastName?: string; email: string };
  roomCode?: string;
  roomTypeId?: { type?: string };
  checkIn: string;
  checkOut: string;
  totalAmount?: number;
  status: string;
  createdAt: string;
};

type PaymentSlip = {
  _id: string;
  status: string;
};

const bookingColumns = [
  { key: 'guest', label: 'Guest' },
  { key: 'email', label: 'Email' },
  { key: 'room', label: 'Room' },
  { key: 'checkIn', label: 'Check In' },
  { key: 'checkOut', label: 'Check Out' },
  { key: 'amount', label: 'Amount', render: (v: number) => `$${(v || 0).toLocaleString()}` },
  { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
];

function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slips, setSlips] = useState<PaymentSlip[]>([]);

  useEffect(() => {
    (async () => {
      const bk = await apiFetch<Booking[]>("/api/bookings", { auth: true });
      setBookings(bk || []);
      const ps = await apiFetch<PaymentSlip[]>("/api/payments", { auth: true });
      setSlips(ps || []);
    })().catch(() => {});
  }, []);

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayBookings = bookings.filter(b => (b.createdAt || "").slice(0,10) === todayStr).length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const pendingSlips = slips.filter(s => s.status === "SUBMITTED").length;
    const occupied = bookings.filter(b => b.status === "CONFIRMED").length;
    const occupancyRate = bookings.length ? Math.round((occupied / bookings.length) * 100) : 0;

    const recentRows = bookings.slice(-5).reverse().map(b => ({
      guest: `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.trim() || b.user?.email,
      email: b.user?.email,
      room: b.roomCode || b.roomTypeId?.type || "-",
      checkIn: b.checkIn?.slice(0,10),
      checkOut: b.checkOut?.slice(0,10),
      amount: b.totalAmount || 0,
      status: b.status,
    }));

    return { todayBookings, totalRevenue, pendingSlips, occupancyRate, recentRows };
  }, [bookings, slips]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500">Welcome back! Here's what's happening today.</div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} change={0} icon={DollarSign} color="green" />
          <KPICard title="Today's Bookings" value={stats.todayBookings} change={0} icon={Calendar} color="blue" />
          <KPICard title="Pending Slips" value={stats.pendingSlips} icon={FileText} color="orange" />
          <KPICard title="Occupancy Rate" value={`${stats.occupancyRate}%`} icon={TrendingUp} color="purple" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
          <AdminTable columns={bookingColumns} data={stats.recentRows} />
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(DashboardPage);
