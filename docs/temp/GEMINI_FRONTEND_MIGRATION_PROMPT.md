# Gemini CLI: Frontend Migration Implementation Prompt

**Project:** Trackfolio Portfolio Table Migration
**Date:** 2026-01-17
**Objective:** Migrate frontend from legacy `/api/portfolio` + `/api/structure` to new `/api/v1/api-clients/{id}/portfolio-analysis/full` endpoint

---

## 🎯 Your Mission

You are tasked with migrating the Trackfolio Next.js frontend to use the new consolidated portfolio analysis API endpoint. The migration is **low-risk** because all required data exists in the new API - you just need to update the data access paths.

**Key Constraint:** Follow TDD (Test-Driven Development) - write tests first, then implement.

---

## 📋 Prerequisites

Before starting, read these documents:

1. **docs/temp/FRONTEND_MIGRATION_REPORT.md** - Complete analysis with field mappings
2. **docs/temp/PORTFOLIO_API_MIGRATION_PLAN.md** - Backend context

**Critical Files to Understand:**
- `src/app/(root)/page.tsx` - Main portfolio dashboard
- `src/components/portfolio/` - Portfolio table components
- `src/services/api/` - API service layer
- `src/hooks/` - React Query hooks

---

## 🔧 Implementation Phases

### **PHASE 1: API Service Layer (Day 1)**

#### 1.1 Create TypeScript Types

**File:** `src/types/portfolio.ts`

**Task:** Define TypeScript interfaces matching the new API schema.

**Reference:** See Appendix B.1 in FRONTEND_MIGRATION_REPORT.md for complete type definitions.

**Test First (TDD):**
```typescript
// src/types/__tests__/portfolio.test.ts
describe('Portfolio Types', () => {
  it('should validate FullPortfolioAnalysisResponse structure', () => {
    const mockResponse: FullPortfolioAnalysisResponse = {
      consolidated_portfolio: { /* ... */ },
      enriched_positions: [],
      plan_positions: [],
      structure_analysis: { /* ... */ },
      total_additional_cash: { currency: 'rub', units: 0, nano: 0 },
      proportion_in_portfolio: { bonds: '0', shares: '0', etf: '0', currencies: '0' }
    };

    expect(mockResponse).toBeDefined();
    // TypeScript will error if structure is wrong
  });
});
```

**Implementation:**
```typescript
// Copy type definitions from FRONTEND_MIGRATION_REPORT.md Appendix B.1
export interface MoneyValue { /* ... */ }
export interface Quotation { /* ... */ }
export interface EnrichedPosition { /* ... */ }
// ... etc
```

**Verification:**
- [ ] Types compile without errors
- [ ] All fields from new API are represented
- [ ] Optional fields use `| null` or `| undefined`

---

#### 1.2 Create API Service Method

**File:** `src/services/api/portfolio.ts`

**Task:** Add `getFullPortfolioAnalysis()` method.

**Test First (TDD):**
```typescript
// src/services/api/__tests__/portfolio.test.ts
import { getFullPortfolioAnalysis } from '../portfolio';

describe('getFullPortfolioAnalysis', () => {
  it('should call correct endpoint with POST method', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockFullPortfolioAnalysisResponse
    } as Response);

    await getFullPortfolioAnalysis(123, { account_ids: ['2000000000'] });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/v1/api-clients/123/portfolio-analysis/full',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    );
  });

  it('should throw error if response is not ok', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    } as Response);

    await expect(
      getFullPortfolioAnalysis(123, { account_ids: [] })
    ).rejects.toThrow('Portfolio analysis failed');
  });

  it('should include authorization header', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({})
    } as Response);

    await getFullPortfolioAnalysis(123, { account_ids: ['2000000000'] });

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': expect.stringContaining('Bearer')
        })
      })
    );
  });
});
```

