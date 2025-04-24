"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  Row,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ErrorReport } from "@/types";
import { ReportDialog } from "@/components/report-dialog";
import { useReportStatus } from "@/hooks/useReportStatus";

export const DataTable = ({ reports }: { reports: ErrorReport[] }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedReport, setSelectedReport] = useState<ErrorReport | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const { reportStatuses } = useReportStatus();

  const handleRowClick = (row: Row<ErrorReport>) => {
    setSelectedReport(row.original);
    setDialogOpen(true);
  };

  const getRowClass = (reportId: string) => {
    const status = reportStatuses[reportId]?.status;
    if (!status || status === "new") return "";

    return status === "bug_created"
      ? "bg-yellow-50 hover:bg-yellow-100"
      : "bg-green-50 hover:bg-green-100";
  };

  const columns: ColumnDef<ErrorReport>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="max-w-[100px] truncate">{row.getValue("id")}</div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "errorMessage",
      header: "Error",
      cell: ({ row }) => (
        <div className="max-w-[500px] truncate">
          {row.getValue("errorMessage")}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "reportTime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            {column.getIsSorted() === "asc"
              ? " ↑"
              : column.getIsSorted() === "desc"
                ? " ↓"
                : ""}
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("reportTime") as string;
        return <div>{new Date(date).toLocaleString()}</div>;
      },
      enableSorting: true,
    },
  ];

  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
      sorting: [{ id: "reportTime", desc: true }],
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="Search error messages..."
          value={
            (table.getColumn("errorMessage")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("errorMessage")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`cursor-pointer ${getRowClass(row.original.id) || "hover:bg-muted/50"}`}
                  onClick={() => handleRowClick(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>

      {/* Report Details Dialog */}
      <ReportDialog
        report={selectedReport}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
};
