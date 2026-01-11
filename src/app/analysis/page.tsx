"use client";

import AuthGuard from "@/components/AuthGuard";
import Navigation from "@/components/Navigation";

export default function AnalysisPage() {
  return (
    <AuthGuard>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-display text-primary tracking-wider mb-2">
              PORTFOLIO ANALYSIS
            </h1>
            <p className="text-secondary-text">
              Comprehensive portfolio insights and rebalancing recommendations
            </p>
          </div>

          <div className="card">
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-secondary-text mb-4">
                analytics
              </span>
              <h3 className="text-xl font-display text-primary-text mb-2">
                Analysis Not Available
              </h3>
              <p className="text-secondary-text mb-4">
                Connect an API client and configure your risk profile to run
                portfolio analysis
              </p>
              <div className="flex gap-4 justify-center">
                <a href="/settings/api-clients" className="btn-primary">
                  Add API Client
                </a>
                <a href="/settings/risk-profile" className="btn-secondary">
                  Configure Risk Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
