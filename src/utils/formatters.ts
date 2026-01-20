import { MoneyValue, Quotation, VALID_CURRENCIES, CurrencyCode } from '@/types/portfolio';

// Assuming these icons are available from a UI library, otherwise need to be defined
// import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'; // Example import

/**
 * Converts MoneyValue to formatted currency string with validation.
 *
 * Validates currency code against supported currencies and falls back to RUB if invalid.
 * This provides defense-in-depth even though the backend now validates currencies.
 */
export function formatMoneyValue(
  mv: MoneyValue | null | undefined,
  locale: string = 'ru-RU'
): string {
  if (!mv) return '—';

  const amount = Number(mv.units) + Number(mv.nano) / 1_000_000_000;

  // Validate currency code - backend should now enforce this, but we validate defensively
  const currencyCode = mv.currency?.toUpperCase() as Uppercase<string>;

  // Check if currency is valid, otherwise use RUB as fallback
  const validCurrency: CurrencyCode = VALID_CURRENCIES.includes(currencyCode as CurrencyCode)
    ? (currencyCode as CurrencyCode)
    : 'RUB';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: validCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback to manual formatting if Intl fails
    return `${amount.toFixed(2)} ${validCurrency}`;
  }
}

/**
 * Converts Quotation to number
 */
export function quotationToNumber(q: Quotation): number {
  return Number(q.units) + Number(q.nano) / 1_000_000_000;
}

/**
 * Formats Quotation as string
 */
export function formatQuotation(q: Quotation): string {
  return quotationToNumber(q).toString();
}

/**
 * Formats string decimal as percentage
 */
export function formatPercent(
  value: string | number,
  decimals: number = 2
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `${(num * 100).toFixed(decimals)} %`;
}

/**
 * Gets Tailwind color class for profit value
 */
export function getProfitColorClass(profitFifo: string): string {
  const profit = parseFloat(profitFifo);
  if (profit > 0) return 'text-green-500';
  if (profit < 0) return 'text-red-500';
  return 'text-gray-500';
}

/**
 * Gets profit icon component
 * COMMENTED OUT: Icons (ArrowUpIcon, ArrowDownIcon) not defined in current context.
 * Will need to be implemented or imported from a UI library.
 */
/*
export function getProfitIcon(profitFifo: string): React.ReactNode {
  const profit = parseFloat(profitFifo);
  if (profit > 0) return <ArrowUpIcon className="w-4 h-4 text-green-500" />;
  if (profit < 0) return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
  return null;
}
*/

/**
 * Calculates disbalance between current and plan
 */
export function calculateDisbalance(
  current: string | number,
  plan: string | number
): string {
  const currentNum = typeof current === 'string' ? parseFloat(current) : current;
  const planNum = typeof plan === 'string' ? parseFloat(plan) : plan;
  const disbalance = currentNum - planNum;
  return formatPercent(disbalance);
}