**Implementation:**
```typescript
export async function getFullPortfolioAnalysis(
  apiClientId: number,
  request: FullPortfolioAnalysisRequest
): Promise<FullPortfolioAnalysisResponse> {
  const response = await fetch(
    `/api/v1/api-clients/${apiClientId}/portfolio-analysis/full`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}` // Use existing auth utility
      },
      body: JSON.stringify(request)
    }
  );

  if (!response.ok) {
    throw new Error(`Portfolio analysis failed: ${response.statusText}`);
  }

  return response.json();
}
```

**Verification:**
- [ ] Tests pass with `npm test -- portfolio.test.ts`
- [ ] API call uses POST method
- [ ] Authorization header is included
- [ ] Error handling works correctly

---

#### 1.3 Create React Query Hook

**File:** `src/hooks/usePortfolioAnalysis.ts`

**Task:** Create custom hook wrapping React Query.

**Test First (TDD):**
```typescript
// src/hooks/__tests__/usePortfolioAnalysis.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePortfolioAnalysis } from '../usePortfolioAnalysis';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('usePortfolioAnalysis', () => {
  it('should not fetch if apiClientId is undefined', () => {
    const { result } = renderHook(
      () => usePortfolioAnalysis(undefined, ['2000000000']),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  it('should fetch data when apiClientId is provided', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockFullPortfolioAnalysisResponse
    } as Response);

    const { result } = renderHook(
      () => usePortfolioAnalysis(123, ['2000000000']),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('should update query when account_ids change', async () => {
    const { result, rerender } = renderHook(
      ({ accountIds }) => usePortfolioAnalysis(123, accountIds),
      {
        wrapper,
        initialProps: { accountIds: ['2000000000'] }
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Change account IDs
    rerender({ accountIds: ['2000000001'] });

    await waitFor(() => expect(result.current.isRefetching).toBe(true));
  });
});
```

**Implementation:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { getFullPortfolioAnalysis } from '@/services/api/portfolio';

export function usePortfolioAnalysis(
  apiClientId: number | undefined,
  accountIds: string[]
) {
  return useQuery({
    queryKey: ['portfolio-analysis', apiClientId, accountIds],
    queryFn: () => {
      if (!apiClientId) throw new Error('API client ID required');
      return getFullPortfolioAnalysis(apiClientId, { account_ids: accountIds });
    },
    enabled: !!apiClientId && accountIds.length > 0,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000 // Auto-refresh every minute
  });
}
```

**Verification:**
- [ ] Hook tests pass
- [ ] Query is disabled when apiClientId is undefined
- [ ] Query refetches when dependencies change
- [ ] Stale time and refetch interval are configured

---

### **PHASE 2: Utility Functions (Day 1)**

#### 2.1 Create Formatters

**File:** `src/utils/formatters.ts`

**Task:** Add formatting utilities for MoneyValue, Quotation, percentages.

**Test First (TDD):**
```typescript
// src/utils/__tests__/formatters.test.ts
import {
  formatMoneyValue,
  formatQuotation,
  formatPercent,
  getProfitColorClass,
  calculateDisbalance
} from '../formatters';

describe('formatMoneyValue', () => {
  it('should format RUB currency correctly', () => {
    const mv = { currency: 'rub', units: 1000, nano: 500000000 };
    expect(formatMoneyValue(mv)).toBe('1 000,50 ₽');
  });

  it('should format USD currency correctly', () => {
    const mv = { currency: 'usd', units: 150, nano: 250000000 };
    expect(formatMoneyValue(mv)).toContain('$150.25');
  });

  it('should handle null values', () => {
    expect(formatMoneyValue(null)).toBe('—');
    expect(formatMoneyValue(undefined)).toBe('—');
  });

  it('should handle zero nano', () => {
    const mv = { currency: 'rub', units: 5000, nano: 0 };
    expect(formatMoneyValue(mv)).toBe('5 000,00 ₽');
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
```

**Implementation:**
```typescript
// Copy implementations from FRONTEND_MIGRATION_REPORT.md Appendix B.2
export function formatMoneyValue(mv: MoneyValue | null | undefined, locale: string = 'ru-RU'): string {
  // ... implementation
}

export function quotationToNumber(q: Quotation): number {
  // ... implementation
}

// ... etc (see Appendix B.2)
```

**Verification:**
- [ ] All formatter tests pass
- [ ] Edge cases handled (null, zero, negative)
- [ ] Locale support works for RUB, USD, EUR

---

### **PHASE 3: Component Updates (Days 2-3)**

#### 3.1 Update Portfolio Table Component

**File:** `src/components/portfolio/PortfolioTable.tsx`

**Task:** Update to accept `enrichedPositions` and `planPositions` props.

**Test First (TDD):**
```typescript
// src/components/portfolio/__tests__/PortfolioTable.test.tsx
import { render, screen } from '@testing-library/react';
import { PortfolioTable } from '../PortfolioTable';

const mockEnrichedPositions = [
  {
    figi: 'BBG004730N88',
    ticker: 'SBER',
    name: 'Сбер Банк',
    lot_size: 1,
    quantity: { units: 450, nano: 0 },
    instrument_type: 'share',
    current_price: { currency: 'rub', units: 301, nano: 370000000 },
    corrected_average_price: { currency: 'rub', units: 142, nano: 448656250 },
    total: { currency: 'rub', units: 135616, nano: 500000000 },
    proportion: '0.1671',
    proportion_in_portfolio: '0.0522',
    profit: '1.9765',
    profit_fifo: '1.1156'
  }
];

const mockPlanPositions = [
  {
    figi: 'BBG004730N88',
    ticker: 'SBER',
    name: 'Сбер Банк',
    lot: 1,
    plan_total: { currency: 'rub', units: 129890, nano: 470000000 },
    plan_proportion_in_portfolio: '0.0500',
    target_progress: '1.7164',
    to_buy_lots: { units: -19, nano: 0 }
  }
];

describe('PortfolioTable', () => {
  it('should render table with positions', () => {
    render(
      <PortfolioTable
        enrichedPositions={mockEnrichedPositions}
        planPositions={mockPlanPositions}
      />
    );

    expect(screen.getByText('SBER')).toBeInTheDocument();
    expect(screen.getByText('Сбер Банк')).toBeInTheDocument();
  });

  it('should display all required columns', () => {
    render(
      <PortfolioTable
        enrichedPositions={mockEnrichedPositions}
        planPositions={mockPlanPositions}
      />
    );

    expect(screen.getByText('Ticker')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Plan Total')).toBeInTheDocument();
    expect(screen.getByText('Proportion')).toBeInTheDocument();
    expect(screen.getByText('Profit')).toBeInTheDocument();
    expect(screen.getByText('Target Progress')).toBeInTheDocument();
  });

  it('should format money values correctly', () => {
    render(
      <PortfolioTable
        enrichedPositions={mockEnrichedPositions}
        planPositions={mockPlanPositions}
      />
    );

    // Check formatted price
    expect(screen.getByText(/301,37 ₽/)).toBeInTheDocument();
  });

  it('should show profit in green for positive values', () => {
    render(
      <PortfolioTable
        enrichedPositions={mockEnrichedPositions}
        planPositions={mockPlanPositions}
      />
    );

    const profitCell = screen.getByText(/111.56 %/);
    expect(profitCell).toHaveClass('text-green-500');
  });

  it('should join enriched positions with plan positions by figi', () => {
    render(
      <PortfolioTable
        enrichedPositions={mockEnrichedPositions}
        planPositions={mockPlanPositions}
      />
    );

    // Both current and target proportions should be displayed
    expect(screen.getByText(/5.22 %/)).toBeInTheDocument(); // current
    expect(screen.getByText(/5 %/)).toBeInTheDocument(); // target badge
  });

  it('should handle positions without plan data', () => {
    const positionsWithoutPlan = [{
      ...mockEnrichedPositions[0],
      figi: 'BBG_NO_PLAN'
    }];

    render(
      <PortfolioTable
        enrichedPositions={positionsWithoutPlan}
        planPositions={mockPlanPositions}
      />
    );

    // Should still render position
    expect(screen.getByText('SBER')).toBeInTheDocument();
  });
});
```

**Implementation:**
```typescript
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
          <TableHead sortable onSort={() => onSort?.('name', 'asc')}>
            Name
          </TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Plan Total</TableHead>
          <TableHead sortable onSort={() => onSort?.('proportion', 'asc')}>
            Proportion
          </TableHead>
          <TableHead sortable onSort={() => onSort?.('profit', 'asc')}>
            Profit
          </TableHead>
          <TableHead sortable onSort={() => onSort?.('target_progress', 'asc')}>
            Target Progress
          </TableHead>
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
                  {getProfitIcon(position.profit_fifo)}
                  <span>{formatPercent(position.profit_fifo)}</span>
                </div>
              </TableCell>
              <TableCell>
                {plan && (
                  <div className="flex items-center gap-2">
                    <ProgressBar value={parseFloat(plan.target_progress)} />
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
```

**Verification:**
- [ ] Component tests pass
- [ ] All columns render correctly
- [ ] Profit colors work (green/red)
- [ ] Plan data joins correctly by figi
- [ ] Handles missing plan data gracefully

---

#### 3.2 Update Structure Table Component

**File:** `src/components/portfolio/StructureTable.tsx`

**Task:** Update to use `structure_analysis` from new API.

**Test First (TDD):**
```typescript
// src/components/portfolio/__tests__/StructureTable.test.tsx
import { render, screen } from '@testing-library/react';
import { StructureTable } from '../StructureTable';

const mockStructureAnalysis = {
  total_amount_assets: '1752416.26',
  current_low_risk: {
    total_amount: '517026.50',
    proportion_in_portfolio: '0.2950',
    components: {
      gov_bonds: '0.00',
      corp_bonds: '517026.50'
    },
    component_proportions: {
      gov_bonds: '0.0000',
      corp_bonds: '1.0000'
    }
  },
  current_high_risk: {
    total_amount: '1235389.76',
    proportion_in_portfolio: '0.7050',
    components: {
      shares: '811611.04',
      etf: '423778.72'
    },
    component_proportions: {
      shares: '0.6570',
      etf: '0.3430'
    }
  },
  plan_low_risk: {
    total_amount: '525724.88',
    proportion_in_portfolio: '0.3000',
    components: {
      gov_bonds: '157717.46',
      corp_bonds: '368007.42'
    },
    component_proportions: {
      gov_bonds: '0.3000',
      corp_bonds: '0.7000'
    }
  },
  plan_high_risk: {
    total_amount: '1226691.38',
    proportion_in_portfolio: '0.7000',
    components: {
      shares: '981353.10',
      etf: '245338.28'
    },
    component_proportions: {
      shares: '0.8000',
      etf: '0.2000'
    }
  }
};

describe('StructureTable', () => {
  it('should render structure rows', () => {
    render(<StructureTable data={mockStructureAnalysis} />);

    expect(screen.getByText('Low risk part')).toBeInTheDocument();
    expect(screen.getByText('High risk part')).toBeInTheDocument();
    expect(screen.getByText('Gov. bonds')).toBeInTheDocument();
    expect(screen.getByText('Corp. bonds')).toBeInTheDocument();
    expect(screen.getByText('ETF')).toBeInTheDocument();
    expect(screen.getByText('Shares')).toBeInTheDocument();
  });

  it('should display current and plan values', () => {
    render(<StructureTable data={mockStructureAnalysis} />);

    // Check low risk current amount
    expect(screen.getByText(/517 026,50 ₽/)).toBeInTheDocument();

    // Check low risk plan amount
    expect(screen.getByText(/525 724,88 ₽/)).toBeInTheDocument();
  });

  it('should calculate disbalance correctly', () => {
    render(<StructureTable data={mockStructureAnalysis} />);

    // Low risk: 29.5% current vs 30% plan = 0.5% disbalance
    expect(screen.getByText('0.50 %')).toBeInTheDocument();
  });

  it('should show risk part proportions', () => {
    render(<StructureTable data={mockStructureAnalysis} />);

    expect(screen.getByText('29,5 %')).toBeInTheDocument(); // current low risk
    expect(screen.getByText('30 %')).toBeInTheDocument(); // plan low risk
  });

  it('should handle null plan data', () => {
    const dataWithoutPlan = {
      ...mockStructureAnalysis,
      plan_low_risk: null,
      plan_high_risk: null
    };

    render(<StructureTable data={dataWithoutPlan} />);

    // Should still render current data
    expect(screen.getByText('Low risk part')).toBeInTheDocument();
  });
});
```

**Implementation:**
```typescript
interface StructureTableProps {
  data: StructureAnalysis;
}

export function StructureTable({ data }: StructureTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Instrument type</TableHead>
          <TableHead>Sum</TableHead>
          <TableHead>Risk Part</TableHead>
          <TableHead>Plan sum</TableHead>
          <TableHead>Plan proportion</TableHead>
          <TableHead>Risk Parts Disbalance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Low risk part */}
        <TableRow>
          <TableCell>Low risk part</TableCell>
          <TableCell>{data.current_low_risk.total_amount} ₽</TableCell>
          <TableCell>{formatPercent(data.current_low_risk.proportion_in_portfolio)}</TableCell>
          <TableCell>{data.plan_low_risk?.total_amount ?? '—'} ₽</TableCell>
          <TableCell>
            {data.plan_low_risk ? formatPercent(data.plan_low_risk.proportion_in_portfolio) : '—'}
          </TableCell>
          <TableCell>
            {data.plan_low_risk
              ? calculateDisbalance(
                  data.current_low_risk.proportion_in_portfolio,
                  data.plan_low_risk.proportion_in_portfolio
                )
              : '—'
            }
          </TableCell>
        </TableRow>

        {/* Gov bonds */}
        <TableRow className="bg-muted/50">
          <TableCell className="pl-8">Gov. bonds</TableCell>
          <TableCell>{data.current_low_risk.components.gov_bonds} ₽</TableCell>
          <TableCell>{formatPercent(data.current_low_risk.component_proportions.gov_bonds)}</TableCell>
          <TableCell>{data.plan_low_risk?.components.gov_bonds ?? '—'} ₽</TableCell>
          <TableCell>
            {data.plan_low_risk ? formatPercent(data.plan_low_risk.component_proportions.gov_bonds) : '—'}
          </TableCell>
          <TableCell>
            {data.plan_low_risk
              ? calculateDisbalance(
                  data.current_low_risk.component_proportions.gov_bonds,
                  data.plan_low_risk.component_proportions.gov_bonds
                )
              : '—'
            }
          </TableCell>
        </TableRow>

        {/* Corp bonds */}
        <TableRow className="bg-muted/50">
          <TableCell className="pl-8">Corp. bonds</TableCell>
          <TableCell>{data.current_low_risk.components.corp_bonds} ₽</TableCell>
          <TableCell>{formatPercent(data.current_low_risk.component_proportions.corp_bonds)}</TableCell>
          <TableCell>{data.plan_low_risk?.components.corp_bonds ?? '—'} ₽</TableCell>
          <TableCell>
            {data.plan_low_risk ? formatPercent(data.plan_low_risk.component_proportions.corp_bonds) : '—'}
          </TableCell>
          <TableCell>
            {data.plan_low_risk
              ? calculateDisbalance(
                  data.current_low_risk.component_proportions.corp_bonds,
                  data.plan_low_risk.component_proportions.corp_bonds
                )
              : '—'
            }
          </TableCell>
        </TableRow>

        {/* High risk part - similar pattern */}
        {/* ... ETF and Shares rows ... */}
      </TableBody>
    </Table>
  );
}
```

**Verification:**
- [ ] Structure table tests pass
- [ ] All 6 rows render (Low risk, Gov bonds, Corp bonds, High risk, ETF, Shares)
- [ ] Disbalance calculations are correct
- [ ] Handles null plan data

---

#### 3.3 Update Main Portfolio Page

**File:** `src/app/(root)/page.tsx`

**Task:** Replace two separate API calls with single `usePortfolioAnalysis` hook.

**Test First (TDD):**
```typescript
// src/app/(root)/__tests__/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PortfolioPage from '../page';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

jest.mock('@/hooks/usePortfolioAnalysis', () => ({
  usePortfolioAnalysis: jest.fn()
}));

describe('PortfolioPage', () => {
  it('should show loading state initially', () => {
    const { usePortfolioAnalysis } = require('@/hooks/usePortfolioAnalysis');
    usePortfolioAnalysis.mockReturnValue({
      isLoading: true,
      data: undefined,
      error: null
    });

    render(<PortfolioPage />, { wrapper });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show error state on error', () => {
    const { usePortfolioAnalysis } = require('@/hooks/usePortfolioAnalysis');
    usePortfolioAnalysis.mockReturnValue({
      isLoading: false,
      data: undefined,
      error: new Error('Failed to fetch')
    });

    render(<PortfolioPage />, { wrapper });
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('should render portfolio data when loaded', async () => {
    const { usePortfolioAnalysis } = require('@/hooks/usePortfolioAnalysis');
    usePortfolioAnalysis.mockReturnValue({
      isLoading: false,
      data: mockFullPortfolioAnalysisResponse,
      error: null
    });

    render(<PortfolioPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Structure')).toBeInTheDocument();
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
    });
  });

  it('should pass correct props to PortfolioTable', () => {
    const { usePortfolioAnalysis } = require('@/hooks/usePortfolioAnalysis');
    usePortfolioAnalysis.mockReturnValue({
      isLoading: false,
      data: mockFullPortfolioAnalysisResponse,
      error: null
    });

    render(<PortfolioPage />, { wrapper });

    // Verify PortfolioTable receives enrichedPositions and planPositions
    // (This would require mocking the component or using a more sophisticated test)
  });
});
```

**Implementation:**
```typescript
'use client';

import { usePortfolioAnalysis } from '@/hooks/usePortfolioAnalysis';
import { PortfolioTable } from '@/components/portfolio/PortfolioTable';
import { StructureTable } from '@/components/portfolio/StructureTable';
import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';

export default function PortfolioPage() {
  // Get API client ID (from context, state, or props)
  const apiClientId = useApiClientId(); // You'll need to implement this
  const accountIds = useSelectedAccountIds(); // You'll need to implement this

  const {
    data: analysis,
    isLoading,
    error,
    refetch
  } = usePortfolioAnalysis(apiClientId, accountIds);

  if (isLoading) {
    return <LoadingSpinner data-testid="loading-spinner" />;
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={refetch}
      />
    );
  }

  if (!analysis) {
    return <div>No data available</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Structure Section */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Structure</h1>
        <StructureTable data={analysis.structure_analysis} />
      </section>

      {/* Portfolio Summary Section */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Portfolio summary</h3>
        <PortfolioSummary
          consolidated={analysis.consolidated_portfolio}
          totalCash={analysis.total_additional_cash}
          assetProportions={analysis.proportion_in_portfolio}
        />
      </section>

      {/* Portfolio Table Section */}
      <section>
        <h1 className="text-2xl font-bold mb-4">Portfolio</h1>
        <PortfolioTable
          enrichedPositions={analysis.enriched_positions}
          planPositions={analysis.plan_positions}
        />
      </section>
    </div>
  );
}
```

**Verification:**
- [ ] Page loads without errors
- [ ] Loading state displays correctly
- [ ] Error state displays with retry button
- [ ] All three sections render (Structure, Summary, Table)
- [ ] Data flows correctly to child components

---

### **PHASE 4: E2E Testing (Day 4)**

#### 4.1 Create Playwright Tests

**File:** `e2e/portfolio.spec.ts`

**Task:** Write E2E tests verifying UI behavior matches legacy system.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Portfolio Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login (use your existing auth flow)
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'di@example.com');
    await page.fill('input[name="password"]', '123qweAs!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display portfolio table with all columns', async ({ page }) => {
    await page.goto('/');

    // Wait for table to load
    await page.waitForSelector('[data-testid="portfolio-table"]');

    // Verify column headers
    const headers = ['Ticker', 'Name', 'Price', 'Quantity', 'Total', 'Plan Total', 'Proportion', 'Profit', 'Target Progress'];

    for (const header of headers) {
      await expect(page.getByRole('columnheader', { name: header })).toBeVisible();
    }
  });

  test('should display structure table', async ({ page }) => {
    await page.goto('/');

    // Verify structure rows
    await expect(page.getByText('Low risk part')).toBeVisible();
    await expect(page.getByText('High risk part')).toBeVisible();
    await expect(page.getByText('Gov. bonds')).toBeVisible();
    await expect(page.getByText('Corp. bonds')).toBeVisible();
    await expect(page.getByText('ETF')).toBeVisible();
    await expect(page.getByText('Shares')).toBeVisible();
  });

  test('should format currency values correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="portfolio-table"]');

    // Check that values include currency symbol (₽, €, $)
    const firstPrice = page.locator('tbody tr:first-child td').nth(3);
    await expect(firstPrice).toContainText(/₽|€|\$/);
  });

  test('should show profit colors correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="portfolio-table"]');

    // Find a cell with positive profit
    const profitCells = page.locator('tbody td').filter({ hasText: /\d+\.\d+ %/ });
    const firstProfitCell = profitCells.first();

    const text = await firstProfitCell.textContent();
    const className = await firstProfitCell.getAttribute('class');

    if (text?.startsWith('-')) {
      expect(className).toContain('text-red');
    } else {
      expect(className).toContain('text-green');
    }
  });

  test('should sort by name column', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="portfolio-table"]');

    // Get first ticker before sort
    const firstTickerBefore = await page.locator('tbody tr:first-child td').nth(1).textContent();

    // Click name column header to sort
    await page.click('th:has-text("Name")');
    await page.waitForTimeout(500); // Wait for sort

    // Get first ticker after sort
    const firstTickerAfter = await page.locator('tbody tr:first-child td').nth(1).textContent();

    // Should be different (unless already sorted)
    expect(firstTickerBefore).not.toBe(firstTickerAfter);
  });

  test('should display pagination', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="portfolio-table"]');

    // Check pagination controls exist
    await expect(page.getByText(/Page \d+ of \d+/)).toBeVisible();
    await expect(page.getByRole('button', { name: /next/i })).toBeVisible();
  });

  test('should show progress bars for target progress', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="portfolio-table"]');

    // Check that progress bars render
    const progressBars = page.locator('[role="progressbar"]');
    expect(await progressBars.count()).toBeGreaterThan(0);
  });

  test('should calculate disbalance correctly in structure table', async ({ page }) => {
    await page.goto('/');

    // Find the disbalance cell for "Low risk part"
    const lowRiskRow = page.locator('tr:has-text("Low risk part")');
    const disbalanceCell = lowRiskRow.locator('td').last();

    // Should show percentage
    await expect(disbalanceCell).toContainText(/%/);
  });
});
```

**Run Tests:**
```bash
npx playwright test
```

**Verification:**
- [ ] All E2E tests pass
- [ ] Table renders correctly
- [ ] Structure table displays all rows
- [ ] Currency formatting is correct
- [ ] Profit colors match values
- [ ] Sorting works
- [ ] Pagination displays

---

### **PHASE 5: Feature Flag & Deployment (Day 5)**

#### 5.1 Add Feature Flag

**File:** `src/config/features.ts`

```typescript
export const features = {
  useNewPortfolioAPI: process.env.NEXT_PUBLIC_USE_NEW_PORTFOLIO_API === 'true'
};
```

**File:** `.env.local`

```env
NEXT_PUBLIC_USE_NEW_PORTFOLIO_API=false
```

**Update Portfolio Page:**

```typescript
import { features } from '@/config/features';
import { usePortfolioAnalysis } from '@/hooks/usePortfolioAnalysis';
import { useLegacyPortfolio } from '@/hooks/useLegacyPortfolio'; // Old hook

