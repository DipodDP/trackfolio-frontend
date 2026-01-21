"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Header, CosmicBackground } from "@/components/layout";
import { Card } from "@/components/ui";
import {
  StatCard,
  AllocationBar,
  AllocationLegend,
  RecommendationsGrid,
  QuickActions,
  HeroSection,
  DataFreshness,
  type Position,
  type Recommendation,
} from "@/components/dashboard";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";

// New imports for portfolio analysis
import { usePortfolioAnalysis } from "@/hooks/usePortfolioAnalysis";
import { useApiClientId } from "@/hooks/useApiClientId";
import { useSelectedAccountIds } from "@/hooks/useSelectedAccountIds";
import { PortfolioTable } from "@/components/portfolio/PortfolioTable";
import { StructureTable } from "@/components/portfolio/StructureTable";
import { PortfolioSummary } from "@/components/portfolio/PortfolioSummary"; // Placeholder needed

import { formatMoneyValue, moneyValueToNumber } from "@/lib/utils/money";
import { quotationToNumber, formatPercent } from "@/utils/formatters"; // Import quotationToNumber and formatPercent
import { MoneyValue } from "@/types/portfolio"; // Import MoneyValue type

export default function DashboardPage() {
  const router = useRouter();
  const { additionalCash, _hasHydrated } = useAppStore();
  const { user } = useAuthStore();

  const apiClientId = useApiClientId();
  const selectedAccountIds = useSelectedAccountIds();

  const {
    data: analysis,
    isLoading,
    error,
    refetch,
  } = usePortfolioAnalysis(apiClientId, selectedAccountIds);

  const isSandbox = true; // Hardcoded for now, can be state later

  console.log("DashboardPage render - isLoading:", isLoading);

  const {
    totalPortfolio,
    totalProfitLoss,
    plPercentage,
    positions,
    recommendations,
    allocationSegments,
    legendItems,
    totalCurrencies,
    enrichedPositions, // Added for new PortfolioTable
    planPositions // Added for new PortfolioTable
  } = useMemo(() => {
    if (!analysis) {
      return {
        totalPortfolio: { currency: 'RUB' as const, units: 0, nano: 0 }, // Default MoneyValue
        totalProfitLoss: 0,
        plPercentage: 0,
        positions: [],
        recommendations: [],
        allocationSegments: { current: [], target: [] },
        legendItems: [],
        totalCurrencies: { currency: 'rub', units: 0, nano: 0 }, // Default MoneyValue
        enrichedPositions: [],
        planPositions: []
      };
    }

    const {
      consolidated_portfolio,
      enriched_positions,
      plan_positions,
      structure_analysis,
    } = analysis;

    const totalPortfolio = consolidated_portfolio.total_amount_portfolio;

    // totalProfitLoss calculation
    const totalProfitLossAmount = enriched_positions.reduce((sum, pos) => {
      // Assuming pos.profit_fifo is a string, convert to number
      return sum + parseFloat(pos.profit_fifo || '0');
    }, 0);
    // Convert totalProfitLossAmount to MoneyValue
    const totalProfitLoss: MoneyValue = {
      currency: totalPortfolio.currency, // Use portfolio currency
      units: Math.floor(totalProfitLossAmount),
      nano: Math.round((totalProfitLossAmount % 1) * 1_000_000_000),
    };

    const plPercentage =
      moneyValueToNumber(totalPortfolio) > 0 ? (moneyValueToNumber(totalProfitLoss) / moneyValueToNumber(totalPortfolio)) * 100 : 0;

    const positions: Position[] = enriched_positions.slice(0, 5).map((pos) => {
      const plan_pos = plan_positions.find((p) => p.figi === pos.figi);
      return {
        ticker: pos.ticker,
        name: pos.name,
        instrumentType: pos.instrument_type,
        price: moneyValueToNumber(pos.current_price), // Convert MoneyValue to number
        quantity: quotationToNumber(pos.quantity), // Convert Quotation to number
        total: moneyValueToNumber(pos.total), // Convert MoneyValue to number
        planTotal: plan_pos?.plan_total ? moneyValueToNumber(plan_pos.plan_total) : 0, // Convert MoneyValue to number
        proportion: parseFloat(pos.proportion_in_portfolio) * 100,
        profit: {
          amount: parseFloat(pos.profit || '0'),
          percent: parseFloat(pos.profit_fifo || '0') * 100,
        },
        targetProgress: parseFloat(plan_pos?.target_progress || '0'),
      };
    });

    const recommendations: Recommendation[] = plan_positions
      .filter((pos) => pos.to_buy_lots.units !== 0 || pos.to_buy_lots.nano !== 0) // Filter by MoneyValue equivalent
      .slice(0, 3)
      .map((pos) => ({
        action: (pos.to_buy_lots.units || pos.to_buy_lots.nano) > 0 ? "BUY" : "SELL", // Check units or nano
        ticker: pos.ticker,
        quantity: Math.abs(quotationToNumber(pos.to_buy_lots)), // Convert Quotation to number
        reason:
          (pos.to_buy_lots.units || pos.to_buy_lots.nano) > 0
            ? `Target allocation: ${(
                parseFloat(pos.plan_proportion_in_portfolio) * 100
              ).toFixed(1)}%`
            : "Reduce position to target",
        type: "rebalance" as const,
      }));

    const currentStructure = structure_analysis.current_low_risk; // Corrected path
    const targetStructure = structure_analysis.plan_low_risk; // Corrected path

    const allocationSegments = {
      current: [
        {
          label: "Shares",
          value: parseFloat(structure_analysis.current_high_risk.component_proportions.shares || '0') * 100,
          color: "bg-primary",
          riskType: 'high' as const,
        },
        {
          label: "ETFs",
          value: parseFloat(structure_analysis.current_high_risk.component_proportions.etf || '0') * 100,
          color: "bg-coral",
          riskType: 'high' as const,
        },
        {
          label: "Bonds",
          value: parseFloat(structure_analysis.current_low_risk.component_proportions.corp_bonds || '0') * 100,
          color: "bg-warning",
          riskType: 'low' as const,
        },
        {
          label: "Gov Bonds",
          value: parseFloat(structure_analysis.current_low_risk.component_proportions.gov_bonds || '0') * 100,
          color: "bg-success",
          riskType: 'low' as const,
        },
      ],
      target: structure_analysis.plan_high_risk && structure_analysis.plan_low_risk
        ? [
            {
              label: "Shares",
              value: parseFloat(structure_analysis.plan_high_risk.component_proportions.shares || '0') * 100,
              color: "bg-primary",
              riskType: 'high' as const,
            },
            {
              label: "ETFs",
              value: parseFloat(structure_analysis.plan_high_risk.component_proportions.etf || '0') * 100,
              color: "bg-coral",
              riskType: 'high' as const,
            },
            {
              label: "Bonds",
              value: parseFloat(structure_analysis.plan_low_risk.component_proportions.corp_bonds || '0') * 100,
              color: "bg-warning",
              riskType: 'low' as const,
            },
            {
              label: "Gov Bonds",
              value: parseFloat(structure_analysis.plan_low_risk.component_proportions.gov_bonds || '0') * 100,
              color: "bg-success",
              riskType: 'low' as const,
            },
          ]
        : [],
    };

    const legendItems = allocationSegments.current.map((segment) => ({
      label: segment.label,
      color: segment.color,
    }));
    
    const totalCurrencies = consolidated_portfolio.total_amount_currencies;

    return {
      totalPortfolio,
      totalProfitLoss,
      plPercentage,
      positions,
      recommendations,
      allocationSegments,
      legendItems,
      totalCurrencies,
      enrichedPositions: enriched_positions,
      planPositions: plan_positions
    };
  }, [analysis]);





  // Show empty state if no accounts selected
  if (!apiClientId || selectedAccountIds.length === 0 || !_hasHydrated) {
    return (
      <AuthGuard>
        <CosmicBackground />
        <div className="grain-overlay" />

        <div className="relative min-h-screen">
          <Header
            isSandbox={isSandbox}
            onToggleSandbox={() => {}}
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
  if (isLoading && !analysis) {
    return (
      <AuthGuard>
        <CosmicBackground />
        <div className="grain-overlay" />

        <div className="relative min-h-screen">
          <Header
            isSandbox={isSandbox}
            onToggleSandbox={() => {}}
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
  if (error && !analysis) {
    return (
      <AuthGuard>
        <CosmicBackground />
        <div className="grain-overlay" />

        <div className="relative min-h-screen">
          <Header
            isSandbox={isSandbox}
            onToggleSandbox={() => {}} // No longer using internal state for isSandbox
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
                  <p className="text-secondary-text mb-4">{error.message}</p>
                  <div className="flex gap-4">
                    <button onClick={() => refetch()} className="btn btn-primary">
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

  if (!analysis) {
    return null;
  }

  return (
    <AuthGuard>
      <CosmicBackground />
      <div className="grain-overlay" />

      <div className="relative min-h-screen">
        <Header
          isSandbox={isSandbox}
          onToggleSandbox={() => {}} // isSandbox is hardcoded for now
          userName={user?.username || "User"}
        />

        <main className="container-app py-8 md:py-12">
          <HeroSection />

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <StatCard
              title="Total Portfolio Value"
              value={formatMoneyValue(analysis.consolidated_portfolio.total_amount_portfolio)}
              change={{
                value: `${plPercentage.toFixed(2)}%`,
                isPositive: plPercentage >= 0,
              }}
              accentColor="primary"
              data-testid="portfolio-total"
            />
            <StatCard
              title="Unrealized P/L"
              value={`${plPercentage >= 0 ? "+" : ""}${formatMoneyValue(totalProfitLoss)}`}
              change={{
                value: `${plPercentage >= 0 ? "+" : ""}${plPercentage.toFixed(2)}%`,
                isPositive: plPercentage >= 0,
              }}
              icon="trending_up"
              accentColor="success"
            />
            <StatCard
              title="Available Cash"
              value={formatMoneyValue(analysis.consolidated_portfolio.cash_balance)}
              subtitle={`${moneyValueToNumber(totalPortfolio) === 0 ? "0.0%" : ((moneyValueToNumber(analysis.consolidated_portfolio.cash_balance) / moneyValueToNumber(totalPortfolio)) * 100).toFixed(1)}% of Portfolio`}
              accentColor="coral"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Risk Allocation with embedded Structure Table */}
              <Card>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Risk Allocation
                </h2>

                {/* Risk Parts Summary - Above bars with visual connection */}
                {(() => {
                  // Calculate widths from actual bar segments
                  const sharesWidth = allocationSegments.current.find(s => s.label === "Shares")?.value || 0;
                  const etfsWidth = allocationSegments.current.find(s => s.label === "ETFs")?.value || 0;
                  const bondsWidth = allocationSegments.current.find(s => s.label === "Bonds")?.value || 0;
                  const govBondsWidth = allocationSegments.current.find(s => s.label === "Gov Bonds")?.value || 0;

                  const highRiskWidth = sharesWidth + etfsWidth;
                  const lowRiskWidth = bondsWidth + govBondsWidth;

                  return (
                    <div className="flex items-center space-x-4 mb-0">
                      <span className="w-32"></span>
                      <div className="flex-1 flex flex-col">
                        {/* Label cards aligned to proportions */}
                        <div className="flex gap-[2px] mb-0">
                          <div
                            className="flex items-center justify-between p-2 px-3 bg-primary/10 border border-primary/30 rounded-t-lg min-w-0 flex-shrink"
                            style={{ width: `${highRiskWidth}%` }}
                          >
                            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">High Risk</span>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              <span className="font-semibold text-text-primary text-sm whitespace-nowrap">
                                {formatPercent(analysis.structure_analysis.current_high_risk.proportion_in_portfolio)}
                              </span>
                              {analysis.structure_analysis.plan_high_risk && (
                                <span className="text-xs text-text-secondary whitespace-nowrap">
                                  → {formatPercent(analysis.structure_analysis.plan_high_risk.proportion_in_portfolio)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div
                            className="flex items-center justify-between p-2 px-3 bg-success/10 border border-success/30 rounded-t-lg min-w-fit flex-grow"
                            style={{ width: `${lowRiskWidth}%` }}
                          >
                            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide whitespace-nowrap">Low Risk</span>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              <span className="font-semibold text-text-primary text-sm whitespace-nowrap">
                                {formatPercent(analysis.structure_analysis.current_low_risk.proportion_in_portfolio)}
                              </span>
                              {analysis.structure_analysis.plan_low_risk && (
                                <span className="text-xs text-text-secondary whitespace-nowrap">
                                  → {formatPercent(analysis.structure_analysis.plan_low_risk.proportion_in_portfolio)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Connector strips aligned to bar segments */}
                        <div className="flex gap-[2px]">
                          <div
                            className="h-2 bg-primary/20 border-l border-r border-primary/30"
                            style={{ width: `${highRiskWidth}%`, minWidth: '16px' }}
                          ></div>
                          <div
                            className="h-2 bg-success/20 border-l border-r border-success/30"
                            style={{ width: `${lowRiskWidth}%`, minWidth: '16px' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-4">
                  <AllocationBar
                    label="Current Allocation"
                    segments={allocationSegments.current}
                  />
                  <AllocationBar
                    label="Target Allocation"
                    segments={allocationSegments.target}
                  />
                </div>

                <AllocationLegend items={legendItems} />

                {/* Embedded Structure Table */}
                <div className="mt-6">
                  <StructureTable data={analysis.structure_analysis} />
                </div>
              </Card>

              {/* Portfolio Summary */}
              <Card>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Portfolio Summary
                </h2>
                <PortfolioSummary
                  consolidated={analysis.consolidated_portfolio}
                  totalCash={analysis.total_additional_cash}
                  assetProportions={analysis.proportion_in_portfolio}
                />
              </Card>
            </div>

            {/* Right Column - Recommendations & Quick Actions */}
            <div className="lg:col-span-4 space-y-6">
              {/* Rebalancing Recommendations */}
              <Card>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
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

              {/* Quick Actions */}
              <Card>
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Quick Actions
                </h2>
                <QuickActions />
              </Card>
            </div>
          </div>

          {/* Full-Width Portfolio Positions */}
          <section className="mt-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Portfolio Positions</h2>
            <PortfolioTable
              enrichedPositions={enrichedPositions}
              planPositions={planPositions}
            />
          </section>

          {/* Data Freshness Footer */}
          <DataFreshness
            lastUpdated={new Date()} // Using current date as last updated time
            onRefresh={() => refetch()} // Use refetch function from usePortfolioAnalysis
            isRefreshing={isLoading} // Use isLoading from usePortfolioAnalysis
          />
        </main>
      </div>
    </AuthGuard>
  );
}
