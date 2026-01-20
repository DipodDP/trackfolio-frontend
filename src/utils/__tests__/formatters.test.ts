import {
  formatMoneyValue,
  formatQuotation,
  formatPercent,
  getProfitColorClass,
  calculateDisbalance
} from '../formatters';

describe('formatMoneyValue', () => {
  it('should format RUB currency correctly', () => {
    const mv = { currency: 'RUB' as const, units: 1000, nano: 500000000 };
    const result = formatMoneyValue(mv);
    // Check that it contains the amount
    expect(result).toContain('1');
    expect(result).toContain('000');
    expect(result).toContain('50');
  });

  it('should normalize lowercase currency codes', () => {
    const mv = { currency: 'rub' as any, units: 1000, nano: 500000000 };
    const result = formatMoneyValue(mv);
    // Should handle lowercase and normalize to uppercase
    expect(result).toContain('1');
    expect(result).toContain('000');
    expect(result).toContain('50');
  });

  it('should format USD currency correctly', () => {
    const mv = { currency: 'USD' as const, units: 150, nano: 250000000 };
    const result = formatMoneyValue(mv);
    expect(result).toContain('150');
    expect(result).toContain('25');
  });

  it('should format HKD currency correctly', () => {
    const mv = { currency: 'HKD' as const, units: 500, nano: 0 };
    const result = formatMoneyValue(mv);
    expect(result).toContain('500');
    expect(result).toContain('00');
  });

  it('should format TRY currency correctly', () => {
    const mv = { currency: 'TRY' as const, units: 200, nano: 750000000 };
    const result = formatMoneyValue(mv);
    expect(result).toContain('200');
    expect(result).toContain('75');
  });

  it('should handle null values', () => {
    expect(formatMoneyValue(null)).toBe('—');
    expect(formatMoneyValue(undefined)).toBe('—');
  });

  it('should handle zero nano', () => {
    const mv = { currency: 'RUB' as const, units: 5000, nano: 0 };
    const result = formatMoneyValue(mv);
    expect(result).toContain('5');
    expect(result).toContain('000');
    expect(result).toContain('00');
  });

  it('should handle empty currency string as RUB fallback', () => {
    const mv = { currency: '' as any, units: 1000, nano: 0 };
    const result = formatMoneyValue(mv);
    // Should use RUB fallback and not throw error
    expect(result).toContain('1');
    expect(result).toContain('000');
    expect(result).toContain('00');
  });

  it('should handle invalid currency code with fallback', () => {
    const mv = { currency: 'INVALID' as any, units: 500, nano: 0 };
    const result = formatMoneyValue(mv);
    // Should use RUB fallback and not throw error
    expect(result).toContain('500');
    expect(result).toContain('00');
  });

  it('should handle undefined currency with fallback', () => {
    const mv = { currency: undefined as any, units: 100, nano: 0 };
    const result = formatMoneyValue(mv);
    // Should not throw error
    expect(result).toBeTruthy();
    expect(result).toContain('100');
  });
});

describe('formatQuotation', () => {
  it('should convert quotation to number string', () => {
    expect(formatQuotation({ units: 450, nano: 0 })).toBe('450');
  });

  it('should handle fractional units', () => {
    expect(formatQuotation({ units: 10, nano: 500000000 })).toBe('10.5');
  });
});

describe('formatPercent', () => {
  it('should format string decimal as percentage', () => {
    expect(formatPercent('0.0522')).toBe('5.22 %');
  });

  it('should format number as percentage', () => {
    expect(formatPercent(0.7050)).toBe('70.50 %');
  });

  it('should handle negative values', () => {
    expect(formatPercent('-0.2583')).toBe('-25.83 %');
  });

  it('should respect decimal places parameter', () => {
    expect(formatPercent('0.123456', 4)).toBe('12.3456 %');
  });
});

describe('getProfitColorClass', () => {
  it('should return green for positive profit', () => {
    expect(getProfitColorClass('0.1114')).toBe('text-green-500');
  });

  it('should return red for negative profit', () => {
    expect(getProfitColorClass('-0.7861')).toBe('text-red-500');
  });

  it('should return gray for zero profit', () => {
    expect(getProfitColorClass('0.0000')).toBe('text-gray-500');
  });
});

describe('calculateDisbalance', () => {
  it('should calculate difference between current and plan', () => {
    expect(calculateDisbalance('0.7050', '0.7000')).toBe('0.50 %');
  });

  it('should handle negative disbalance', () => {
    expect(calculateDisbalance('0.2950', '0.3000')).toBe('-0.50 %');
  });
});
