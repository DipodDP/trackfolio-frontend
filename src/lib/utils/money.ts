import type { MoneyValue } from "@/types/api";

/**
 * Convert MoneyValue to decimal number
 * MoneyValue has units (integer part) and nano (fractional part, 10^-9)
 */
export function moneyValueToNumber(money: MoneyValue | number): number {
  if (typeof money === 'number') {
    return money;
  }
  return (money?.units ?? 0) + (money?.nano ?? 0) / 1_000_000_000;
}

/**
 * Format MoneyValue to display string
 * @param money MoneyValue object
 * @param options Formatting options
 */
export function formatMoneyValue(
  money: MoneyValue | number,
  options?: {
    showCurrency?: boolean;
    decimals?: number;
  }
): string {
  const value = moneyValueToNumber(money);
  const decimals = options?.decimals ?? 2;
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (options?.showCurrency !== false && typeof money !== 'number' && money?.currency) {
    const currencySymbol = getCurrencySymbol(money.currency);
    return `${currencySymbol}${formatted}`;
  }

  return formatted;
}

/**
 * Get currency symbol from currency code
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    RUB: "₽",
    JPY: "¥",
    CNY: "¥",
  };

  return symbols[currency.toUpperCase()] || currency + " ";
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): { value: string; isPositive: boolean } {
  if (previous === 0) {
    return { value: "0.00%", isPositive: true };
  }

  const change = ((current - previous) / previous) * 100;
  const isPositive = change >= 0;

  return {
    value: `${isPositive ? "+" : ""}${change.toFixed(2)}%`,
    isPositive,
  };
}
