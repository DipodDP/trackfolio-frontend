import React, { useMemo, useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { EnrichedPosition, PlanPosition } from '@/types/portfolio';
import {
  formatMoneyValue,
  formatQuotation,
  formatPercent,
  getProfitColorClass
} from '@/utils/formatters';

interface PortfolioTableProps {
  enrichedPositions: EnrichedPosition[];
  planPositions: PlanPosition[];
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

export function PortfolioTable({
  enrichedPositions,
  planPositions,
  onSort
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

  const handleProportionClick = (position: EnrichedPosition, plan: PlanPosition | undefined) => {
    if (!plan) return;

    setSelectedPosition({
      ticker: position.ticker,
      name: position.name,
      currentProportion: position.proportion_in_portfolio,
      targetProportion: plan.plan_proportion_in_portfolio,
    });
    setEditedProportion((parseFloat(plan.plan_proportion_in_portfolio) * 100).toFixed(2));
    setIsModalOpen(true);
  };

  const handleSaveProportion = () => {
    // TODO: Implement API call to update target proportion
    console.log('Save proportion:', selectedPosition?.ticker, editedProportion);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="font-bold text-text-secondary">Ticker</TableHead>
              <TableHead className="font-bold text-text-secondary">Name</TableHead>
              <TableHead className="font-bold text-text-secondary text-right">Price</TableHead>
              <TableHead className="font-bold text-text-secondary text-right">Quantity</TableHead>
              <TableHead className="font-bold text-text-secondary text-right">Total</TableHead>
              <TableHead className="font-bold text-text-secondary text-right">Plan Total</TableHead>
              <TableHead className="font-bold text-text-secondary text-right">Proportion</TableHead>
              <TableHead className="font-bold text-text-secondary text-right">Profit</TableHead>
              <TableHead className="font-bold text-text-secondary">Target Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrichedPositions.map(position => {
              const plan = planLookup.get(position.figi);
              const targetProgress = plan ? parseFloat(plan.target_progress) * 100 : 0;

              return (
                <TableRow key={position.figi} className="group hover:bg-muted/50 border-b border-border/50 last:border-0">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-text-primary font-medium">{position.ticker}</span>
                      <Badge variant="outline" className="text-xs border-border bg-muted text-text-secondary">
                        {position.instrument_type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 text-text-primary">{position.name}</TableCell>
                  <TableCell className="py-3 text-right text-text-primary">
                    {formatMoneyValue(position.current_price)}
                  </TableCell>
                  <TableCell className="py-3 text-right text-text-primary">
                    {formatQuotation(position.quantity)}
                  </TableCell>
                  <TableCell className="py-3 text-right text-text-primary font-medium">
                    {formatMoneyValue(position.total)}
                  </TableCell>
                  <TableCell className="py-3 text-right text-text-secondary">
                    {plan ? formatMoneyValue(plan.plan_total) : '-'}
                  </TableCell>
                  <TableCell className="py-3 text-right text-text-primary">
                    <div className="flex flex-col gap-1.5 items-end">
                      <span className="font-medium">{formatPercent(position.proportion_in_portfolio)}</span>
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
                  <TableCell className={`py-3 text-right font-medium ${getProfitColorClass(position.profit_fifo)}`}>
                    {position.profit_fifo.startsWith('-') ? '▼' : '▲'} {formatPercent(position.profit_fifo)}
                  </TableCell>
                  <TableCell className="py-3">
                    {plan && (
                      <div className="flex items-center gap-2 w-32">
                        <div className="h-3 border border-border rounded-full w-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${Math.min(targetProgress, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-secondary whitespace-nowrap">
                          {targetProgress.toFixed(0)}%
                        </span>
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
              Adjust the target portfolio proportion for {selectedPosition?.ticker} ({selectedPosition?.name})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Current Proportion
              </label>
              <div className="text-lg font-semibold text-text-secondary">
                {selectedPosition && formatPercent(selectedPosition.currentProportion)}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="target-proportion">
                Target Proportion (%)
              </label>
              <input
                id="target-proportion"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={editedProportion}
                onChange={(e) => setEditedProportion(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProportion}
              className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
