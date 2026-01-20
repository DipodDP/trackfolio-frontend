import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { StructureAnalysis } from '@/types/portfolio';
import { formatPercent, calculateDisbalance } from '@/utils/formatters';

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
        <TableRow data-testid="low-risk-part-row">
          <TableCell>Low risk part</TableCell>
          <TableCell data-testid="low-risk-current-amount">{data.current_low_risk.total_amount} ₽</TableCell>
          <TableCell>{formatPercent(data.current_low_risk.proportion_in_portfolio)}</TableCell>
          <TableCell data-testid="low-risk-plan-amount">{data.plan_low_risk?.total_amount ?? '—'} ₽</TableCell>
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
          <TableCell>{formatPercent(data.current_low_risk.component_proportions.gov_bonds ?? '0')}</TableCell>
          <TableCell>{data.plan_low_risk?.components.gov_bonds ?? '—'} ₽</TableCell>
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
        <TableRow className="bg-muted/50">
          <TableCell className="pl-8">Corp. bonds</TableCell>
          <TableCell>{data.current_low_risk.components.corp_bonds} ₽</TableCell>
          <TableCell>{formatPercent(data.current_low_risk.component_proportions.corp_bonds ?? '0')}</TableCell>
          <TableCell>{data.plan_low_risk?.components.corp_bonds ?? '—'} ₽</TableCell>
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
        <TableRow data-testid="high-risk-part-row">
          <TableCell>High risk part</TableCell>
          <TableCell data-testid="high-risk-current-amount">{data.current_high_risk.total_amount} ₽</TableCell>
          <TableCell>{formatPercent(data.current_high_risk.proportion_in_portfolio)}</TableCell>
          <TableCell data-testid="high-risk-plan-amount">{data.plan_high_risk?.total_amount ?? '—'} ₽</TableCell>
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

        {/* Shares */}
        <TableRow className="bg-muted/50">
          <TableCell className="pl-8">Shares</TableCell>
          <TableCell>{data.current_high_risk.components.shares} ₽</TableCell>
          <TableCell>{formatPercent(data.current_high_risk.component_proportions.shares ?? '0')}</TableCell>
          <TableCell>{data.plan_high_risk?.components.shares ?? '—'} ₽</TableCell>
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
        <TableRow className="bg-muted/50">
          <TableCell className="pl-8">ETF</TableCell>
          <TableCell>{data.current_high_risk.components.etf} ₽</TableCell>
          <TableCell>{formatPercent(data.current_high_risk.component_proportions.etf ?? '0')}</TableCell>
          <TableCell>{data.plan_high_risk?.components.etf ?? '—'} ₽</TableCell>
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
