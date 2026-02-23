// pages/admin/rooms/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2 } from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminTable from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

import { withAdminAuth } from "@/lib/auth-guards";
import { apiFetch } from "@/lib/api";
import EditRoomDialog, {
  EditRoomInitial,
} from "@/components/admin/EditRoomDialog";

/* -------------------------------------------------------------------------- */
/* TYPES */
/* -------------------------------------------------------------------------- */

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
  description?: string;
  bedType: string;
  pricePerNight: number;
  status: "active" | "inactive" | string;
  roomStatus?: "available" | "occupied" | "maintenance" | "inactive";
  typeImages: string[];
  roomImages: string[];
};

function RoomsPage() {
  const [data, setData] = useState<Row[]>([]);
  const [typesList, setTypesList] = useState<RoomTypeDoc[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<EditRoomInitial | null>(null);
  const [saving, setSaving] = useState(false);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /* -------------------------------------------------------------------------- */
  /* SUCCESS ALERT */
  /* -------------------------------------------------------------------------- */

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  /* -------------------------------------------------------------------------- */
  /* FETCH */
  /* -------------------------------------------------------------------------- */

  async function fetchData() {
    const res = await apiFetch<RoomsResponse>("/api/rooms", { auth: true });
    const types: RoomTypeDoc[] = res.rooms || [];
    setTypesList(types);

    const flat: Row[] = types.flatMap((rt) =>
      (rt.rooms || []).map((r) => ({
        id: `${rt._id}:${r.code}`,
        typeId: rt._id,
        code: r.code,
        name: `${rt.type} ${r.code}`,
        type: rt.type,
        capacity: rt.capacity ?? 0,
        bedType: rt.bedType ?? "-",
        description: rt.description ?? "",
        pricePerNight: rt.pricePerNight ?? 0,
        status: rt.status ?? "inactive",
        roomStatus: r.status ?? "available",
        typeImages: rt.images ?? [],
        roomImages: r.images ?? [],
      }))
    );

    setData(flat);
  }

  useEffect(() => {
    fetchData();
  }, []);

  /* -------------------------------------------------------------------------- */
  /* FILTER */
  /* -------------------------------------------------------------------------- */

  const filtered = useMemo(() => {
    return data.filter((row) => {
      const q = searchTerm.toLowerCase();
      const okQuery =
        !q ||
        row.code.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q);

      const okType = typeFilter === "all" || row.type === typeFilter;
      return okQuery && okType;
    });
  }, [data, searchTerm, typeFilter]);

  /* -------------------------------------------------------------------------- */
  /* EDIT */
  /* -------------------------------------------------------------------------- */

  const openEdit = (row: Row) => {
    setEditing({
      typeId: row.typeId,
      roomCode: row.code,
      type: row.type,
      capacity: row.capacity,
      bedType: row.bedType,
      description: row.description,
      pricePerNight: row.pricePerNight,
      typeStatus: row.status as any,
      roomStatus: row.roomStatus as any,
      typeImages: row.typeImages,
      roomImages: row.roomImages,
    });
    setEditOpen(true);
  };

  const saveEdit = async (vals: any) => {
    if (!editing) return;
    setSaving(true);
    try {
      await apiFetch(`/api/rooms/${editing.typeId}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(vals),
      });

      await fetchData();
      showSuccess("Room updated successfully");
      setEditOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* DELETE */
  /* -------------------------------------------------------------------------- */

  const handleDelete = async (row: Row) => {
    if (!confirm(`Delete room ${row.code}?`)) return;

    await apiFetch(
      `/api/rooms/${row.typeId}/rooms/${encodeURIComponent(row.code)}`,
      { method: "DELETE", auth: true }
    );

    await fetchData();
    showSuccess("Room deleted successfully");
  };

  /* -------------------------------------------------------------------------- */
  /* TABLE */
  /* -------------------------------------------------------------------------- */

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

  const filterTypeOptions = useMemo(() => {
    const set = new Set(typesList.map((t) => t.type));
    return ["all", ...Array.from(set)];
  }, [typesList]);

  /* -------------------------------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------------------------------- */

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* 🔥 MOTION SUCCESS ALERT */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.35 }}
              className="fixed top-6 right-6 z-50 w-80"
            >
              <Alert className="border-green-300 bg-green-50 shadow-lg">
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  {successMsg}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Rooms</h1>
          <Link href="/admin/rooms/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Room Type
            </Button>
          </Link>
        </motion.div>

        <div className="flex gap-4">
          <Input
            placeholder="Search rooms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterTypeOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt === "all" ? "All Types" : opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AdminTable columns={roomColumns} data={filtered} pageSize={5} />

        <EditRoomDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          initial={editing}
          submitting={saving}
          onSubmit={saveEdit}
        />
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(RoomsPage);