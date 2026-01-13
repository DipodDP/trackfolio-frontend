"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Header, CosmicBackground } from "@/components/layout";
import { Card } from "@/components/ui";
import {
  StatCard,
  AllocationBar,
  AllocationLegend,
  PositionsTable,
  RecommendationsGrid,
  QuickActions,
  HeroSection,
  DataFreshness,
  type Position,
  type Recommendation,
} from "@/components/dashboard";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/lib/api-client";
import { formatMoneyValue, moneyValueToNumber } from "@/lib/utils/money";
import type { PortfolioAnalysisResponse } from "@/types/api";

export default function DashboardPage() {
  const router = useRouter();
  const { selectedApiClientId, selectedAccountIds, additionalCash } =
    useAppStore();
  const { user } = useAuthStore();

  const [portfolioData, setPortfolioData] =
    useState<PortfolioAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isSandbox, setIsSandbox] = useState(true);

  const {
    totalPortfolio,
    totalProfitLoss,
    plPercentage,
    positions,
    recommendations,
    allocationSegments,
    legendItems,
    totalCurrencies,
  } = useMemo(() => {
    if (!portfolioData) {
      return {
        totalPortfolio: 0,
        totalProfitLoss: 0,
        plPercentage: 0,
        positions: [],
        recommendations: [],
        allocationSegments: { current: [], target: [] },
        legendItems: [],
        totalCurrencies: 0,
      };
    }

    const {
      consolidated_portfolio,
      enriched_positions,
      plan_positions,
      structure_analysis,
    } = portfolioData;

    const totalPortfolio = moneyValueToNumber(
      consolidated_portfolio.total_amount_portfolio
    );

    const totalProfitLoss = enriched_positions.reduce((sum, pos) => {
      return sum + (pos.profit ? moneyValueToNumber(pos.profit) : 0);
    }, 0);

    const plPercentage =
      totalPortfolio > 0 ? (totalProfitLoss / totalPortfolio) * 100 : 0;

    const positions: Position[] = enriched_positions.slice(0, 5).map((pos) => {
      const plan_pos = plan_positions.find((p) => p.figi === pos.figi);
      return {
        ticker: pos.ticker,
        name: pos.name,
        instrumentType: pos.instrument_type,
        price: pos.current_price ? moneyValueToNumber(pos.current_price) : 0,
        quantity: pos.quantity,
        total: pos.total ? moneyValueToNumber(pos.total) : 0,
        planTotal: plan_pos?.plan_total
          ? moneyValueToNumber(plan_pos.plan_total)
          : 0,
        proportion: (pos.proportion_in_portfolio ?? 0) * 100,
        profit: {
          amount: pos.profit ? moneyValueToNumber(pos.profit) : 0,
          percent: (pos.profit_fifo ?? 0) * 100,
        },
        targetProgress: plan_pos?.target_progress ?? 0,
      };
    });

    const recommendations: Recommendation[] = plan_positions
      .filter((pos) => pos.to_buy_lots !== 0)
      .slice(0, 3)
      .map((pos) => ({
        action: pos.to_buy_lots > 0 ? "BUY" : "SELL",
        ticker: pos.ticker,
        quantity: Math.abs(pos.to_buy_lots),
        reason:
          pos.to_buy_lots > 0
            ? `Target allocation: ${(
                pos.plan_proportion_in_portfolio * 100
              ).toFixed(1)}%`
            : "Reduce position to target",
        type: "rebalance" as const,
      }));

    const currentPlanStructure = structure_analysis.current_structure;
    const targetPlanStructure = structure_analysis.plan_structure;

    const allocationSegments = {
      current: [
        {
          label: "Shares",
          value: currentPlanStructure?.high_risk_part?.shares_proportion ?? 0,
          color: "bg-primary",
        },
        {
          label: "Bonds",
          value:
            currentPlanStructure?.low_risk_part?.corp_bonds_proportion ?? 0,
          color: "bg-coral",
        },
        {
          label: "ETFs",
          value: currentPlanStructure?.high_risk_part?.etf_proportion ?? 0,
          color: "bg-success",
        },
        {
          label: "Gov Bonds",
          value:
            currentPlanStructure?.low_risk_part?.gov_bonds_proportion ?? 0,
          color: "bg-warning",
        },
      ],
      target: targetPlanStructure
        ? [
            {
              label: "Shares",
              value: targetPlanStructure?.high_risk_part?.shares_proportion ?? 0,
              color: "bg-primary",
            },
            {
              label: "Bonds",
              value:
                targetPlanStructure?.low_risk_part?.corp_bonds_proportion ??
                0,
              color: "bg-coral",
            },
            {
              label: "ETFs",
              value: targetPlanStructure?.high_risk_part?.etf_proportion ?? 0,
              color: "bg-success",
            },
            {
              label: "Gov Bonds",
              value:
                targetPlanStructure?.low_risk_part?.gov_bonds_proportion ??
                0,
              color: "bg-warning",
            },
          ]
        : [],
    };

    const legendItems = allocationSegments.current.map((segment) => ({
      label: segment.label,
      color: segment.color,
    }));
    
    const totalCurrencies = moneyValueToNumber(
      consolidated_portfolio.total_amount_currencies
    );

    return {
      totalPortfolio,
      totalProfitLoss,
      plPercentage,
      positions,
      recommendations,
      allocationSegments,
      legendItems,
      totalCurrencies,
    };
  }, [portfolioData]);

  const fetchPortfolioData = async () => {
    if (!selectedApiClientId || selectedAccountIds.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.post<PortfolioAnalysisResponse>(
        `/api-clients/${selectedApiClientId}/portfolio-analysis/full`,
        {
          account_ids: selectedAccountIds,
          additional_cash: additionalCash,
        }
      );

      setPortfolioData(response.data);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to fetch portfolio data:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to load portfolio data. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, [selectedApiClientId, selectedAccountIds, additionalCash]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPortfolioData();
    setIsRefreshing(false);
  };

  const handleToggleSandbox = () => {
    setIsSandbox((prev) => !prev);
  };

  // Show empty state if no accounts selected
  if (!selectedApiClientId || selectedAccountIds.length === 0) {
    return (
      <AuthGuard>
        <CosmicBackground />
        <div className="grain-overlay" />

        <div className="relative min-h-screen">
          <Header
            isSandbox={isSandbox}
            onToggleSandbox={handleToggleSandbox}
            userName={user?.username || "User"}
          />

          <main className="container-app py-12">
            <div className="card p-8 text-center max-w-2xl mx-auto">
              <span className="material-symbols-outlined text-6xl text-secondary-text mb-4">
                account_balance_wallet
              </span>
              <h2 className="text-2xl font-display text-primary-text mb-4">
                No Accounts Selected
              </h2>
              <p className="text-secondary-text mb-6">
                Please connect a broker and select accounts to view your
                portfolio analysis.
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
          <Header
            isSandbox={isSandbox}
            onToggleSandbox={handleToggleSandbox}
            userName={user?.username || "User"}
          />

          <main className="container-app py-12">
            <div className="card p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-secondary-text">
                Loading portfolio data...
              </p>
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
          <Header
            isSandbox={isSandbox}
            onToggleSandbox={handleToggleSandbox}
            userName={user?.username || "User"}
          />

          <main className="container-app py-12">
            <div className="card p-8 border-2 border-error bg-error/10 max-w-2xl mx-auto">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-error text-4xl">
                  error
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary-text mb-2">
                    Error Loading Portfolio
                  </h3>
                  <p className="text-secondary-text mb-4">{error}</p>
                  <div className="flex gap-4">
                    <button onClick={handleRefresh} className="btn btn-primary">
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

  if (!portfolioData) {
    return null;
  }

  return (
    <AuthGuard>
      <CosmicBackground />
      <div className="grain-overlay" />

      <div className="relative min-h-screen">
        <Header
          isSandbox={isSandbox}
          onToggleSandbox={handleToggleSandbox}
          userName={user?.username || "User"}
        />

        <main className="container-app py-12 md:py-16">
          <HeroSection />

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 mb-8">
            <StatCard
              title="Total Portfolio Value"
              value={formatMoneyValue(
                portfolioData.consolidated_portfolio.total_amount_portfolio,
                { decimals: 2 }
              )}
              change={{
                value: `${plPercentage >= 0 ? "+" : ""}${plPercentage.toFixed(2)}%`,
                isPositive: plPercentage >= 0,
              }}
              accentColor="primary"
              data-testid="portfolio-total"
            />
            <StatCard
              title="Unrealized P/L"
              value={`${totalProfitLoss >= 0 ? "+" : ""}${formatMoneyValue(
                {
                  currency: portfolioData.consolidated_portfolio.total_amount_portfolio.currency,
                  units: Math.floor(totalProfitLoss),
                  nano: Math.round(
                    (totalProfitLoss - Math.floor(totalProfitLoss)) * 1_000_000_000
                  ),
                },
                { decimals: 2 }
              )}`}
              change={{
                value: `${plPercentage >= 0 ? "+" : ""}${plPercentage.toFixed(2)}%`,
                isPositive: plPercentage >= 0,
              }}
              icon="trending_up"
              accentColor="success"
            />
            <StatCard
              title="Available Cash"
              value={formatMoneyValue(
                portfolioData.consolidated_portfolio.total_amount_currencies,
                { decimals: 2 }
              )}
              subtitle={`${totalPortfolio === 0 ? "0.0%" : ((totalCurrencies / totalPortfolio) * 100).toFixed(1)}% of Portfolio`}
              accentColor="coral"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Risk Allocation & Positions */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Risk Allocation */}
              <Card>
                <h2 className="text-lg font-semibold text-primary-text mb-4">
                  Asset Allocation
                </h2>
                <div className="space-y-4">
                  <AllocationBar
                    label="Current Allocation"
                    segments={allocationSegments.current}
                  />
                  {allocationSegments.target.length > 0 && (
                    <AllocationBar
                      label="Target Allocation"
                      segments={allocationSegments.target}
                    />
                  )}
                </div>
                <AllocationLegend items={legendItems} />
              </Card>

              {/* Top Positions */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-primary-text">
                    Top Positions
                  </h2>
                  <a
                    href="/positions"
                    className="text-sm text-coral hover:text-primary-text transition-colors"
                  >
                    View All Positions →
                  </a>
                </div>
                <PositionsTable
                  positions={positions}
                  data-testid="positions-table"
                />
              </Card>
            </div>

            {/* Right Column - Recommendations & Quick Actions */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Rebalancing Recommendations */}
              {recommendations.length > 0 && (
                <Card>
                  <h2 className="text-lg font-semibold text-primary-text mb-4">
                    Rebalancing Recommendations
                  </h2>
                  <RecommendationsGrid
                    recommendations={recommendations}
                    onRecommendationClick={(rec) =>
                      console.log("Clicked recommendation:", rec)
                    }
                    data-testid="recommendation-card"
                  />
                </Card>
              )}

              {/* Quick Actions */}
              <Card>
                <h2 className="text-lg font-semibold text-primary-text mb-4">
                  Quick Actions
                </h2>
                <QuickActions />
              </Card>
            </div>
          </div>

          {/* Data Freshness Footer */}
          <DataFreshness
            lastUpdated={lastUpdated || new Date()}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
