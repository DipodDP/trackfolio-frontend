"use client";

import { Badge, Progress } from "@/components/ui";

export interface Position {
  ticker: string;
  name: string;
  instrumentType: string;
  price: number;
  quantity: number;
  total: number;
  planTotal: number;
  proportion: number;
  profit: {
    amount: number;
    percent: number;
  };
  targetProgress: number;
}

interface PositionsTableProps {
  positions: Position[];
  currency?: string;
  isLoading?: boolean;
}

function formatCurrency(value: number, currency = "$"): string {
  return `${currency}${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(0)}%`;
}

export function PositionsTable({
  positions,
  currency = "$",
  isLoading = false,
}: PositionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton h-12 w-full" />
        ))}
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="text-center py-12 text-secondary-text">
        <span className="material-symbols-outlined text-4xl mb-2 block">
          inventory_2
        </span>
        <p>No positions yet</p>
        <p className="text-sm mt-1">Search for instruments to add to your portfolio</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Name</th>
            <th className="text-right">Price</th>
            <th className="text-right">Qty</th>
            <th className="text-right">Total</th>
            <th className="text-right">Plan Total</th>
            <th className="text-right">Weight</th>
            <th className="text-right">Profit</th>
            <th>Target Progress</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position, index) => (
            <tr key={index} className="group">
              <td>
                <div className="flex items-center gap-2">
                  <span className="text-primary-text font-medium">
                    {position.ticker}
                  </span>
                  <Badge variant="neutral" className="text-[10px] py-0">
                    {position.instrumentType}
                  </Badge>
                </div>
              </td>
              <td className="text-primary-text">{position.name}</td>
              <td className="text-right text-primary-text">
                {formatCurrency(position.price, currency)}
              </td>
              <td className="text-right text-primary-text">{position.quantity}</td>
              <td className="text-right text-primary-text">
                {formatCurrency(position.total, currency)}
              </td>
              <td className="text-right text-secondary-text">
                {formatCurrency(position.planTotal, currency)}
              </td>
              <td className="text-right text-primary-text">{position.proportion}%</td>
              <td className="text-right">
                <span className={position.profit.amount >= 0 ? "text-success" : "text-error"}>
                  {position.profit.amount >= 0 ? "+" : ""}
                  {formatCurrency(position.profit.amount, currency)} (
                  {formatPercent(position.profit.percent)})
                </span>
              </td>
              <td>
                <div className="w-32">
                  <Progress
                    value={position.targetProgress}
                    showLabel
                    size="sm"
                    color={position.targetProgress >= 80 ? "coral" : "coral"}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PositionsTable;
