import React, { useMemo, useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/Progress';
import Button from '@/components/ui/Button';

import { EnrichedPosition, PlanPosition } from '@/types/portfolio';
import {
  formatMoneyValue,
  formatQuotation,
  formatPercent,
} from '@/utils/formatters';
import {
  formatProfitDisplay,
  formatInstrumentType,
} from '@/lib/utils/position';

interface PortfolioTableProps {
  enrichedPositions: EnrichedPosition[];
  planPositions: PlanPosition[];
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

export function PortfolioTable({
  enrichedPositions,
  planPositions,
  onSort,
}: PortfolioTableProps) {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{
    ticker: string;
    name: string;
    currentProportion: string;
    targetProportion: string;
  } | null>(null);
  const [editedProportion, setEditedProportion] = useState('');

  // Create lookup map for plan data
  const planLookup = useMemo(
    () => new Map(planPositions.map(p => [p.figi, p])),
    [planPositions]
  );

  const handleProportionClick = (
    position: EnrichedPosition,
    plan: PlanPosition | undefined
  ) => {
    if (!plan) return;

    setSelectedPosition({
      ticker: position.ticker,
      name: position.name,
      currentProportion: position.proportion_in_portfolio,
      targetProportion: plan.plan_proportion_in_portfolio,
    });
    setEditedProportion(
      (parseFloat(plan.plan_proportion_in_portfolio) * 100).toFixed(2)
    );
    setIsModalOpen(true);
  };

  const handleSaveProportion = () => {
    // TODO: Implement API call to update target proportion
    console.log('Save proportion:', selectedPosition?.ticker, editedProportion);
    setIsModalOpen(false);
  };

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
            {enrichedPositions.map(position => {
              const plan = planLookup.get(position.figi);
              const targetProgress = plan
                ? parseFloat(plan.target_progress) * 100
                : 0;
              const profitDisplay = formatProfitDisplay(
                parseFloat(position.profit_fifo)
              );
              const instrumentType = formatInstrumentType(
                position.instrument_type
              );

              return (
                <TableRow
                  key={position.figi}
                  className="hover:bg-muted/50"
                >
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
                    {plan ? formatMoneyValue(plan.plan_total) : '-'}
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
                          className="px-2 py-0.5 text-xs font-medium bg-card hover:bg-card/80 border border-border hover:border-border/80 rounded text-text-secondary hover:text-text-primary transition-all"
                          title="Click to edit target proportion"
                        >
                          → {formatPercent(plan.plan_proportion_in_portfolio)}
                        </button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${profitDisplay.color}`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span className="material-symbols-outlined text-sm">
                        {profitDisplay.icon}
                      </span>
                      <span>{profitDisplay.text}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {plan && (
                      <div className="w-32">
                        <Progress
                          value={targetProgress}
                          color={targetProgress >= 0 ? 'success' : 'coral'}
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

      {/* Edit Target Proportion Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Target Proportion</DialogTitle>
            <DialogDescription>
              Adjust the target portfolio proportion for{' '}
              {selectedPosition?.ticker} ({selectedPosition?.name})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-primary-text">
                Current Proportion
              </label>
              <div className="text-lg font-semibold text-secondary-text">
                {selectedPosition &&
                  formatPercent(selectedPosition.currentProportion)}
              </div>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-primary-text"
                htmlFor="target-proportion"
              >
                Target Proportion (%)
              </label>
              <input
                id="target-proportion"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={editedProportion}
                onChange={e => setEditedProportion(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProportion}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
