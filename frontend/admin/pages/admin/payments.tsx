import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, X, Clock } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { withAdminAuth } from '@/lib/auth-guards';

// Mock data
const paymentSlips = [
  {
    id: '1',
    booking: {
      id: 'BK001',
      user: {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
      room: {
        code: 'D101',
        name: 'Deluxe Double',
      },
      totalAmount: 2400,
    },
    slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
    amount: 2400,
    status: 'SUBMITTED',
    submittedAt: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    booking: {
      id: 'BK002',
      user: {
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      },
      room: {
        code: 'S205',
        name: 'Suite Premium',
      },
      totalAmount: 4800,
    },
    slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
    amount: 4800,
    status: 'APPROVED',
    submittedAt: '2025-01-14T14:20:00Z',
    processedAt: '2025-01-14T16:15:00Z',
  },
];

function PaymentsPage() {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject';
    slipId: string;
  }>({ open: false, type: 'approve', slipId: '' });

  const handleApprove = (slipId: string) => {
    setConfirmDialog({ open: true, type: 'approve', slipId });
  };

  const handleReject = (slipId: string) => {
    setConfirmDialog({ open: true, type: 'reject', slipId });
  };

  const confirmAction = async () => {
    const { type, slipId } = confirmDialog;
    console.log(`${type} slip:`, slipId);
    // Mock API call - replace with actual implementation
    setConfirmDialog({ open: false, type: 'approve', slipId: '' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-3xl font-bold text-gray-900">Payment Slips</h1>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {paymentSlips.filter(s => s.status === 'SUBMITTED').length} pending review
            </span>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {paymentSlips.map((slip, index) => (
            <motion.div
              key={slip.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">#{slip.booking.id}</Badge>
                      <StatusBadge status={slip.status} />
                    </div>

                    {/* Booking Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Guest:</span>
                        <span className="text-sm font-medium">
                          {slip.booking.user.firstName} {slip.booking.user.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="text-sm">{slip.booking.user.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Room:</span>
                        <span className="text-sm font-medium">
                          {slip.booking.room.code} - {slip.booking.room.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="text-sm font-bold text-green-600">
                          ${slip.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Payment Slip Image */}
                    <div className="space-y-2">
                      <span className="text-sm font-medium text-gray-900">Payment Slip:</span>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border">
                        <img
                          src={slip.slipImage}
                          alt="Payment slip"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    {slip.status === 'SUBMITTED' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(slip.id)}
                          className="flex-1"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(slip.id)}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {/* Processed Info */}
                    {slip.processedAt && (
                      <div className="text-xs text-gray-500">
                        Processed: {new Date(slip.processedAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
          title={`${confirmDialog.type === 'approve' ? 'Approve' : 'Reject'} Payment`}
          description={`Are you sure you want to ${confirmDialog.type} this payment slip? This action cannot be undone.`}
          confirmText={confirmDialog.type === 'approve' ? 'Approve' : 'Reject'}
          onConfirm={confirmAction}
          variant={confirmDialog.type === 'reject' ? 'destructive' : 'default'}
        />
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(PaymentsPage);