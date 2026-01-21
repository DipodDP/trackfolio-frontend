"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { DataTableToolbar } from "@/components/data-table/DataTableToolbar";
import { TablePosition } from "@/types/position";
import { EditTargetProportionDialog } from "./dialogs/EditTargetProportionDialog";
import { createPositionColumns } from "./columns/position-columns";

interface PositionsDataTableProps {
  data: TablePosition[];
  onRefresh?: () => void;
}

export function PositionsDataTable({
  data,
  onRefresh,
}: PositionsDataTableProps) {
  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Modal state for editing target proportion
  const [editProportionModal, setEditProportionModal] =
    React.useState<TablePosition | null>(null);

  // Handler for editing target proportion
  const handleEditProportion = React.useCallback((position: TablePosition) => {
    setEditProportionModal(position);
  }, []);

  // Create columns with handlers
  const columns = React.useMemo(
    () => createPositionColumns(onRefresh || (() => {}), handleEditProportion),
    [onRefresh, handleEditProportion]
  );

  // Initialize table
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    // Core functionality
    getCoreRowModel: getCoreRowModel(),

    // Pagination
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 20,
      },
    },

    // Sorting
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    // Filtering
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),

    // Column visibility
    onColumnVisibilityChange: setColumnVisibility,

    // Row selection
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,

    // Faceted values for filters
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      {/* Toolbar with search and filters */}
      <DataTableToolbar table={table} />

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-primary-text">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
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
                  className="h-24 text-center text-secondary-text"
                >
                  No positions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />

      {/* Edit Target Proportion Modal */}
      <EditTargetProportionDialog
        isOpen={!!editProportionModal}
        onClose={() => setEditProportionModal(null)}
        position={editProportionModal}
        onSave={async () => {
          setEditProportionModal(null);
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
