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
  const baseCurrency = consolidated.total_amount_portfolio.currency;

  return (
    <div className="space-y-6">
      {/* External Cash (if provided) */}
      {totalCash && totalCash.units > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-2">Total External Cash</h3>
          <p className="text-2xl font-bold text-text-primary">
            {formatMoneyValue(totalCash)}
          </p>
        </div>
      )}

      {/* Asset Class Breakdown */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3">Asset Allocation</h3>
        <div className="space-y-3">
          {/* Shares */}
          <div className="flex justify-between items-center py-2 border-b border-border-tertiary">
            <span className="text-sm text-text-secondary">Shares</span>
            <div className="text-right">
              <div className="text-sm font-semibold text-text-primary">
                {formatMoneyValue(consolidated.total_amount_shares)}
              </div>
              <div className="text-xs text-text-secondary">
                {formatPercent(parseFloat(assetProportions.shares))}
              </div>
            </div>
          </div>

          {/* Bonds */}
          <div className="flex justify-between items-center py-2 border-b border-border-tertiary">
            <span className="text-sm text-text-secondary">Bonds</span>
            <div className="text-right">
              <div className="text-sm font-semibold text-text-primary">
                {formatMoneyValue(consolidated.total_amount_bonds)}
              </div>
              <div className="text-xs text-text-secondary">
                {formatPercent(parseFloat(assetProportions.bonds))}
              </div>
            </div>
          </div>

          {/* ETFs */}
          <div className="flex justify-between items-center py-2 border-b border-border-tertiary">
            <span className="text-sm text-text-secondary">ETFs</span>
            <div className="text-right">
              <div className="text-sm font-semibold text-text-primary">
                {formatMoneyValue(consolidated.total_amount_etf)}
              </div>
              <div className="text-xs text-text-secondary">
                {formatPercent(parseFloat(assetProportions.etf))}
              </div>
            </div>
          </div>

          {/* Currencies */}
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-text-secondary">Currencies</span>
            <div className="text-right">
              <div className="text-sm font-semibold text-text-primary">
                {formatMoneyValue(consolidated.total_amount_currencies)}
              </div>
              <div className="text-xs text-text-secondary">
                {formatPercent(parseFloat(assetProportions.currencies))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
