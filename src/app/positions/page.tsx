"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Header, CosmicBackground } from "@/components/layout";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/lib/api-client";
import type { FullPortfolioAnalysisResponse as PortfolioAnalysisResponse } from "@/types/portfolio";
import { transformToTableFormat } from "@/lib/utils/position";
import { createPositionColumns } from "./components/columns/position-columns";
import { Skeleton } from "@/components/ui";
import { PositionsDataTable } from "./components/PositionsDataTable";
import { DataFreshness } from "@/components/dashboard";

export default function PositionsPage() {
  const router = useRouter();
  const { selectedApiClientId, selectedAccountIds, additionalCash, _hasHydrated } =
    useAppStore();
  const { user } = useAuthStore();

  const [portfolioData, setPortfolioData] =
    useState<PortfolioAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  console.log("PositionsPage render - isLoading:", isLoading);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch portfolio data
  const fetchPortfolioData = useCallback(async () => {
    if (!selectedApiClientId || selectedAccountIds.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log("Positions: Fetching data for API client:", selectedApiClientId, "accounts:", selectedAccountIds);
      const response = await apiClient.post<PortfolioAnalysisResponse>(
        `/api-clients/${selectedApiClientId}/portfolio-analysis/full`,
        {
          account_ids: selectedAccountIds,
          additional_cash: additionalCash,
        }
      );
      console.log("Positions: API Success Response:", response.data);
      setPortfolioData(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Positions: API Error:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to load portfolio data. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedApiClientId, selectedAccountIds, additionalCash, setIsLoading, setError, setPortfolioData, setLastUpdated]);

  useEffect(() => {
    console.log("Positions useEffect triggered.");
    console.log("  _hasHydrated:", _hasHydrated);
    console.log("  selectedApiClientId:", selectedApiClientId);
    console.log("  selectedAccountIds:", selectedAccountIds);
    if (_hasHydrated) {
      fetchPortfolioData();
    }
  }, [selectedApiClientId, selectedAccountIds, additionalCash, fetchPortfolioData, _hasHydrated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPortfolioData();
    setIsRefreshing(false);
  };

  // Transform data for table
  const tableData =
    portfolioData && !isLoading
      ? transformToTableFormat(
          portfolioData.enriched_positions,
          portfolioData.plan_positions
        )
      : [];

  // Create columns with refresh callback
  const columns = createPositionColumns(handleRefresh);

  // Show empty state if no accounts selected
  if (!selectedApiClientId || selectedAccountIds.length === 0) {
    return (
      <AuthGuard>
        <CosmicBackground />
        <div className="grain-overlay" />

        <div className="relative min-h-screen">
          <Header userName={user?.username || "User"} />

          <main className="container-app py-12">
            <div className="card p-8 text-center max-w-2xl mx-auto">
              <span className="material-symbols-outlined text-6xl text-secondary-text mb-4">
                inventory_2
              </span>
              <h2 className="text-2xl font-display text-primary-text mb-4">
                No Accounts Selected
              </h2>
              <p className="text-secondary-text mb-6">
                Please connect a broker and select accounts to view your
                positions.
              </p>
              <button
                onClick={() => router.push("/settings/api-clients")}
                className="btn btn-primary"
              >
                <span className="material-symbols-outlined">settings</span>
                Go to Settings
              </button>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  // Show loading state
  if (isLoading && !portfolioData) {
    return (
      <AuthGuard>
        <CosmicBackground />
        <div className="grain-overlay" />

        <div className="relative min-h-screen">
          <Header userName={user?.username || "User"} />

          <main className="container-app py-8">
            <div className="space-y-6">
              {/* Header skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-96" />
              </div>

              {/* Table skeleton */}
              <div className="card p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  // Show error state
  if (error && !portfolioData) {
    return (
      <AuthGuard>
        <CosmicBackground />
        <div className="grain-overlay" />

        <div className="relative min-h-screen">
          <Header userName={user?.username || "User"} />

          <main className="container-app py-12">
            <div className="card p-8 border-2 border-error bg-error/10 max-w-2xl mx-auto">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-error text-4xl">
                  error
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary-text mb-2">
                    Error Loading Positions
                  </h3>
                  <p className="text-secondary-text mb-4">{error}</p>
                  <div className="flex gap-4">
                    <button onClick={handleRefresh} className="btn btn-primary">
                      <span className="material-symbols-outlined">refresh</span>
                      Try Again
                    </button>
                    <button
                      onClick={() => router.push("/settings/accounts")}
                      className="btn btn-secondary"
                    >
                      Change Accounts
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  // Show main positions table
  return (
    <AuthGuard>
      <CosmicBackground />
      <div className="grain-overlay" />

      <div className="relative min-h-screen">
        <Header userName={user?.username || "User"} />

        <main className="container-app py-8">
          <div className="space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-display text-primary tracking-wider mb-2">
                  POSITIONS
                </h1>
                <p className="text-secondary-text">
                  {tableData.length} positions • Last updated:{" "}
                  {lastUpdated?.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn btn-secondary flex items-center gap-2"
              >
                <span
                  className={`material-symbols-outlined ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                >
                  refresh
                </span>
                Refresh
              </button>
            </div>

            {/* Positions table */}
            <div className="card p-6">
              <PositionsDataTable columns={columns} data={tableData} />
            </div>
          </div>
          <DataFreshness
            lastUpdated={lastUpdated || new Date()}
            onRefresh={handleRefresh}
          />
        </main>
      </div>
    </AuthGuard>
  );
}