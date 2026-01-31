"use client";

import type { CurrencyBreakdown as CurrencyBreakdownType } from "@/types/portfolio";
import { formatMoneyValue, moneyValueToNumber } from "@/lib/utils/money";

interface CurrencyBreakdownProps {
  breakdown: CurrencyBreakdownType;
  baseCurrency: string;
}

export function CurrencyBreakdown({
  breakdown,
  baseCurrency,
}: CurrencyBreakdownProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-2xl font-bold text-text-primary">
          {formatMoneyValue(breakdown.total_value, {
            showCurrency: true,
            currency: baseCurrency,
            decimals: 2,
          })}
        </p>
      </div>

      {breakdown.holdings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-secondary">
                <th className="text-left py-2 px-3 text-sm font-medium text-text-secondary">
                  Currency
                </th>
                <th className="text-right py-2 px-3 text-sm font-medium text-text-secondary">
                  Amount
                </th>
                <th className="text-right py-2 px-3 text-sm font-medium text-text-secondary">
                  Value ({baseCurrency.toUpperCase()})
                </th>
              </tr>
            </thead>
            <tbody>
              {breakdown.holdings.map((holding) => (
                <tr
                  key={holding.currency_code}
                  className="border-b border-border-tertiary last:border-0"
                >
                  <td className="py-3 px-3 text-sm text-text-primary">
                    {holding.currency_name}
                  </td>
                  <td className="py-3 px-3 text-sm text-text-primary text-right font-mono">
                    {parseFloat(holding.amount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-3 px-3 text-sm text-text-primary text-right font-mono">
                    {formatMoneyValue(holding.value_in_base_currency, {
                      showCurrency: false,
                      decimals: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {breakdown.holdings.length === 0 && (
        <p className="text-sm text-text-secondary italic">
          No currency holdings
        </p>
      )}
    </div>
  );
}
