"use client";

import { useState } from "react";
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

// Mock data - will be replaced with API calls
const mockPositions: Position[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    instrumentType: "Equity",
    price: 200,
    quantity: 1000,
    total: 200000,
    planTotal: 220000,
    proportion: 16,
    profit: { amount: 30000, percent: 15 },
    targetProgress: 90,
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    instrumentType: "Equity",
    price: 400,
    quantity: 200,
    total: 80000,
    planTotal: 80000,
    proportion: 8,
    profit: { amount: 10000, percent: 10 },
    targetProgress: 90,
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    instrumentType: "Equity",
    price: 150,
    quantity: 500,
    total: 75000,
    planTotal: 75000,
    proportion: 7,
    profit: { amount: 5000, percent: 7 },
    targetProgress: 85,
  },
  {
    ticker: "TLT",
    name: "iShares 20+ Year Treasury",
    instrumentType: "Bond",
    price: 100,
    quantity: 500,
    total: 50000,
    planTotal: 50000,
    proportion: 4,
    profit: { amount: -2000, percent: -4 },
    targetProgress: 32,
  },
  {
    ticker: "BND",
    name: "Vanguard Total Bond",
    instrumentType: "Bond",
    price: 80,
    quantity: 400,
    total: 32000,
    planTotal: 30000,
    proportion: 3,
    profit: { amount: 2000, percent: 6 },
    targetProgress: 95,
  },
];

const mockRecommendations: Recommendation[] = [
  {
    action: "SELL",
    ticker: "NVDA",
    quantity: 3,
    reason: "Overweight after recent surge",
    type: "rebalance",
  },
  {
    action: "BUY",
    ticker: "TSLA",
    quantity: 5,
    reason: "Realign with target tech exposure",
    type: "rebalance",
  },
  {
    action: "BUY",
    ticker: "TLT",
    quantity: 10,
    reason: "Increase bond allocation",
    type: "risk",
  },
];

const allocationSegments = {
  current: [
    { label: "Stocks", value: 65, color: "bg-zinc-600" },
    { label: "Bonds", value: 20, color: "bg-zinc-500" },
    { label: "Cash", value: 10, color: "bg-zinc-400" },
    { label: "Alternative", value: 5, color: "bg-zinc-300" },
  ],
  target: [
    { label: "Stocks", value: 60, color: "bg-zinc-600" },
    { label: "Bonds", value: 25, color: "bg-zinc-500" },
    { label: "Cash", value: 5, color: "bg-zinc-400" },
    { label: "Alternative", value: 10, color: "bg-zinc-300" },
  ],
};

const legendItems = [
  { label: "Stocks", color: "bg-zinc-600" },
  { label: "Bonds", color: "bg-zinc-500" },
  { label: "Cash", color: "bg-zinc-400" },
  { label: "Alternative", color: "bg-zinc-300" },
];

export default function DashboardPage() {
  const [isSandbox, setIsSandbox] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated] = useState(new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const handleToggleSandbox = () => {
    setIsSandbox((prev) => !prev);
  };

  return (
    <AuthGuard>
      <CosmicBackground />
      <div className="grain-overlay" />

      <div className="relative min-h-screen">
        <Header
          isSandbox={isSandbox}
          onToggleSandbox={handleToggleSandbox}
          userName="Alex"
        />

        <main className="container-app py-12 md:py-16">
          <HeroSection />

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6 mb-8">
            <StatCard
              title="Total Portfolio Value"
              value="$1,245,678.90"
              change={{ value: "2.34%", isPositive: true }}
              accentColor="primary"
            />
            <StatCard
              title="Unrealized P/L"
              value="+$54,321.05"
              change={{ value: "4.56%", isPositive: true }}
              icon="trending_up"
              accentColor="success"
            />
            <StatCard
              title="Available Cash"
              value="$123,456.78"
              subtitle="10.1% of Portfolio"
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
                  Risk Allocation
                </h2>
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
                <PositionsTable positions={mockPositions} />
              </Card>
            </div>

            {/* Right Column - Recommendations & Quick Actions */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Rebalancing Recommendations */}
              <Card>
                <h2 className="text-lg font-semibold text-primary-text mb-4">
                  Rebalancing Recommendations
                </h2>
                <RecommendationsGrid
                  recommendations={mockRecommendations}
                  onRecommendationClick={(rec) =>
                    console.log("Clicked recommendation:", rec)
                  }
                />
              </Card>

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
            lastUpdated={lastUpdated}
            isStale={false}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />
        </main>
      </div>
    </AuthGuard>
  );
}
