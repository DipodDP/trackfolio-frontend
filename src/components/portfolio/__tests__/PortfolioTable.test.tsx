import { render, screen, fireEvent } from "@testing-library/react";
import { PortfolioTable } from "../PortfolioTable";
import { EnrichedPosition, PlanPosition } from "@/types/portfolio";

// Mock UI components
jest.mock("@/components/ui/table", () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table>{children}</table>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead>{children}</thead>
  ),
  TableRow: ({ children }: { children: React.ReactNode }) => (
    <tr>{children}</tr>
  ),
  TableHead: ({ children }: { children: React.ReactNode }) => (
    <th>{children}</th>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody>{children}</tbody>
  ),
  TableCell: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <td className={className}>{children}</td>,
}));

jest.mock("@/components/ui/checkbox", () => ({
  Checkbox: () => <input type="checkbox" data-testid="mock-checkbox" />,
}));

jest.mock("@/components/ui", () => ({
  Badge: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <span className={className} data-variant={variant}>
      {children}
    </span>
  ),
}));

jest.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

jest.mock("@/components/ui/Progress", () => ({
  Progress: ({ value }: { value: number }) => (
    <progress value={value} max="100" data-testid="mock-progress-bar" />
  ),
}));

// Mock formatter functions
jest.mock("@/utils/formatters", () => ({
  formatMoneyValue: jest.fn((mv) => {
    if (!mv) return "—";
    const amount = Number(mv.units) + Number(mv.nano) / 1_000_000_000;
    return `${amount.toFixed(2).replace(".", ",")} ${mv.currency}`;
  }),
  formatQuotation: jest.fn((q) => `${q.units}.${q.nano / 1000000000}`),
  formatPercent: jest.fn((value) => `${(parseFloat(value as string) * 100).toFixed(2)} %`),
  getProfitColorClass: jest.fn((profit) => {
    const p = parseFloat(profit as string);
    if (p > 0) return "text-green-500";
    if (p < 0) return "text-red-500";
    return "text-gray-500";
  }),
  // getProfitIcon: jest.fn(() => null), // Mock if needed when uncommented
  calculateDisbalance: jest.fn(() => "0.00 %"),
}));

jest.mock(
  "@/app/positions/components/dialogs/EditTargetsDialog",
  () => ({
    EditTargetsDialog: jest.fn(
      ({
        isOpen,
        onClose,
        onSave,
      }: {
        isOpen: boolean;
        onClose: () => void;
        onSave: () => void;
      }) => {
        if (!isOpen) return null;
        return (
          <div data-testid="mock-dialog">
            <button onClick={onClose}>Close</button>
            <button onClick={onSave}>Save</button>
          </div>
        );
      }
    ),
  })
);

const mockEnrichedPositions: EnrichedPosition[] = [
  {
    figi: "BBG004730N88",
    ticker: "SBER",
    name: "Сбер Банк",
    lot_size: 1,
    quantity: { units: 450, nano: 0 },
    instrument_type: "share",
    current_price: { currency: "RUB", units: 301, nano: 370000000 },
    average_price: { currency: "RUB", units: 101, nano: 250000000 },
    corrected_average_price: { currency: "RUB", units: 142, nano: 448656250 },
    average_price_fifo: { currency: "RUB", units: 101, nano: 250000000 },
    total: { currency: "RUB", units: 135616, nano: 500000000 },
    expected_yield: { currency: "RUB", units: 90055, nano: 710000000 },
    current_nkd: null,
    proportion: "0.1671",
    proportion_in_portfolio: "0.0522",
    profit: "1.9765",
  },
];

