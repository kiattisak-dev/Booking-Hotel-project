// pages/admin/rooms/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { withAdminAuth } from "@/lib/auth-guards";
import { apiFetch } from "@/lib/api";
import EditRoomDialog, {
  EditRoomInitial,
} from "@/components/admin/EditRoomDialog";

type RoomTypeDoc = {
  _id: string;
  type: string;
  description?: string;
  capacity?: number;
  bedType?: string;
  pricePerNight?: number;
  status?: "active" | "inactive";
  images?: string[];
  rooms: {
    code: string;
    status?: "available" | "occupied" | "maintenance" | "inactive";
    images?: string[];
  }[];
};

type RoomsResponse = { rooms: RoomTypeDoc[]; total: number };

type Row = {
  id: string;
  typeId: string;
  code: string;
  name: string;
  type: string;
  capacity: number;
  bedType: string;
  pricePerNight: number;
  status: "active" | "inactive" | string;
  roomStatus?: "available" | "occupied" | "maintenance" | "inactive";
  typeImages: string[];
  roomImages: string[];
};

function RoomsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [data, setData] = useState<Row[]>([]);
  const [typesList, setTypesList] = useState<RoomTypeDoc[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<EditRoomInitial | null>(null);
  const [saving, setSaving] = useState(false);

  // Add rooms dialog states (Single / Bulk)
  const [addOpen, setAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [addTypeId, setAddTypeId] = useState<string>("");
  const [addPrefix, setAddPrefix] = useState<string>("");
  const [addCount, setAddCount] = useState<number>(1);
  const [addSaving, setAddSaving] = useState(false);

  async function fetchData() {
    const res = await apiFetch<RoomsResponse>("/api/rooms", { auth: true });
    const types: RoomTypeDoc[] = res.rooms || [];

    // เก็บรายการ Room Type ไว้ใช้กับ Select (ให้มีแม้ type ที่ยังไม่มีห้อง)
    setTypesList(types);

    // flat ออกมาเป็นรายการห้อง
    const flat: Row[] = types.flatMap((rt) =>
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
        typeImages: Array.isArray(rt.images) ? rt.images : [],
        roomImages: Array.isArray(r.images) ? r.images : [],
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
      typeImages: row.typeImages,
      roomImages: row.roomImages,
    });
    setEditOpen(true);
  };

  const saveEdit = async (vals: {
    capacity?: number;
    bedType?: string;
    pricePerNight?: number;
    typeStatus?: "active" | "inactive";
    roomStatus?: "available" | "occupied" | "maintenance" | "inactive";
    typeImages?: string[];
  }) => {
    if (!editing) return;
    setSaving(true);
    try {
      const typePayload: any = {};
      if (vals.capacity !== undefined) typePayload.capacity = vals.capacity;
      if (vals.bedType !== undefined) typePayload.bedType = vals.bedType;
      if (vals.pricePerNight !== undefined)
        typePayload.pricePerNight = vals.pricePerNight;
      if (vals.typeStatus !== undefined) typePayload.status = vals.typeStatus;
      if (vals.typeImages !== undefined) typePayload.images = vals.typeImages;

      if (Object.keys(typePayload).length) {
        await apiFetch(`/api/rooms/${editing.typeId}`, {
          method: "PATCH",
          auth: true,
          body: JSON.stringify(typePayload),
        });
      }

      if (vals.roomStatus !== undefined) {
        const roomPayload: any = { status: vals.roomStatus };
        await apiFetch(
          `/api/rooms/${editing.typeId}/rooms/${encodeURIComponent(
            editing.roomCode
          )}`,
          {
            method: "PUT",
            auth: true,
            body: JSON.stringify(roomPayload),
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

  const handleDelete = async (row: Row) => {
    const ok = window.confirm(`Delete room ${row.code} in type ${row.type}?`);
    if (!ok) return;
    await apiFetch(
      `/api/rooms/${row.typeId}/rooms/${encodeURIComponent(row.code)}`,
      {
        method: "DELETE",
        auth: true,
      }
    );
    await fetchData();
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
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row)}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleAddRooms = async () => {
    if (!addTypeId) {
      alert("กรุณาเลือก Room Type");
      return;
    }
    if (!addPrefix) {
      alert("กรุณากรอก Prefix");
      return;
    }
    const count = addMode === "single" ? 1 : Number(addCount || 0);
    if (!count || count < 1) {
      alert("จำนวนห้องต้องมากกว่า 0");
      return;
    }

    setAddSaving(true);
    try {
      await apiFetch(`/api/rooms/${addTypeId}/rooms`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({ prefix: addPrefix, count }),
      });
      await fetchData();
      setAddOpen(false);
      setAddTypeId("");
      setAddPrefix("");
      setAddCount(1);
      setAddMode("single");
    } finally {
      setAddSaving(false);
    }
  };

  // ใช้ typesList เพื่อสร้างรายการตัวกรอง "by type" ให้เสถียรกว่า
  const filterTypeOptions = useMemo(() => {
    const set = new Set(typesList.map((t) => t.type));
    return ["all", ...Array.from(set)];
  }, [typesList]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-3xl font-bold text-gray-900">Rooms</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              + Add Rooms
            </Button>
            <Link href="/admin/rooms/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Room Type
              </Button>
            </Link>
          </div>
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

            {/* filter by type (มาจาก typesList) */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {filterTypeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt === "all" ? "All Types" : opt}
                  </SelectItem>
                ))}
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

        {/* Edit room dialog */}
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

        {/* Add Rooms Dialog (Single/Bulk) */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Rooms</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode</label>
                <Select
                  value={addMode}
                  onValueChange={(v) => setAddMode(v as "single" | "bulk")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single (1 room)</SelectItem>
                    <SelectItem value="bulk">Bulk (multiple rooms)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Room Type</label>
                <Select value={addTypeId} onValueChange={setAddTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typesList.map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prefix</label>
                  <Input
                    placeholder="เช่น D"
                    value={addPrefix}
                    onChange={(e) => setAddPrefix(e.target.value)}
                  />
                </div>

                {addMode === "bulk" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Count</label>
                    <Input
                      type="number"
                      min={1}
                      value={addCount}
                      onChange={(e) => setAddCount(Number(e.target.value))}
                    />
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500">
                ระบบจะสร้างรหัสห้องเป็นลำดับอัตโนมัติ เช่น D001, D002, ...
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRooms} disabled={addSaving}>
                {addSaving
                  ? "Saving..."
                  : addMode === "single"
                  ? "Add 1 Room"
                  : "Add Rooms"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(RoomsPage);
