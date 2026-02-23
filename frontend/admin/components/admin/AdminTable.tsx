import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface AdminTableProps {
  columns: Column[];
  data: any[];
  pagination?: PaginationProps;
  pageSize?: number;
}

function formatDate(date?: string) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB"); // DD/MM/YYYY
}

export default function AdminTable({
  columns,
  data,
  pagination,
  pageSize = 5,
}: AdminTableProps) {

  const [internalPage, setInternalPage] = useState(1);
  const usingExternal = !!pagination;

  const currentPage = usingExternal
    ? pagination.currentPage
    : internalPage;

  const totalPages = usingExternal
    ? pagination.totalPages
    : Math.max(1, Math.ceil(data.length / pageSize));

  const pagedData = useMemo(() => {
    if (usingExternal) return data;
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize, usingExternal]);

  const goToPage = (p: number) => {
    if (usingExternal) pagination!.onPageChange(p);
    else setInternalPage(p);
  };

  return (
    <div className="space-y-4">

      <div className="rounded-lg border bg-white overflow-x-auto">
        <Table className="min-w-[650px]">
          <TableHeader>
            <TableRow>
              {columns.map((c) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagedData.map((row, index) => (
              <motion.tr
                key={row.id || index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                {columns.map((c) => {
                  let value = row[c.key];

                  // 🔥 auto format date field
                  if (c.key.toLowerCase().includes("date") ||
                      c.key.toLowerCase().includes("check")) {
                    value = formatDate(value);
                  }

                  return (
                    <TableCell key={c.key}>
                      {c.render ? c.render(value, row) : value}
                    </TableCell>
                  );
                })}
              </motion.tr>
            ))}

            {pagedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-gray-500">
                  No data found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>

          <div className="flex gap-2">
            <Button size="sm" variant="outline"
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button size="sm" variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}