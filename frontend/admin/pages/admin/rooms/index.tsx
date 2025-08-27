import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plus, Search, Filter } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminTable from '@/components/admin/AdminTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { withAdminAuth } from '@/lib/auth-guards';

// Mock data
const rooms = [
  {
    id: '1',
    code: 'S101',
    name: 'Standard Single',
    type: 'Standard',
    capacity: 1,
    bedType: 'Single',
    pricePerNight: 800,
    status: 'active',
  },
  {
    id: '2',
    code: 'D202',
    name: 'Deluxe Double',
    type: 'Deluxe',
    capacity: 2,
    bedType: 'Double',
    pricePerNight: 1200,
    status: 'active',
  },
  {
    id: '3',
    code: 'ST301',
    name: 'Suite Premium',
    type: 'Suite',
    capacity: 4,
    bedType: 'King + Sofa',
    pricePerNight: 2400,
    status: 'inactive',
  },
];

const roomColumns = [
  { key: 'code', label: 'Room Code' },
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'bedType', label: 'Bed Type' },
  { 
    key: 'pricePerNight', 
    label: 'Price/Night',
    render: (value: number) => `$${value}`
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
        <Link href={`/admin/rooms/${row.id}`}>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </Link>
      </div>
    ),
  },
];

function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
          <Link href="/admin/rooms/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Deluxe">Deluxe</SelectItem>
                <SelectItem value="Suite">Suite</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AdminTable columns={roomColumns} data={rooms} />
        </motion.div>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(RoomsPage);