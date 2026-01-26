import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PositionsDataTable } from "./PositionsDataTable";
import { TablePosition } from "@/types/position";

// Mock the dialog component
jest.mock("./dialogs/EditTargetsDialog", () => ({
  EditTargetsDialog: jest.fn(({ isOpen }) => {
    if (!isOpen) return null;
    return <div data-testid="mock-dialog">Edit Targets Dialog</div>;
  }),
}));

const mockData: TablePosition[] = [
  {
    figi: "BBG000B9XRY4",
    ticker: "AAPL",
    name: "Apple Inc.",
    instrument_type: "share",
    quantity: 10,
    current_price: { value: 150, currency: "USD" },
    total: { value: 1500, currency: "USD" },
    proportion: 0.5,
    proportion_in_portfolio: 0.25,
    profit: { value: 500, currency: "USD" },
    profit_percentage: 50,
    lot: 1,
    plan_quantity: 12,
    plan_total: { value: 1800, currency: "USD" },
    plan_proportion_in_portfolio: 0.3,
    to_buy_lots: 2,
    target_profit: 0.2,
    exit_drawdown: 0.1,
    exit_profit_price: { value: 180, currency: "USD" },
    exit_loss_price: { value: 135, currency: "USD" },
    target_progress: 0.6,
  },
];

describe("PositionsDataTable", () => {
  it("renders the table with the new icon", () => {
    render(<PositionsDataTable data={mockData} />);
    expect(screen.getByText("track_changes")).toBeInTheDocument();
  });

  it("opens the dialog on proportion click", () => {
    render(<PositionsDataTable data={mockData} />);
    const proportionButton = screen.getByTitle("Click to edit target proportion");
    fireEvent.click(proportionButton);
    expect(screen.getByTestId("mock-dialog")).toBeInTheDocument();
  });
});
