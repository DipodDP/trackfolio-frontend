"use client";

import AuthGuard from "@/components/AuthGuard";
import Navigation from "@/components/Navigation";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-display text-primary tracking-wider mb-2">
              DASHBOARD
            </h1>
            <p className="text-secondary-text">
              Your portfolio overview and insights
            </p>
          </div>

          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <span className="text-secondary-text text-sm">Total Value</span>
                <span className="material-symbols-outlined text-primary">
                  account_balance_wallet
                </span>
              </div>
              <div className="text-3xl font-display text-primary-text">
                ₽ 0.00
              </div>
              <div className="text-sm text-success mt-2">+0.00%</div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <span className="text-secondary-text text-sm">Cash Balance</span>
                <span className="material-symbols-outlined text-primary">
                  payments
                </span>
              </div>
              <div className="text-3xl font-display text-primary-text">
                ₽ 0.00
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <span className="text-secondary-text text-sm">Positions</span>
                <span className="material-symbols-outlined text-primary">
                  inventory_2
                </span>
              </div>
              <div className="text-3xl font-display text-primary-text">0</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-display text-primary-text mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="/trading/search" className="btn-primary text-center">
                <span className="material-symbols-outlined">search</span>
                <span>Search Instruments</span>
              </a>
              <a href="/positions" className="btn-secondary text-center">
                <span className="material-symbols-outlined">inventory_2</span>
                <span>View Positions</span>
              </a>
              <a href="/analysis" className="btn-secondary text-center">
                <span className="material-symbols-outlined">analytics</span>
                <span>Portfolio Analysis</span>
              </a>
              <a href="/settings/api-clients" className="btn-secondary text-center">
                <span className="material-symbols-outlined">link</span>
                <span>Manage Connections</span>
              </a>
            </div>
          </div>

          {/* Getting Started */}
          <div className="card bg-primary/5 border-primary">
            <h2 className="text-xl font-display text-primary mb-4">
              Getting Started
            </h2>
            <ol className="space-y-3 text-secondary-text">
              <li className="flex items-start gap-3">
                <span className="text-primary font-display text-lg">1.</span>
                <div>
                  <strong className="text-primary-text">Connect your broker</strong>
                  <p className="text-sm">
                    Add your T-Investments API token in Settings → API Clients
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-display text-lg">2.</span>
                <div>
                  <strong className="text-primary-text">Set up risk profile</strong>
                  <p className="text-sm">
                    Configure your portfolio structure in Settings → Risk Profile
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary font-display text-lg">3.</span>
                <div>
                  <strong className="text-primary-text">View your portfolio</strong>
                  <p className="text-sm">
                    See consolidated positions and analysis in Dashboard
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
