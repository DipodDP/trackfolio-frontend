import type { MoneyValue } from "@/types/portfolio";

/**
 * Convert MoneyValue to decimal number
 * MoneyValue has units (integer part) and nano (fractional part, 10^-9)
 */
export function moneyValueToNumber(value: MoneyValue | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  // Assume it's MoneyValue
  return Number(value.units) + Number(value.nano) / 1_000_000_000;
}

/**
 * Format MoneyValue to display string
 * @param money MoneyValue object
 * @param options Formatting options
 */
export function formatMoneyValue(
  value: MoneyValue | number | null | undefined,
  options?: {
    showCurrency?: boolean;
    decimals?: number;
    currency?: string; // Add optional currency parameter
  }
): string {
  const numericValue = moneyValueToNumber(value);
  const decimals = options?.decimals ?? 2;
  const formatted = numericValue.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (options?.showCurrency !== false && options?.currency) {
    const currencySymbol = getCurrencySymbol(options.currency);
    return `${currencySymbol}${formatted}`;
  }

  return formatted;
}

/**
 * Get currency symbol from currency code
 */
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    RUB: "₽",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    CHF: "CHF",
    AUD: "A$",
    CAD: "C$",
    HKD: "HK$",
    TRY: "₺",
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