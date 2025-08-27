import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { withAdminAuth } from '@/lib/auth-guards';

// Mock data
const bookings = [
  {
    id: '1',
    bookingId: 'BK001',
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    room: {
      code: 'D101',
      name: 'Deluxe Double',
    },
    checkIn: '2025-01-15',
    checkOut: '2025-01-18',
    guests: 2,
    totalAmount: 2400,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    createdAt: '2025-01-10T10:00:00Z',
  },
  {
    id: '2',
    bookingId: 'BK002',
    user: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    },
    room: {
      code: 'S205',
      name: 'Suite Premium',
    },
    checkIn: '2025-01-16',
    checkOut: '2025-01-20',
    guests: 3,
    totalAmount: 4800,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    createdAt: '2025-01-12T14:30:00Z',
  },
];

function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'confirm' | 'cancel';
    bookingId: string;
  }>({ open: false, type: 'confirm', bookingId: '' });

  const handleConfirm = (bookingId: string) => {
    setConfirmDialog({ open: true, type: 'confirm', bookingId });
  };

  const handleCancel = (bookingId: string) => {
    setConfirmDialog({ open: true, type: 'cancel', bookingId });
  };

  const confirmAction = async () => {
    const { type, bookingId } = confirmDialog;
    console.log(`${type} booking:`, bookingId);
    // Mock API call - replace with actual implementation
    setConfirmDialog({ open: false, type: 'confirm', bookingId: '' });
  };

  const bookingColumns = [
    { key: 'bookingId', label: 'Booking ID' },
    { 
      key: 'user', 
      label: 'Guest',
      render: (user: any) => `${user.firstName} ${user.lastName}`
    },
    { key: 'email', label: 'Email', render: (value: any, row: any) => row.user.email },
    { 
      key: 'room', 
      label: 'Room',
      render: (room: any) => `${room.code} - ${room.name}`
    },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'guests', label: 'Guests' },
    { 
      key: 'totalAmount', 
      label: 'Amount',
      render: (value: number) => `$${value.toLocaleString()}`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => <StatusBadge status={value} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex gap-2">
          {row.status === 'PENDING' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConfirm(row.id)}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCancel(row.id)}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="mr-1 h-3 w-3" />
                Cancel
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {bookings.filter(b => b.status === 'PENDING').length} pending confirmation
            </span>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-center"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AdminTable columns={bookingColumns} data={bookings} />
        </motion.div>

        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title={`${confirmDialog.type === 'confirm' ? 'Confirm' : 'Cancel'} Booking`}
          description={`Are you sure you want to ${confirmDialog.type} this booking? This action cannot be undone.`}
          confirmText={confirmDialog.type === 'confirm' ? 'Confirm' : 'Cancel Booking'}
          onConfirm={confirmAction}
          variant={confirmDialog.type === 'cancel' ? 'destructive' : 'default'}
        />
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(BookingsPage);