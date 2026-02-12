import React, { useMemo, useState, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";

import { EnrichedPosition, PlanPosition } from "@/types/portfolio";
import {
  formatMoneyValue,
  formatQuotation,
  formatPercent,
} from "@/utils/formatters";
import {
  formatProfitDisplay,
  formatInstrumentType,
} from "@/lib/utils/position";
import { TablePosition } from "@/types/position";
import { EditTargetsDialog } from "@/app/positions/components/dialogs/EditTargetsDialog";

interface PortfolioTableProps {
  enrichedPositions: EnrichedPosition[];
  planPositions: PlanPosition[];
  hideZeroAllocation: boolean;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  onRefresh?: () => void;
}

export function PortfolioTable({
  enrichedPositions,
  planPositions,
  hideZeroAllocation,
  onSort,
  onRefresh,
}: PortfolioTableProps) {
  const [editProportionModal, setEditProportionModal] =
    useState<TablePosition | null>(null);

  const planLookup = useMemo(
    () => new Map(planPositions.map((p) => [p.figi, p])),
    [planPositions]
  );

  const filteredPositions = useMemo(() => {
    if (hideZeroAllocation) {
      return enrichedPositions.filter((p) => {
        const plan = planLookup.get(p.figi);
        return plan && parseFloat(plan.plan_proportion_in_portfolio) > 0;
      });
    }
    return enrichedPositions;
  }, [enrichedPositions, planLookup, hideZeroAllocation]);

  const sortedPositions = useMemo(() => {
    const instrumentTypeOrder: Record<string, number> = {
      bond: 0,
      etf: 1,
      share: 2,
    };

    return [...filteredPositions].sort((a, b) => {
      const typeA = a.instrument_type.toLowerCase();
      const typeB = b.instrument_type.toLowerCase();

      const orderA = instrumentTypeOrder[typeA] ?? 3;
      const orderB = instrumentTypeOrder[typeB] ?? 3;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return (
        parseFloat(b.proportion_in_portfolio) -
        parseFloat(a.proportion_in_portfolio)
      );
    });
  }, [filteredPositions]);

  const handleProportionClick = useCallback(
    (position: EnrichedPosition, plan: PlanPosition | undefined) => {
      if (!plan) return;

      const tablePosition: TablePosition = {
        figi: position.figi,
        ticker: position.ticker,
        name: position.name,
        instrument_type: position.instrument_type as TablePosition['instrument_type'],
        quantity: position.quantity.units,
        current_price: position.current_price,
        total: position.total,
        proportion: parseFloat(position.proportion),
        proportion_in_portfolio: parseFloat(position.proportion_in_portfolio),
        profit: position.total_pnl,
        profit_percentage: position.total_profit_percent !== null
          ? parseFloat(position.total_profit_percent)
          : parseFloat(position.profit),
        lot: position.lot_size,
        realized_pnl: position.realized_pnl,
        unrealized_pnl: position.unrealized_pnl,
        total_pnl: position.total_pnl,
        total_profit_percent: position.total_profit_percent !== null
          ? parseFloat(position.total_profit_percent)
          : null,
        unrealized_profit_percent: parseFloat(position.profit),
        profit_fifo: parseFloat(position.profit_fifo),
        expected_yield: position.expected_yield,
        total_nkd: position.total_nkd,
        plan_quantity: plan.plan_quantity.units,
        plan_total: plan.plan_total,
        plan_proportion_in_portfolio: parseFloat(plan.plan_proportion_in_portfolio),
        to_buy_lots: plan.to_buy_lots.units,
        target_profit: parseFloat(plan.target_profit),
        exit_drawdown: parseFloat(plan.exit_drawdown),
        exit_profit_price: plan.exit_profit_price,
        exit_loss_price: plan.exit_loss_price,
        target_progress: parseFloat(plan.target_progress),
      };

      setEditProportionModal(tablePosition);
    },
    []
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary-text">Ticker</TableHead>
              <TableHead className="text-primary-text">Name</TableHead>
              <TableHead className="text-primary-text text-right">
                Price
              </TableHead>
              <TableHead className="text-primary-text text-right">
                Quantity
              </TableHead>
              <TableHead className="text-primary-text text-right">
                Total
              </TableHead>
              <TableHead className="text-primary-text text-right">
                Plan Total
              </TableHead>
              <TableHead className="text-primary-text text-right">
                Proportion
              </TableHead>
              <TableHead className="text-primary-text text-right">
                Profit
              </TableHead>
              <TableHead className="text-primary-text">
                Target Progress
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPositions.map((position) => {
              const plan = planLookup.get(position.figi);
              const targetProgress = plan
                ? parseFloat(plan.target_progress) * 100
                : 0;
              const profitPercentage = position.total_profit_percent !== null
                ? parseFloat(position.total_profit_percent)
                : parseFloat(position.profit);
              const profitValue = position.total_pnl;

              const profitDisplay = formatProfitDisplay(profitPercentage);
              const instrumentType = formatInstrumentType(
                position.instrument_type
              );

              return (
                <TableRow key={position.figi} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-primary-text font-medium">
                        {position.ticker}
                      </span>
                      <Badge
                        className={`${instrumentType.color} text-white text-xs px-2 py-0.5`}
                      >
                        {instrumentType.label}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-primary-text">
                    {position.name}
                  </TableCell>
                  <TableCell className="text-right text-primary-text">
                    {formatMoneyValue(position.current_price)}
                  </TableCell>
                  <TableCell className="text-right text-primary-text">
                    {formatQuotation(position.quantity)}
                  </TableCell>
                  <TableCell className="text-right text-primary-text font-medium">
                    {formatMoneyValue(position.total)}
                  </TableCell>
                  <TableCell className="text-right text-secondary-text">
                    {plan ? formatMoneyValue(plan.plan_total) : "-"}
                  </TableCell>
                  <TableCell className="text-right text-primary-text">
                    <div className="flex flex-col gap-1.5 items-end">
                      <span className="font-medium">
                        {formatPercent(position.proportion_in_portfolio)}
                      </span>
                      {plan && (
                        <button
                          type="button"
                          onClick={() => handleProportionClick(position, plan)}
                          className="px-2 py-0.5 text-xs font-medium bg-card hover:bg-card/80 border border-border hover:border-border/80 rounded text-text-secondary hover:text-text-primary transition-all flex items-center justify-center gap-1"
                          title="Click to edit targets of the position"
                        >
                          <span className="material-symbols-outlined text-[6px]">track_changes</span> {formatPercent(plan.plan_proportion_in_portfolio)}
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${profitDisplay.color}`}
                  >
                    <div className="flex flex-col items-end">
                      <span>{profitValue ? formatMoneyValue(profitValue) : "—"}</span>
                      <div className="flex items-center justify-end gap-1 text-xs">
                        <span className="material-symbols-outlined text-sm">
                          {profitDisplay.icon}
                        </span>
                        <span>{profitDisplay.text}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {plan && (
                      <div className="w-32">
                        <Progress
                          value={targetProgress}
                          color={targetProgress >= 0 ? "success" : "coral"}
                          showLabel
                          size="sm"
                        />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <EditTargetsDialog
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
