import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { withAdminAuth } from '@/lib/auth-guards';

// Mock data
const packages = [
  {
    id: '1',
    name: 'Weekend Getaway',
    description: 'Perfect for a romantic weekend with breakfast included',
    price: 150,
    discountPercent: 10,
    validFrom: '2025-01-01',
    validTo: '2025-03-31',
    active: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Business Package',
    description: 'Ideal for business travelers with meeting room access',
    discountPercent: 15,
    validFrom: '2025-02-01',
    validTo: '2025-12-31',
    active: true,
    createdAt: '2025-01-05T00:00:00Z',
  },
  {
    id: '3',
    name: 'Holiday Special',
    description: 'Special holiday offer with spa access',
    price: 200,
    validFrom: '2024-12-01',
    validTo: '2025-01-31',
    active: false,
    createdAt: '2024-11-15T00:00:00Z',
  },
];

function PackagesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    packageId: string;
  }>({ open: false, packageId: '' });

  const handleDelete = (packageId: string) => {
    setDeleteDialog({ open: true, packageId });
  };

  const confirmDelete = async () => {
    console.log('Delete package:', deleteDialog.packageId);
    // Mock API call - replace with actual implementation
    setDeleteDialog({ open: false, packageId: '' });
  };

  const packageColumns = [
    { key: 'name', label: 'Package Name' },
    { 
      key: 'description', 
      label: 'Description',
      render: (value: string) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      key: 'pricing', 
      label: 'Pricing',
      render: (value: any, row: any) => (
        <div className="space-y-1">
          {row.price && (
            <div className="text-sm font-medium">${row.price}</div>
          )}
          {row.discountPercent && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {row.discountPercent}% off
            </Badge>
          )}
        </div>
      )
    },
    { key: 'validFrom', label: 'Valid From' },
    { key: 'validTo', label: 'Valid To' },
    { 
      key: 'active', 
      label: 'Status',
      render: (value: boolean) => <StatusBadge status={value ? 'active' : 'inactive'} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex gap-2">
          <Link href={`/admin/packages/${row.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-1 h-3 w-3" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
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
          <h1 className="text-3xl font-bold text-gray-900">Packages</h1>
          <Link href="/admin/packages/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Package
            </Button>
          </Link>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AdminTable columns={packageColumns} data={packages} />
        </motion.div>

        <ConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
          title="Delete Package"
          description="Are you sure you want to delete this package? This action cannot be undone."
          confirmText="Delete"
          onConfirm={confirmDelete}
          variant="destructive"
        />
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(PackagesPage);