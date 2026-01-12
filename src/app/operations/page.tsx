"use client";

import AuthGuard from "@/components/AuthGuard";
import { Header, CosmicBackground } from "@/components/layout";

export default function OperationsPage() {
  return (
    <AuthGuard>
      <CosmicBackground />
      <div className="grain-overlay" />

      <div className="relative min-h-screen">
        <Header />
        <main className="container-app py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-display text-primary tracking-wider mb-2">
                OPERATIONS HISTORY
              </h1>
              <p className="text-secondary-text">
                View your transaction history
              </p>
            </div>

            <div className="card">
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-secondary-text mb-4">
                  history
                </span>
                <h3 className="text-xl font-display text-primary-text mb-2">
                  No Operations
                </h3>
                <p className="text-secondary-text">
                  Your transaction history will appear here
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
