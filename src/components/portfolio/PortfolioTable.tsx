import React, { useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table'; // Assuming these UI components exist
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/Progress';

import { EnrichedPosition, PlanPosition } from '@/types/portfolio';
import {
  formatMoneyValue,
  formatQuotation,
  formatPercent,
  getProfitColorClass
  // getProfitIcon // Commented out as it's not implemented yet
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
  // Create lookup map for plan data
  const planLookup = useMemo(
    () => new Map(planPositions.map(p => [p.figi, p])),
    [planPositions]
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead><Checkbox /></TableHead>
          <TableHead>Ticker</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Plan Total</TableHead>
          <TableHead>Proportion</TableHead>
          <TableHead>Profit</TableHead>
          <TableHead>Target Progress</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {enrichedPositions.map(position => {
          const plan = planLookup.get(position.figi);

          return (
            <TableRow key={position.figi}>
              <TableCell><Checkbox /></TableCell>
              <TableCell>{position.ticker}</TableCell>
              <TableCell>{position.name}</TableCell>
              <TableCell>{formatMoneyValue(position.current_price)}</TableCell>
              <TableCell>{formatQuotation(position.quantity)}</TableCell>
              <TableCell>{formatMoneyValue(position.total)}</TableCell>
              <TableCell>{formatMoneyValue(plan?.plan_total)}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span>{formatPercent(position.proportion_in_portfolio)}</span>
                  {plan && (
                    <Badge variant="outline" className="cursor-pointer">
                      {formatPercent(plan.plan_proportion_in_portfolio)}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className={getProfitColorClass(position.profit_fifo)}>
                <div className="flex items-center gap-1">
                  {/* {getProfitIcon(position.profit_fifo)} */} {/* Commented out */}
                  <span>{formatPercent(position.profit_fifo)}</span>
                </div>
              </TableCell>
              <TableCell>
                {plan && (
                  <div className="flex items-center gap-2">
                    <Progress value={parseFloat(plan.target_progress) * 100} />
                    <span>{formatPercent(plan.target_progress)}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>⋮</DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
