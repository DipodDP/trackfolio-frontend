import React from 'react';
import { ConsolidatedPortfolio, MoneyValue, AssetClassProportions } from '@/types/portfolio';
import { formatMoneyValue, formatPercent } from '@/utils/formatters'; // Import formatPercent
import { Card } from '@/components/ui'; // Assuming Card is available in ui

interface PortfolioSummaryProps {
  consolidated: ConsolidatedPortfolio;
  totalCash: MoneyValue;
  assetProportions: AssetClassProportions;
}

export function PortfolioSummary({
  consolidated,
  totalCash,
  assetProportions
}: PortfolioSummaryProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Portfolio Value */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-text-secondary">Total Portfolio Value</h3>
          <p className="text-2xl font-bold text-text-primary">
            {formatMoneyValue(consolidated.total_amount_portfolio)}
          </p>
        </Card>

        {/* Cash Balance */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-text-secondary">Cash Balance</h3>
          <p className="text-2xl font-bold text-text-primary">
            {formatMoneyValue(consolidated.cash_balance)}
          </p>
        </Card>
      </div>

      {/* Asset Class Breakdown */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Asset Class Breakdown</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {/* Shares */}
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Shares:</span>
            <span className="font-semibold text-text-primary">
              {formatMoneyValue(consolidated.total_amount_shares)} ({formatPercent(parseFloat(assetProportions.shares))})
            </span>
          </div>

          {/* Bonds */}
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Bonds:</span>
            <span className="font-semibold text-text-primary">
              {formatMoneyValue(consolidated.total_amount_bonds)} ({formatPercent(parseFloat(assetProportions.bonds))})
            </span>
          </div>

          {/* ETFs */}
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">ETFs:</span>
            <span className="font-semibold text-text-primary">
              {formatMoneyValue(consolidated.total_amount_etf)} ({formatPercent(parseFloat(assetProportions.etf))})
            </span>
          </div>

          {/* Currencies */}
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Currencies:</span>
            <span className="font-semibold text-text-primary">
              {formatMoneyValue(consolidated.total_amount_currencies)} ({formatPercent(parseFloat(assetProportions.currencies))})
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
