"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { TablePosition } from "@/types/position";
import {
  formatMoneyValue,
  formatPercent,
  formatQuotation,
} from "@/utils/formatters";

import {
  formatProfitDisplay,
  formatInstrumentType,
} from "@/lib/utils/position";
import { PositionRowActions } from "../row-actions/PositionRowActions";
import { OrderDialog } from "../dialogs/OrderDialog";

/**
 * Create position table columns with refresh callback
 * @param onRefresh - Callback to refresh data after order execution
 * @param onEditProportion - Callback to edit target proportion
 */
export function createPositionColumns(
  onRefresh: () => void,
  onEditProportion: (position: TablePosition) => void
): ColumnDef<TablePosition>[] {
  return [
    // Checkbox column for row selection
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // Ticker column
    {
      accessorKey: "ticker",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ticker" />
      ),
      cell: ({ row }) => {
        const instrumentType = formatInstrumentType(
          row.original.instrument_type
        );
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-primary-text">
              {row.getValue("ticker")}
            </span>
            <Badge
              className={`${instrumentType.color} text-white text-xs px-2 py-0.5`}
            >
              {instrumentType.label}
            </Badge>
          </div>
        );
      },
      enableSorting: true,
      enableHiding: false,
    },

    // Name column
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="text-primary-text">{row.getValue("name")}</span>
      ),
      enableSorting: true,
    },

    // Price column
    {
      accessorKey: "current_price",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Price"
          className="text-right"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right text-primary-text">
          {formatMoneyValue(row.original.current_price)}
        </div>
      ),
      enableSorting: true,
    },

    // Quantity column
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Quantity"
          className="text-right"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right text-primary-text">
          {formatQuotation({
            units: row.original.quantity,
            nano: 0,
          })}
        </div>
      ),
      enableSorting: true,
    },

    // Total value column
    {
      accessorKey: "total",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Total"
          className="text-right"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium text-primary-text">
          {formatMoneyValue(row.original.total)}
        </div>
      ),
      enableSorting: true,
    },

    // Plan Total column
    {
      accessorKey: "plan_total",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Plan Total"
          className="text-right"
        />
      ),
      cell: ({ row }) => (
        <div className="text-right text-secondary-text">
          {row.original.plan_total
            ? formatMoneyValue(row.original.plan_total)
            : "-"}
        </div>
      ),
      enableSorting: true,
    },

    // Proportion column with current and target
    {
      accessorKey: "proportion_in_portfolio",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Proportion"
          className="text-right"
        />
      ),
      cell: ({ row }) => {
        const currentProportion = row.getValue<number>(
          "proportion_in_portfolio"
        );
        const planProportion = row.original.plan_proportion_in_portfolio;

        return (
          <div className="flex flex-col gap-1.5 items-end">
            <span className="font-medium">
              {formatPercent(currentProportion)}
            </span>
            {planProportion != null && (
              <button
                type="button"
                onClick={() => onEditProportion(row.original)}
                className="px-2 py-0.5 text-xs font-medium bg-card hover:bg-card/80 border border-border hover:border-border/80 rounded text-text-secondary hover:text-text-primary transition-all"
                title="Click to edit target proportion"
              >
                → {formatPercent(planProportion)}
              </button>
            )}
          </div>
        );
      },
      enableSorting: true,
    },

    // Profit column with color coding
    {
      accessorKey: "profit_percentage",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Profit"
          className="text-right"
        />
      ),
      cell: ({ row }) => {
        const profitPercentage = row.original.profit_percentage;
        const profitDisplay = formatProfitDisplay(profitPercentage);
        const profit = row.original.profit;

        return (
          <div
            className={`text-right font-medium ${profitDisplay.color}`}
          >
            <div className="flex flex-col items-end">
              <span>{profit ? formatMoneyValue(profit) : "-"}</span>
              <div className="flex items-center justify-end gap-1 text-xs">
                <span className="material-symbols-outlined text-sm">
                  {profitDisplay.icon}
                </span>
                <span>{profitDisplay.text}</span>
              </div>
            </div>
          </div>
        );
      },
      enableSorting: true,
    },

    // Target Progress column
    {
      accessorKey: "target_progress",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Target Progress" />
      ),
      cell: ({ row }) => {
        const targetProgress =
          row.original.target_progress != null
            ? row.original.target_progress * 100
            : null;

        if (targetProgress === null) {
          return null;
        }

        return (
          <div className="w-32">
            <Progress
              value={targetProgress}
              color={targetProgress >= 0 ? "success" : "coral"}
              showLabel
              size="sm"
            />
          </div>
        );
      },
      enableSorting: true,
    },

    // To Buy/Sell column with clickable badge
    {
      accessorKey: "to_buy_lots",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Action" />
      ),
      cell: ({ row }) => {
        const position = row.original;
        const toBuyLots = position.to_buy_lots;
        const [isDialogOpen, setIsDialogOpen] = useState(false);

        if (toBuyLots === 0) {
          return <div className="text-center text-secondary-text">-</div>;
        }

        const isBuy = toBuyLots > 0;
        const lots = Math.abs(toBuyLots);
        const orderType = isBuy ? "BUY" : "SELL";

        return (
          <>
            <div className="text-center">
              <button
                onClick={() => setIsDialogOpen(true)}
                className="inline-block transition-transform hover:scale-105 active:scale-95"
              >
                <Badge
                  className={`${
                    isBuy ? "bg-success" : "bg-coral"
                  } cursor-pointer hover:opacity-90`}
                >
                  {orderType} {lots}
                </Badge>
              </button>
            </div>

            {/* Order Dialog */}
            <OrderDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              position={position}
              orderType={orderType}
              recommendedLots={lots}
              onSuccess={onRefresh}
            />
          </>
        );
      },
      enableSorting: true,
    },

    // Actions column
    {
      id: "actions",
      cell: ({ row }) => (
        <PositionRowActions row={row} onEditProportion={onEditProportion} />
      ),
    },
  ];
}

