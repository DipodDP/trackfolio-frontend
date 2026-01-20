"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/Badge";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import { TablePosition } from "@/types/position";
import { formatMoneyValue } from "@/lib/utils/money";
import {
  formatProfitDisplay,
  formatInstrumentType,
} from "@/lib/utils/position";
import { PositionRowActions } from "../row-actions/PositionRowActions";
import { OrderDialog } from "../dialogs/OrderDialog";

/**
 * Create position table columns with refresh callback
 * @param onRefresh - Callback to refresh data after order execution
 */
export function createPositionColumns(
  onRefresh: () => void
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
      cell: ({ row }) => (
        <div className="w-[80px] font-mono font-semibold text-primary-text">
          {row.getValue("ticker")}
        </div>
      ),
      enableSorting: true,
      enableHiding: false,
    },

    // Name column with instrument type badge
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const instrumentType = formatInstrumentType(row.original.instrument_type);

        return (
          <div className="flex items-center space-x-2 max-w-[300px]">
            <Badge
              className={`${instrumentType.color} text-white text-xs px-2 py-0.5`}
            >
              {instrumentType.label}
            </Badge>
            <span className="truncate font-medium text-primary-text">
              {row.getValue("name")}
            </span>
          </div>
        );
      },
      enableSorting: true,
    },

    // Price column
    {
      accessorKey: "current_price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        const currency = row.original.current_price.currency;
        return (
          <div className="text-right font-medium text-primary-text w-[100px]">
            {formatMoneyValue(row.original.current_price, { decimals: 2, currency: currency })}
          </div>
        );
      },
      enableSorting: true,
    },

    // Quantity column
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Qty" />
      ),
      cell: ({ row }) => {
        const quantity = row.getValue<number>("quantity");
        return (
          <div className="text-right font-medium text-primary-text w-[80px]">
            {typeof quantity === "number" ? quantity.toFixed(0) : ""}
          </div>
        );
      },
      enableSorting: true,
    },

    // Total value column
    {
      accessorKey: "total",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Total" />
      ),
      cell: ({ row }) => {
        const currency = row.original.total.currency;
        return (
          <div className="text-right font-semibold text-primary-text w-[120px]">
            {formatMoneyValue(row.original.total, { decimals: 2, currency: currency })}
          </div>
        );
      },
      enableSorting: true,
    },

    // Plan Total column
    {
      accessorKey: "plan_total",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plan Total" />
      ),
      cell: ({ row }) => {
        const planTotal = row.original.plan_total;
        const currency = row.original.plan_total.currency;
        return (
          <div className="text-right font-medium text-secondary-text w-[120px]">
            {formatMoneyValue(planTotal, { decimals: 2, currency: currency })}
          </div>
        );
      },
      enableSorting: true,
    },

    // Proportion column with current and target
    {
      accessorKey: "proportion_in_portfolio",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Proportion" />
      ),
      cell: ({ row }) => {
        const currentProportion = row.getValue<number>("proportion_in_portfolio");
        const planProportion = row.original.plan_proportion_in_portfolio;
        const toBuyLots = row.original.to_buy_lots;

        const currentFormatted =
          typeof currentProportion === "number"
            ? (currentProportion * 100).toFixed(2)
            : "0.00";
        const planFormatted =
          typeof planProportion === "number"
            ? (planProportion * 100).toFixed(2)
            : "0.00";

        return (
          <div className="text-right w-[100px]">
            <div className="font-semibold text-primary-text">
              {currentFormatted}%
            </div>
            {planProportion > 0 && (
              <div className="text-xs text-secondary-text flex items-center justify-end gap-1">
                <span>→ {planFormatted}%</span>
                {toBuyLots !== 0 && (
                  <span
                    className={`material-symbols-outlined text-xs ${
                      toBuyLots > 0 ? "text-success" : "text-coral"
                    }`}
                  >
                    {toBuyLots > 0 ? "trending_up" : "trending_down"}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
      enableSorting: true,
    },

    // Profit column with color coding
    {
      accessorKey: "profit_fifo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Profit" />
      ),
      cell: ({ row }) => {
        const profitFifo = row.getValue<number | undefined>("profit_fifo");
        const profitDisplay = formatProfitDisplay(
          typeof profitFifo === "number" ? profitFifo : 0
        );

        return (
          <div
            className={`flex items-center justify-end gap-1 min-w-[100px] ${profitDisplay.color}`}
          >
            <span className="material-symbols-outlined text-sm">
              {profitDisplay.icon}
            </span>
            <span className="font-semibold">{profitDisplay.text}</span>
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
        const targetProgress = row.getValue<number | null>("target_progress");

        if (targetProgress === null) {
          return (
            <div className="text-right text-secondary-text w-[120px]">N/A</div>
          );
        }

        const percentage =
          typeof targetProgress === "number"
            ? (targetProgress * 100).toFixed(2)
            : "0.00";
        const isPositive = targetProgress >= 0;

        return (
          <div className="w-[120px]">
            <div className="flex items-center justify-end gap-2">
              <div className="flex-1 h-2 bg-card-foreground/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    isPositive ? "bg-success" : "bg-coral"
                  } transition-all`}
                  style={{
                    width: `${Math.min(Math.abs(targetProgress) * 100, 100)}%`,
                  }}
                />
              </div>
              <span
                className={`text-xs font-medium ${
                  isPositive ? "text-success" : "text-coral"
                }`}
              >
                {percentage}%
              </span>
            </div>
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
          return (
            <div className="text-center text-secondary-text w-[80px]">-</div>
          );
        }

        const isBuy = toBuyLots > 0;
        const lots = Math.abs(toBuyLots);
        const orderType = isBuy ? "BUY" : "SELL";

        return (
          <>
            <div className="text-center w-[80px]">
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
      cell: ({ row }) => <PositionRowActions row={row} />,
    },
  ];
}
