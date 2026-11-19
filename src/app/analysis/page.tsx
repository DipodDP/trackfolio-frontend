"use client";

import AuthGuard from "@/components/AuthGuard";
import { Header, CosmicBackground } from "@/components/layout";
import { RecommendationsPanel } from "@/components/recommendations/RecommendationsPanel";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";

export default function AnalysisPage() {
  const apiClientId = useAppStore(state => state.selectedApiClientId);
  const hasHydrated = useAppStore(state => state._hasHydrated);
  const user = useAuthStore(state => state.user);

  return (
    <AuthGuard>
      <CosmicBackground />
      <div className="grain-overlay" />
      <div className="relative min-h-screen">
        <Header />
        <main className="container-app py-8 space-y-6">
          <div>
            <h1 className="text-4xl font-display text-primary tracking-wider mb-2">
              PORTFOLIO ANALYSIS
            </h1>
            <p className="text-secondary-text max-w-3xl">
              Compare your channel’s model portfolio with your current targets,
              then choose which allocation changes to apply.
            </p>
          </div>
          {user && hasHydrated ? (
            <RecommendationsPanel apiClientId={apiClientId} userId={String(user.id)} />
          ) : <p role="status">Loading your portfolio settings…</p>}
        </main>
      </div>
    </AuthGuard>
  );
}
