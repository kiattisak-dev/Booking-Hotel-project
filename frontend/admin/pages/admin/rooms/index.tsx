// pages/admin/rooms/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Search, Edit } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTable from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { withAdminAuth } from "@/lib/auth-guards";
import { apiFetch } from "@/lib/api";
import EditRoomDialog, {
  EditRoomInitial,
} from "@/components/admin/EditRoomDialog";

type RoomTypeDoc = {
  _id: string;
  type: string;
  capacity?: number;
  bedType?: string;
  pricePerNight?: number;
  status?: "active" | "inactive";
  rooms: {
    code: string;
    status?: "available" | "occupied" | "maintenance" | "inactive";
  }[];
};

type Row = {
  id: string; // `${typeId}:${roomCode}`
  typeId: string;
  code: string;
  name: string;
  type: string;
  capacity: number;
  bedType: string;
  pricePerNight: number;
  status: "active" | "inactive" | string; // type status
  roomStatus?: "available" | "occupied" | "maintenance" | "inactive";
};

function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [data, setData] = useState<Row[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<EditRoomInitial | null>(null);
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    const types = await apiFetch<RoomTypeDoc[]>("/api/rooms", { auth: true });
    const flat: Row[] = (types || []).flatMap(
      (
        rt: RoomTypeDoc
      ) =>
        (rt.rooms || []).map((r) => ({
          id: `${rt._id}:${r.code}`,
          typeId: rt._id,
          code: r.code,
          name: `${rt.type} ${r.code}`,
          type: rt.type,
          capacity: rt.capacity ?? 0,
          bedType: rt.bedType ?? "-",
          pricePerNight: rt.pricePerNight ?? 0,
          status: rt.status ?? "inactive",
          roomStatus: r.status ?? "available",
        }))
    );
    setData(flat);
  }

  useEffect(() => {
    fetchData().catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const okType = typeFilter === "all" || row.type === typeFilter;
      const okStatus = statusFilter === "all" || row.status === statusFilter;
      const q = searchTerm.toLowerCase();
      const okQuery =
        !q ||
        row.code.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q);
      return okType && okStatus && okQuery;
    });
  }, [data, typeFilter, statusFilter, searchTerm]);

  const openEdit = (row: Row) => {
    setEditing({
      typeId: row.typeId,
      roomCode: row.code,
      type: row.type,
      capacity: row.capacity,
      bedType: row.bedType,
      pricePerNight: row.pricePerNight,
      typeStatus: (row.status as "active" | "inactive") ?? "active",
      roomStatus: row.roomStatus ?? "available",
    });
    setEditOpen(true);
  };

  const saveEdit = async (vals: {
    capacity?: number;
    bedType?: string;
    pricePerNight?: number;
    typeStatus?: "active" | "inactive";
    roomStatus?: "available" | "occupied" | "maintenance" | "inactive";
  }) => {
    if (!editing) return;
    setSaving(true);
    try {
      // อัปเดต type-level
      const typePayload: any = {};
      if (vals.capacity !== undefined) typePayload.capacity = vals.capacity;
      if (vals.bedType !== undefined) typePayload.bedType = vals.bedType;
      if (vals.pricePerNight !== undefined)
        typePayload.pricePerNight = vals.pricePerNight;
      if (vals.typeStatus !== undefined) typePayload.status = vals.typeStatus;

      if (Object.keys(typePayload).length) {
        await apiFetch(`/api/rooms/${editing.typeId}`, {
          method: "PATCH",
          auth: true,
          body: JSON.stringify(typePayload),
        });
      }

      // อัปเดต room-level (status)
      if (vals.roomStatus !== undefined) {
        await apiFetch(
          `/api/rooms/${editing.typeId}/rooms/${encodeURIComponent(
            editing.roomCode
          )}`,
          {
            method: "PUT",
            auth: true,
            body: JSON.stringify({ status: vals.roomStatus }),
          }
        );
      }

      await fetchData();
      setEditOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const roomColumns = [
    { key: "code", label: "Room Code" },
    { key: "name", label: "Name" },
    { key: "type", label: "Type" },
    { key: "capacity", label: "Capacity" },
    { key: "bedType", label: "Bed Type" },
    {
      key: "pricePerNight",
      label: "Price/Night",
      render: (v: number) => `$${v}`,
    },
    {
      key: "status",
      label: "Type Status",
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: "roomStatus",
      label: "Room Status",
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Row) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
          <Link href={`/admin/rooms/${row.id}`}>
            <Button variant="outline" size="sm">
              Detail
            </Button>
          </Link>
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
          <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
          <Link href="/admin/rooms/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </Link>
        </motion.div>

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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AdminTable columns={roomColumns} data={filtered} />
        </motion.div>

        <EditRoomDialog
          open={editOpen}
          onOpenChange={(v) => {
            setEditOpen(v);
            if (!v) setEditing(null);
          }}
          initial={editing}
          submitting={saving}
          onSubmit={async (vals) => {
            await saveEdit(vals);
          }}
        />
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(RoomsPage);
