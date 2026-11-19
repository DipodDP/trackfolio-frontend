import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import DashboardPage from "../page";
import PositionsPage from "../../positions/page";
import { useAppStore } from "@/store/appStore";
import { usePortfolioAnalysis } from "@/hooks/usePortfolioAnalysis";
import apiClient from "@/lib/api-client";

jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));
jest.mock("@/hooks/usePortfolioAnalysis");
jest.mock("@/lib/api-client", () => ({ post: jest.fn() }));
jest.mock("@/components/AuthGuard", () => ({ children }: { children: React.ReactNode }) => children);
jest.mock("@/components/layout", () => ({ Header: () => null, CosmicBackground: () => null }));

describe.each([DashboardPage, PositionsPage])("%p account recovery", Page => {
  it.each([1, 2])("opens the account picker for broker connection %i", async clientId => {
    const push = jest.fn();
    jest.mocked(useRouter).mockReturnValue({ push } as ReturnType<typeof useRouter>);
    useAppStore.setState({ selectedApiClientId: clientId, selectedAccountIds: ["test-account"], _hasHydrated: true });
    const error = new Error("Broker unavailable");
    jest.mocked(usePortfolioAnalysis).mockReturnValue({ error } as ReturnType<typeof usePortfolioAnalysis>);
    jest.mocked(apiClient.post).mockRejectedValue(error);

    render(<Page />);
    fireEvent.click(await screen.findByRole("button", { name: "Change Accounts" }));
    expect(push).toHaveBeenCalledWith(`/settings/accounts?clientId=${clientId}`);
  });
});
