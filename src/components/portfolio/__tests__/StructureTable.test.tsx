import { render, screen } from '@testing-library/react';
import { StructureTable } from '../StructureTable';
import { StructureAnalysis } from '@/types/portfolio';

// Mock UI components
jest.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children, className, ...rest }: { children: React.ReactNode, className?: string, [key: string]: any }) => <tr className={className} {...rest}>{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children, className, ...rest }: { children: React.ReactNode, className?: string, [key: string]: any }) => <td className={className} {...rest}>{children}</td>,
}));

// Mock formatter functions
jest.mock('@/utils/formatters', () => ({
  formatPercent: jest.fn((value) => `${(parseFloat(value as string) * 100).toFixed(2)} %`),
  calculateDisbalance: jest.fn((current, plan) => {
    const currentNum = parseFloat(current as string);
    const planNum = parseFloat(plan as string);
    const disbalance = currentNum - planNum;
    return `${(disbalance * 100).toFixed(2)} %`;
  }),
  formatMoneyValue: jest.fn((mv) => {
    if (!mv) return '—';
    const amount = Number(mv.units) + Number(mv.nano) / 1_000_000_000;
    return `${amount.toFixed(2)} ₽`;
  }),
}));

const mockStructureAnalysis: StructureAnalysis = {
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
    expect(screen.getByTestId('low-risk-current-amount')).toHaveTextContent('517026.50 ₽');

    // Check low risk plan amount
    expect(screen.getByTestId('low-risk-plan-amount')).toHaveTextContent('525724.88 ₽');
  });

  it('should calculate disbalance correctly', () => {
    render(<StructureTable data={mockStructureAnalysis} />);

    // Low risk: 29.5% current vs 30% plan = -0.50 % disbalance
    expect(screen.getByText('-0.50 %')).toBeInTheDocument();
  });

  it('should show risk part proportions', () => {
    render(<StructureTable data={mockStructureAnalysis} />);

    // Use within to target specific rows
    const lowRiskRow = screen.getByTestId('low-risk-part-row');
    const highRiskRow = screen.getByTestId('high-risk-part-row');

    expect(lowRiskRow).toHaveTextContent('29.50 %'); // current low risk
    expect(lowRiskRow).toHaveTextContent('30.00 %'); // plan low risk

    expect(highRiskRow).toHaveTextContent('70.50 %'); // current high risk
    expect(highRiskRow).toHaveTextContent('70.00 %'); // plan high risk
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
    // Check that plan values are '-'
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});
