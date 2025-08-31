import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminTable from "@/components/admin/AdminTable";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { withAdminAuth } from "@/lib/auth-guards";
import { apiFetch } from "@/lib/api";
import EditPackageDialog, {
  PackageDoc,
} from "@/components/admin/EditPackageDialog";

type Pkg = PackageDoc;

function PackagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [rows, setRows] = useState<Pkg[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    packageId: string;
  }>({ open: false, packageId: "" });

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Pkg | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<Pkg[]>("/api/packages", { auth: true })
      .then(setRows)
      .catch(() => {});
  }, []);

  const handleDelete = (packageId: string) =>
    setDeleteDialog({ open: true, packageId });

  const confirmDelete = async () => {
    await apiFetch(`/api/packages/${deleteDialog.packageId}`, {
      method: "DELETE",
      auth: true,
    });
    setRows((prev) => prev.filter((p) => p._id !== deleteDialog.packageId));
    setDeleteDialog({ open: false, packageId: "" });
  };

  const handleOpenEdit = (pkg: Pkg) => {
    setEditing(pkg);
    setEditOpen(true);
  };

  const handleSubmitEdit = async (payload: Partial<Pkg>) => {
    if (!editing?._id) return;
    setSaving(true);
    try {
      const updated = await apiFetch<Pkg>(`/api/packages/${editing._id}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(payload),
      });
      setRows((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
      setEditOpen(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const filtered = rows.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const packageColumns = [
    { key: "name", label: "Package Name" },
    {
      key: "description",
      label: "Description",
      render: (v: string) => (
        <div className="max-w-xs truncate" title={v}>
          {v}
        </div>
      ),
    },
    {
      key: "pricing",
      label: "Pricing",
      render: (_: any, row: any) => (
        <div className="space-y-1">
          {row.price && <div className="text-sm font-medium">${row.price}</div>}
          {row.discountPercent && (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {row.discountPercent}% off
            </Badge>
          )}
        </div>
      ),
    },
    { key: "validFrom", label: "Valid From" },
    { key: "validTo", label: "Valid To" },
    {
      key: "active",
      label: "Status",
      render: (v: boolean) => (
        <StatusBadge status={v ? "active" : "inactive"} />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_: any, row: Pkg) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenEdit(row)}
          >
            <Edit className="mr-1 h-3 w-3" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row._id)}
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AdminTable columns={packageColumns} data={filtered} />
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

        <EditPackageDialog
          open={editOpen}
          onOpenChange={(v) => {
            setEditOpen(v);
            if (!v) setEditing(null);
          }}
          initial={editing}
          submitting={saving}
          onSubmit={async (vals) => {
            await handleSubmitEdit({
              name: vals.name,
              description: vals.description || "",
              price: vals.price,
              discountPercent: vals.discountPercent,
              validFrom: vals.validFrom,
              validTo: vals.validTo,
              active: vals.active,
            });
          }}
        />
      </div>
    </AdminLayout>
  );
}

export default withAdminAuth(PackagesPage);
