"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have a Checkbox component
import { DataTableViewOptions } from "./DataTableViewOptions";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  hideZeroAllocation: boolean;
  onHideZeroAllocationChange: (value: boolean) => void;
}

export function DataTableToolbar<TData>({
  table,
  hideZeroAllocation,
  onHideZeroAllocationChange,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search by ticker or name..."
          value={(table.getColumn("ticker")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("ticker")?.setFilterValue(event.target.value)
          }
          className="h-10 w-[200px] lg:w-[300px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-10 px-2 lg:px-3"
          >
            Reset
            <span className="material-symbols-outlined text-sm ml-2">
              close
            </span>
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hide-zero-allocation"
            checked={hideZeroAllocation}
            onCheckedChange={onHideZeroAllocationChange}
          />
          <label
            htmlFor="hide-zero-allocation"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Hide zero target allocation
          </label>
        </div>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
