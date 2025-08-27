import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, FileText, TrendingUp } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import KPICard from '@/components/admin/KPICard';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { withAdminAuth } from '@/lib/auth-guards';

// Mock data
const dashboardStats = {
  totalRevenue: 125000,
  todayBookings: 15,
  pendingSlips: 8,
  occupancyRate: 85,
  revenueChange: 12,
  bookingsChange: 5,
};

const recentBookings = [
  {
    id: '1',
    guest: 'John Doe',
    email: 'john@example.com',
    room: 'D101',
    checkIn: '2025-01-15',
    checkOut: '2025-01-18',
    amount: 2400,
    status: 'CONFIRMED',
  },
  {
    id: '2',
    guest: 'Jane Smith',
    email: 'jane@example.com',
    room: 'S205',
    checkIn: '2025-01-16',
    checkOut: '2025-01-20',
    amount: 4800,
    status: 'PENDING',
  },
  {
    id: '3',
    guest: 'Mike Johnson',
    email: 'mike@example.com',
    room: 'ST301',
    checkIn: '2025-01-14',
    checkOut: '2025-01-17',
    amount: 7200,
    status: 'COMPLETED',
  },
];

const bookingColumns = [
  { key: 'guest', label: 'Guest' },
  { key: 'email', label: 'Email' },
  { key: 'room', label: 'Room' },
  { key: 'checkIn', label: 'Check In' },
  { key: 'checkOut', label: 'Check Out' },
  { 
    key: 'amount', 
    label: 'Amount',
    render: (value: number) => `$${value.toLocaleString()}`
  },
  { 
    key: 'status', 
    label: 'Status',
    render: (value: string) => <StatusBadge status={value} />
  },
];

function DashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="text-sm text-gray-500">
            Welcome back! Here's what's happening today.
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Revenue"
            value={`$${dashboardStats.totalRevenue.toLocaleString()}`}
            change={dashboardStats.revenueChange}
            icon={DollarSign}
            color="green"
          />
          <KPICard
            title="Today's Bookings"
            value={dashboardStats.todayBookings}
            change={dashboardStats.bookingsChange}
            icon={Calendar}
            color="blue"
          />
          <KPICard
            title="Pending Slips"
            value={dashboardStats.pendingSlips}
            icon={FileText}
            color="orange"
          />
          <KPICard
            title="Occupancy Rate"
            value={`${dashboardStats.occupancyRate}%`}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
          <AdminTable columns={bookingColumns} data={recentBookings} />
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(DashboardPage);