const mockPlanPositions: PlanPosition[] = [
  {
    figi: "BBG004730N88",
    ticker: "SBER",
    name: "Сбер Банк",
    lot: 1,
    instrument_type: "share",
    plan_proportion_in_portfolio: "0.0500",
    target_profit: "1.6500",
    exit_drawdown: "0.5000",
    current_quantity: 450,
    plan_quantity: { units: 431, nano: 0 },
    to_buy_lots: { units: -19, nano: 0 },
    current_price: { currency: "RUB", units: 301, nano: 370000000 },
    corrected_average_position_price: {
      currency: "RUB",
      units: 142,
      nano: 448656250,
    },
    plan_total: { currency: "RUB", units: 129890, nano: 470000000 },
    exit_profit_price: { currency: "RUB", units: 235, nano: 40282812 },
    exit_loss_price: { currency: "RUB", units: 71, nano: 224328125 },
    target_progress: "1.7164",
  },
];

describe("PortfolioTable", () => {
  it("should render table with positions", () => {
    render(
      <PortfolioTable
        enrichedPositions={mockEnrichedPositions}
        planPositions={mockPlanPositions}
      />
    );

    expect(screen.getByText("SBER")).toBeInTheDocument();
    expect(screen.getByText("Сбер Банк")).toBeInTheDocument();
  });

  it("should display all required columns", () => {
    render(
      <PortfolioTable
        enrichedPositions={mockEnrichedPositions}
        planPositions={mockPlanPositions}
      />
    );

    expect(screen.getByText("Ticker")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("Quantity")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Plan Total")).toBeInTheDocument();
    expect(screen.getByText("Proportion")).toBeInTheDocument();
    expect(screen.getByText("Profit")).toBeInTheDocument();
    expect(screen.getByText("Target Progress")).toBeInTheDocument();
  });

  it("should format money values correctly", () => {
    render(
      <PortfolioTable
        enrichedPositions={mockEnrichedPositions}
        planPositions={mockPlanPositions}
      />
    );

    // Check formatted price from mock: 301,37 RUB (currency codes are now uppercase)
    expect(screen.getByText("301,37 RUB")).toBeInTheDocument();
  });

  it("should show profit in green for positive values", () => {
    render(
      <PortfolioTable
        enrichedPositions={mockEnrichedPositions}
        planPositions={mockPlanPositions}
      />
    );

    const profitCell = screen.getByText("+197.65%");
    expect(profitCell.closest("td")).toHaveClass("text-success");
  });

  it("should join enriched positions with plan positions by figi", () => {
    render(
      <PortfolioTable
        enrichedPositions={mockEnrichedPositions}
        planPositions={mockPlanPositions}
      />
    );

    // Both current and target proportions should be displayed
    expect(screen.getByText("5.22 %")).toBeInTheDocument(); // current
    expect(screen.getByText("track_changes")).toBeInTheDocument(); // target icon
    expect(screen.getByText("5.00 %")).toBeInTheDocument(); // target percentage
  });

  it("should handle positions without plan data", () => {
    const positionsWithoutPlan = [
      {
        ...mockEnrichedPositions[0],
        figi: "BBG_NO_PLAN",
      },
    ];

    render(
      <PortfolioTable
        enrichedPositions={positionsWithoutPlan}
        planPositions={mockPlanPositions}
      />
    );

    // Should still render position
    expect(screen.getByText("SBER")).toBeInTheDocument();
    // Plan Total and Target Progress should be empty or default
    expect(screen.queryByText("129,89 rub")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mock-progress-bar")).not.toBeInTheDocument();
  });

  it("should open the edit dialog on proportion click", () => {
    render(
      <PortfolioTable
        enrichedPositions={mockEnrichedPositions}
        planPositions={mockPlanPositions}
      />
    );

    const proportionButton = screen.getByTitle("Click to edit target proportion");
    fireEvent.click(proportionButton);

    expect(screen.getByTestId("mock-dialog")).toBeInTheDocument();
  });

  it("should call onRefresh when the dialog is saved", () => {
    const mockOnRefresh = jest.fn();
    render(
      <PortfolioTable
        enrichedPositions={mockEnrichedPositions}
        planPositions={mockPlanPositions}
        onRefresh={mockOnRefresh}
      />
    );

    const proportionButton = screen.getByTitle("Click to edit target proportion");
    fireEvent.click(proportionButton);

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    expect(mockOnRefresh).toHaveBeenCalled();
  });
});
