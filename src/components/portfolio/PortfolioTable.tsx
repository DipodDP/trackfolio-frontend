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
import { moneyValueToNumber } from "@/lib/utils/money";
import {
  formatProfitDisplay,
  formatInstrumentType,
} from "@/lib/utils/position";
import { TablePosition } from "@/types/position";
import { EditTargetsDialog } from "@/app/positions/components/dialogs/EditTargetsDialog";

interface PortfolioTableProps {
  enrichedPositions: EnrichedPosition[];
  planPositions: PlanPosition[];
  onSort?: (column: string, direction: "asc" | "desc") => void;
  onRefresh?: () => void;
}

export function PortfolioTable({
  enrichedPositions,
  planPositions,
  onSort,
  onRefresh,
}: PortfolioTableProps) {
  const [editProportionModal, setEditProportionModal] =
    useState<TablePosition | null>(null);

  const planLookup = useMemo(
    () => new Map(planPositions.map((p) => [p.figi, p])),
    [planPositions]
  );

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
        profit: null, // Profit calculation is complex, omitting for now
        profit_percentage: parseFloat(position.profit),
        lot: position.lot_size,
        realized_pnl: position.realized_pnl,
        unrealized_pnl: position.unrealized_pnl,
        total_pnl: position.total_pnl,
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
            {enrichedPositions.map((position) => {
              const plan = planLookup.get(position.figi);
              const targetProgress = plan
                ? parseFloat(plan.target_progress) * 100
                : 0;
              const profitPercentage = parseFloat(position.profit);
              const totalValue = moneyValueToNumber(position.total);
              const profitAmount = totalValue * profitPercentage;

              const profitValue = {
                currency: position.total.currency,
                units: Math.floor(profitAmount),
                nano: Math.round(
                  (profitAmount - Math.floor(profitAmount)) * 1_000_000_000
                ),
              };

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
                      <span>{formatMoneyValue(profitValue)}</span>
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