export default function PortfolioPage() {
  const apiClientId = useApiClientId();
  const accountIds = useSelectedAccountIds();

  // Use feature flag to switch between old and new API
  const newAPI = usePortfolioAnalysis(apiClientId, accountIds);
  const legacyAPI = useLegacyPortfolio();

  const { data, isLoading, error } = features.useNewPortfolioAPI ? newAPI : legacyAPI;

  // ... rest of component
}
```

#### 5.2 Deployment Checklist

- [ ] **Staging Deployment**
  - [ ] Deploy with `NEXT_PUBLIC_USE_NEW_PORTFOLIO_API=false`
  - [ ] Verify old API still works
  - [ ] Enable flag: `NEXT_PUBLIC_USE_NEW_PORTFOLIO_API=true`
  - [ ] Test all functionality with new API
  - [ ] Run E2E tests in staging

- [ ] **Production Rollout (Gradual)**
  - [ ] Week 1: Internal users only (use cookie/header flag)
  - [ ] Week 2: 10% of users
  - [ ] Week 3: 50% of users
  - [ ] Week 4: 100% of users

- [ ] **Monitoring**
  - [ ] Set up error tracking (Sentry/Rollbar)
  - [ ] Monitor API response times
  - [ ] Track user engagement metrics
  - [ ] Watch for increased error rates

---

## 📊 Progress Tracking

Use this checklist to track your progress:

### Phase 1: API Layer ✅
- [ ] Created TypeScript types
- [ ] Implemented `getFullPortfolioAnalysis()` service
- [ ] Created `usePortfolioAnalysis` hook
- [ ] All unit tests pass

### Phase 2: Utilities ✅
- [ ] Implemented formatters
- [ ] All formatter tests pass
- [ ] Edge cases handled

### Phase 3: Components ✅
- [ ] Updated PortfolioTable
- [ ] Updated StructureTable
- [ ] Updated main page
- [ ] All component tests pass

### Phase 4: E2E Testing ✅
- [ ] Wrote Playwright tests
- [ ] All E2E tests pass
- [ ] Manual QA completed

### Phase 5: Deployment ✅
- [ ] Feature flag implemented
- [ ] Deployed to staging
- [ ] Tested in staging
- [ ] Rolled out to production

---

## 🐛 Troubleshooting Guide

### Common Issues

#### Issue: "API client ID is undefined"

**Solution:** Make sure you're fetching the API client ID before calling the hook:

```typescript
const { data: apiClients } = useApiClients();
const apiClientId = apiClients?.[0]?.id;

