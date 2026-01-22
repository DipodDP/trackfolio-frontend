import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { StructureAnalysis, MoneyValue, CurrencyCode } from '@/types/portfolio'; // Import MoneyValue and CurrencyCode
import { formatPercent, calculateDisbalance, formatMoneyValue } from '@/utils/formatters';

interface StructureTableProps {
  data: StructureAnalysis;
  currencyCode: CurrencyCode; // Add currencyCode prop
}

export function StructureTable({ data, currencyCode }: StructureTableProps) {
  // Helper function to safely format money values
  const safeFormatMoneyValue = (value: string | undefined): string => {
    if (value === undefined || value === null || value.trim() === '') {
      return '—';
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      return '—';
    }
    // Convert number to MoneyValue for formatMoneyValue
    const mv: MoneyValue = {
      currency: currencyCode,
      units: Math.floor(num),
      nano: Math.round((num % 1) * 1_000_000_000),
    };
    return formatMoneyValue(mv);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Instrument</TableHead>
          <TableHead>Sum</TableHead>
          <TableHead>Proportion</TableHead>
          <TableHead>Plan Sum</TableHead>
          <TableHead>Plan %</TableHead>
          <TableHead>Disbalance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Low risk part */}
        <TableRow data-testid="low-risk-part-row" className="mt-4 bg-success/10 border-l-4 border-success font-semibold">
          <TableCell>Low risk part</TableCell>
          <TableCell data-testid="low-risk-current-amount">{safeFormatMoneyValue(data.current_low_risk.total_amount)}</TableCell>
          <TableCell>{formatPercent(data.current_low_risk.proportion_in_portfolio)}</TableCell>
          <TableCell data-testid="low-risk-plan-amount">{data.plan_low_risk?.total_amount ? safeFormatMoneyValue(data.plan_low_risk.total_amount) : '—'}</TableCell>
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
        <TableRow className="border-b border-success/30">
          <TableCell className="pl-8">Gov. bonds</TableCell>
          <TableCell>{safeFormatMoneyValue(data.current_low_risk.components.gov_bonds)}</TableCell>
          <TableCell>{formatPercent(data.current_low_risk.component_proportions.gov_bonds ?? '0')}</TableCell>
          <TableCell>{data.plan_low_risk?.components.gov_bonds ? safeFormatMoneyValue(data.plan_low_risk.components.gov_bonds) : '—'}</TableCell>
          <TableCell>
            {data.plan_low_risk ? formatPercent(data.plan_low_risk.component_proportions.gov_bonds ?? '0') : '—'}
          </TableCell>
          <TableCell>
            {data.plan_low_risk
              ? calculateDisbalance(
                  data.current_low_risk.component_proportions.gov_bonds ?? '0',
                  data.plan_low_risk.component_proportions.gov_bonds ?? '0'
                )
              : '—'
            }
          </TableCell>
        </TableRow>

        {/* Corp bonds */}
        <TableRow className="border-b-0">
          <TableCell className="pl-8">Corp. bonds</TableCell>
          <TableCell>{safeFormatMoneyValue(data.current_low_risk.components.corp_bonds)}</TableCell>
          <TableCell>{formatPercent(data.current_low_risk.component_proportions.corp_bonds ?? '0')}</TableCell>
          <TableCell>{data.plan_low_risk?.components.corp_bonds ? safeFormatMoneyValue(data.plan_low_risk.components.corp_bonds) : '—'}</TableCell>
          <TableCell>
            {data.plan_low_risk ? formatPercent(data.plan_low_risk.component_proportions.corp_bonds ?? '0') : '—'}
          </TableCell>
          <TableCell>
            {data.plan_low_risk
              ? calculateDisbalance(
                  data.current_low_risk.component_proportions.corp_bonds ?? '0',
                  data.plan_low_risk.component_proportions.corp_bonds ?? '0'
                )
              : '—'
            }
          </TableCell>
        </TableRow>

        {/* High risk part */}
        <TableRow data-testid="high-risk-part-row" className="bg-primary/10 border-l-4 border-primary font-semibold">
          <TableCell>High risk part</TableCell>
          <TableCell data-testid="high-risk-current-amount">{safeFormatMoneyValue(data.current_high_risk.total_amount)}</TableCell>
          <TableCell>{formatPercent(data.current_high_risk.proportion_in_portfolio)}</TableCell>
          <TableCell data-testid="high-risk-plan-amount">{data.plan_high_risk?.total_amount ? safeFormatMoneyValue(data.plan_high_risk.total_amount) : '—'}</TableCell>
          <TableCell>
            {data.plan_high_risk ? formatPercent(data.plan_high_risk.proportion_in_portfolio) : '—'}
          </TableCell>
          <TableCell>
            {data.plan_high_risk
              ? calculateDisbalance(
                  data.current_high_risk.proportion_in_portfolio,
                  data.plan_high_risk.proportion_in_portfolio
                )
              : '—'
            }
          </TableCell>
        </TableRow>

        <TableRow className="border-b border-primary/30">
          <TableCell className="pl-8">Shares</TableCell>
          <TableCell>{safeFormatMoneyValue(data.current_high_risk.components.shares)}</TableCell>
          <TableCell>{formatPercent(data.current_high_risk.component_proportions.shares ?? '0')}</TableCell>
          <TableCell>{data.plan_high_risk?.components.shares ? safeFormatMoneyValue(data.plan_high_risk.components.shares) : '—'}</TableCell>
          <TableCell>
            {data.plan_high_risk ? formatPercent(data.plan_high_risk.component_proportions.shares ?? '0') : '—'}
          </TableCell>
          <TableCell>
            {data.plan_high_risk
              ? calculateDisbalance(
                  data.current_high_risk.component_proportions.shares ?? '0',
                  data.plan_high_risk.component_proportions.shares ?? '0'
                )
              : '—'
            }
          </TableCell>
        </TableRow>

        {/* ETF */}
        <TableRow className="border-b-0">
          <TableCell className="pl-8">ETF</TableCell>
          <TableCell>{safeFormatMoneyValue(data.current_high_risk.components.etf)}</TableCell>
          <TableCell>{formatPercent(data.current_high_risk.component_proportions.etf ?? '0')}</TableCell>
          <TableCell>{data.plan_high_risk?.components.etf ? safeFormatMoneyValue(data.plan_high_risk.components.etf) : '—'}</TableCell>
          <TableCell>
            {data.plan_high_risk ? formatPercent(data.plan_high_risk.component_proportions.etf ?? '0') : '—'}
          </TableCell>
          <TableCell>
            {data.plan_high_risk
              ? calculateDisbalance(
                  data.current_high_risk.component_proportions.etf ?? '0',
                  data.plan_high_risk.component_proportions.etf ?? '0'
                )
              : '—'
            }
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
