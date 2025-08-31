// pages/admin/bookings/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { withAdminAuth } from '@/lib/auth-guards';
import { apiFetch } from '@/lib/api';

type Row = {
  _id: string;
  user: { firstName?: string; lastName?: string; email: string };
  roomTypeId?: { type: string };
  roomCode?: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  totalAmount?: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

function BookingsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; type: 'confirm' | 'cancel'; bookingId: string; }>({ open: false, type: 'confirm', bookingId: '' });

  useEffect(() => {
    apiFetch<Row[]>("/api/bookings", { auth: true }).then(setRows).catch(() => {});
  }, []);

  const handleConfirm = (id: string) => setConfirmDialog({ open: true, type: 'confirm', bookingId: id });
  const handleCancel = (id: string) => setConfirmDialog({ open: true, type: 'cancel', bookingId: id });

  const confirmAction = async () => {
    const { type, bookingId } = confirmDialog;
    await apiFetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({ status: type === "confirm" ? "CONFIRMED" : "CANCELLED" })
    });
    setRows(prev => prev.map(r => r._id === bookingId ? { ...r, status: type === "confirm" ? "CONFIRMED" : "CANCELLED" } : r));
    setConfirmDialog({ open: false, type: 'confirm', bookingId: '' });
  };

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const okStatus = statusFilter === 'all' || r.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const okQuery = !q || r.user?.email?.toLowerCase().includes(q) || `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.toLowerCase().includes(q) || r.roomCode?.toLowerCase().includes(q);
      return okStatus && okQuery;
    });
  }, [rows, statusFilter, searchTerm]);

  const bookingColumns = [
    { key: 'bookingId', label: 'Booking ID', render: (_: any, row: any) => row._id },
    { key: 'user', label: 'Guest', render: (user: any) => `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email },
    { key: 'email', label: 'Email', render: (_: any, row: any) => row.user?.email },
    { key: 'room', label: 'Room', render: (_: any, row: any) => row.roomCode || row.roomTypeId?.type },
    { key: 'checkIn', label: 'Check In', render: (v: string) => v?.slice(0,10) },
    { key: 'checkOut', label: 'Check Out', render: (v: string) => v?.slice(0,10) },
    { key: 'guests', label: 'Guests' },
    { key: 'totalAmount', label: 'Amount', render: (v: number) => `$${(v || 0).toLocaleString()}` },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          {row.status === 'PENDING' && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleConfirm(row._id)} className="text-green-600 hover:text-green-700">
                <CheckCircle className="mr-1 h-3 w-3" />
                Confirm
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleCancel(row._id)} className="text-red-600 hover:text-red-700">
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">{rows.filter(b => b.status === 'PENDING').length} pending confirmation</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search bookings..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <AdminTable columns={bookingColumns} data={filtered} />
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
