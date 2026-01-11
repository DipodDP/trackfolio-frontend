"use client";

import AuthGuard from "@/components/AuthGuard";
import Navigation from "@/components/Navigation";

export default function PositionsPage() {
  return (
    <AuthGuard>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-display text-primary tracking-wider mb-2">
              POSITIONS
            </h1>
            <p className="text-secondary-text">
              View and manage your portfolio positions
            </p>
          </div>

          <div className="card">
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-secondary-text mb-4">
                inventory_2
              </span>
              <h3 className="text-xl font-display text-primary-text mb-2">
                No Positions
              </h3>
              <p className="text-secondary-text mb-4">
                Connect an API client and run portfolio analysis to see your
                positions
              </p>
              <a href="/settings/api-clients" className="btn-primary">
                Add API Client
              </a>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