// Only call hook when ID is available
const { data } = usePortfolioAnalysis(
  apiClientId, // Will be undefined initially
  accountIds
);
```

#### Issue: "Currency formatting shows wrong symbol"

**Solution:** Check that MoneyValue.currency is lowercase in your formatter:

```typescript
currency: mv.currency.toUpperCase() // ✅ Convert to uppercase for Intl
```

#### Issue: "Profit colors not showing"

**Solution:** Verify Tailwind classes are included in your CSS:

```typescript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Make sure this matches your file structure
  ],
  // ...
}
```

#### Issue: "Plan data not joining with positions"

**Solution:** Check that both arrays use the same `figi` field:

```typescript
const planLookup = new Map(
  planPositions.map(p => [p.figi, p]) // ✅ Key by figi
);

enrichedPositions.map(position => {
  const plan = planLookup.get(position.figi); // ✅ Lookup by figi
  // ...
});
```

#### Issue: "Tests failing with 'fetch is not defined'"

**Solution:** Mock fetch in your test setup:

```typescript
// jest.setup.ts
global.fetch = jest.fn();

// In each test
jest.spyOn(global, 'fetch').mockResolvedValue({
  ok: true,
  json: async () => mockData
} as Response);
```

---

## 📝 Final Verification

Before marking the migration complete, verify ALL items in Section 6 of FRONTEND_MIGRATION_REPORT.md:

- [ ] All 25+ legacy positions appear in new table
- [ ] Profit percentages match within 0.01%
- [ ] Currency formatting is identical
- [ ] Sorting works on all sortable columns
- [ ] Pagination functions correctly
- [ ] Structure table shows all 6 rows
- [ ] Disbalance calculations are accurate
- [ ] Progress bars render for target_progress
- [ ] Profit colors (green/red) are correct
- [ ] No console errors
- [ ] No React warnings
- [ ] Performance: Page loads < 2 seconds
- [ ] Mobile responsive layout works

---

## 🎉 Success Criteria

Migration is **COMPLETE** when:

1. ✅ All tests pass (unit + integration + E2E)
2. ✅ Feature flag works (can switch between old/new API)
3. ✅ UI is pixel-perfect match with legacy system
4. ✅ No data discrepancies between old and new API
5. ✅ Performance is equal or better than legacy
6. ✅ Code review approved
7. ✅ Deployed to production with monitoring

---

## 📚 Reference Documents

Keep these open while working:

1. **FRONTEND_MIGRATION_REPORT.md** - Complete field mappings and analysis
2. **backend/docs/temp/PORTFOLIO_API_MIGRATION_PLAN.md** - Backend context
3. **New API OpenAPI spec:** http://localhost:8000/docs

---

## 💬 Questions?

If you encounter issues not covered in this guide:

1. Check FRONTEND_MIGRATION_REPORT.md Section 9 (Troubleshooting)
2. Review the OpenAPI spec for the new endpoint
3. Compare with legacy API response captured in Section 2.3
4. Ask the backend team about field availability

---

**Good luck with the migration! Follow TDD, write tests first, and verify against the legacy system frequently.**
