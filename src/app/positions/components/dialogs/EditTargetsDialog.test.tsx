
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EditTargetsDialog } from "./EditTargetsDialog";
import { TablePosition } from "@/types/position";
import * as positionAttributesApi from "@/lib/api/position-attributes";
import { toast } from "sonner";

// Mock the API module and toast
jest.mock("@/lib/api/position-attributes", () => ({
  updatePositionAttributes: jest.fn(),
}));
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockPosition: TablePosition = {
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
};

const mockOnClose = jest.fn();
const mockOnSave = jest.fn();

describe("EditTargetsDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dialog with initial values", () => {
    render(
      <EditTargetsDialog
        isOpen={true}
        onClose={mockOnClose}
        position={mockPosition}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByLabelText("Target Proportion (%)")).toHaveValue(30);
    expect(screen.getByLabelText("Target Profit (%)")).toHaveValue(20);
    expect(screen.getByLabelText("Exit Drawdown (%)")).toHaveValue(10);
  });

  it("updates input values on change", () => {
    render(
      <EditTargetsDialog
        isOpen={true}
        onClose={mockOnClose}
        position={mockPosition}
        onSave={mockOnSave}
      />
    );

    fireEvent.change(screen.getByLabelText("Target Proportion (%)"), {
      target: { value: "35" },
    });
    fireEvent.change(screen.getByLabelText("Target Profit (%)"), {
      target: { value: "25" },
    });
    fireEvent.change(screen.getByLabelText("Exit Drawdown (%)"), {
      target: { value: "15" },
    });

    expect(screen.getByLabelText("Target Proportion (%)")).toHaveValue(35);
    expect(screen.getByLabelText("Target Profit (%)")).toHaveValue(25);
    expect(screen.getByLabelText("Exit Drawdown (%)")).toHaveValue(15);
  });

  it("calls onSave and updates attributes on valid submission", async () => {
    (positionAttributesApi.updatePositionAttributes as jest.Mock).mockResolvedValue({});
    render(
      <EditTargetsDialog
        isOpen={true}
        onClose={mockOnClose}
        position={mockPosition}
        onSave={mockOnSave}
      />
    );

    fireEvent.change(screen.getByLabelText("Target Proportion (%)"), { target: { value: "40" } });
    fireEvent.change(screen.getByLabelText("Target Profit (%)"), { target: { value: "25" } });
    fireEvent.change(screen.getByLabelText("Exit Drawdown (%)"), { target: { value: "12" } });
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(positionAttributesApi.updatePositionAttributes).toHaveBeenCalledWith(
        mockPosition.figi,
        {
          plan_proportion_in_portfolio: 0.4,
          target_profit: 0.25,
          exit_drawdown: 0.12,
        }
      );
      expect(mockOnSave).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Position attributes updated", {
        description: `Updated settings for ${mockPosition.ticker}`,
      });
    });
  });

  it("shows an error toast for invalid proportion", async () => {
    render(
      <EditTargetsDialog
        isOpen={true}
        onClose={mockOnClose}
        position={mockPosition}
        onSave={mockOnSave}
      />
    );

    fireEvent.change(screen.getByLabelText("Target Proportion (%)"), {
      target: { value: "101" },
    });
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid proportion", {
        description: "Target proportion must be between 0% and 100%",
      });
      expect(positionAttributesApi.updatePositionAttributes).not.toHaveBeenCalled();
    });
  });

  it("shows an error toast on API failure", async () => {
    const errorMessage = "API Error";
    (positionAttributesApi.updatePositionAttributes as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(
      <EditTargetsDialog
        isOpen={true}
        onClose={mockOnClose}
        position={mockPosition}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to update attributes", {
        description: errorMessage,
      });
    });
  });
});
