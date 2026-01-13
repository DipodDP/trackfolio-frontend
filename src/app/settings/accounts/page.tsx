"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import apiClient from "@/lib/api-client";
import type { BrokerAccount, BrokerAccountsResponse } from "@/types/api";
import AuthGuard from "@/components/AuthGuard";
import { Header, CosmicBackground } from "@/components/layout";

export default function AccountsPage() {
  return (
    <AuthGuard>
      <AccountsPageContent />
    </AuthGuard>
  );
}

function AccountsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");

  const {
    selectedAccountIds,
    toggleAccountSelection,
    setSelectedApiClient,
    setSelectedAccountIds,
  } = useAppStore();

  const [accounts, setAccounts] = useState<BrokerAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brokerType, setBrokerType] = useState<string>("");
  const [isSandbox, setIsSandbox] = useState<boolean>(false);

  useEffect(() => {
    if (!clientId) {
      setError("No API client ID provided");
      setIsLoading(false);
      return;
    }

    const fetchAccounts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get<BrokerAccountsResponse>(
          `/api-clients/${clientId}/accounts`
        );

        setAccounts(response.data.accounts);
        setBrokerType(response.data.broker_type);
        setIsSandbox(response.data.is_sandbox);
      } catch (err: any) {
        console.error("Failed to fetch accounts:", err);
        setError(
          err.response?.data?.detail ||
            "Failed to fetch broker accounts. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [clientId]);

  const handleSaveSelection = () => {
    if (!clientId) return;

    if (selectedAccountIds.length === 0) {
      setError("Please select at least one account");
      return;
    }

    // Save the selected API client ID and selected account IDs, then redirect to dashboard
    setSelectedApiClient(parseInt(clientId));
    setSelectedAccountIds(selectedAccountIds);
    router.push("/dashboard");
  };

  const handleSelectAll = () => {
    if (selectedAccountIds.length === accounts.length) {
      // Deselect all
      setSelectedAccountIds([]);
    } else {
      // Select all
      setSelectedAccountIds(accounts.map((acc) => acc.id));
    }
  };

  if (!clientId) {
    return (
      <AuthGuard>
        <CosmicBackground />
        <div className="grain-overlay" />

        <div className="relative min-h-screen">
          <Header />

          <main className="container-app py-8">
            <div className="card p-8 text-center">
              <h1 className="text-2xl font-display text-primary-text mb-4">
                No API Client Selected
              </h1>
              <p className="text-secondary-text mb-6">
                Please select an API client from the settings page.
              </p>
              <button
                onClick={() => router.push("/settings/api-clients")}
                className="btn btn-primary"
              >
                Go to API Clients
              </button>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <CosmicBackground />
      <div className="grain-overlay" />

      <div className="relative min-h-screen">
        <Header />

        <main className="container-app py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/settings/api-clients")}
              className="btn btn-ghost mb-4"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to API Clients
            </button>

            <h1 className="text-4xl font-display text-primary-text mb-2">
              Select Broker Accounts
            </h1>
            <p className="text-secondary-text">
              Choose which accounts to include in your portfolio analysis
            </p>

            {brokerType && (
              <div className="flex gap-2 mt-4">
                <span className="badge badge-neutral">{brokerType.toUpperCase()}</span>
                <span className={`badge ${isSandbox ? "badge-warning" : "badge-success"}`}>
                  {isSandbox ? "Sandbox" : "Production"}
                </span>
              </div>
            )}
          </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card p-8">
          <div className="flex items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-secondary-text">Loading accounts...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="card p-6 border-2 border-error bg-error/10 mb-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-error">error</span>
            <div className="flex-1">
              <h3 className="font-bold text-primary-text mb-1">Error Loading Accounts</h3>
              <p className="text-secondary-text">{error}</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary mt-4"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Accounts List */}
      {!isLoading && !error && accounts.length > 0 && (
        <>
          {/* Selection Controls */}
          <div className="card p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-secondary-text">
                <span className="font-bold text-primary-text">
                  {selectedAccountIds.length}
                </span>{" "}
                of {accounts.length} accounts selected
              </div>
              <button onClick={handleSelectAll} className="btn btn-ghost btn-sm">
                {selectedAccountIds.length === accounts.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>
          </div>

          {/* Account Cards */}
          <div className="grid gap-4 mb-8">
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                selected={selectedAccountIds.includes(account.id)}
                onToggle={() => toggleAccountSelection(account.id)}
              />
            ))}
          </div>

          {/* Save Button */}
          <div className="card p-6 sticky bottom-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-secondary-text">
                {selectedAccountIds.length > 0 ? (
                  <>
                    Ready to analyze portfolio with{" "}
                    <span className="font-bold text-primary-text">
                      {selectedAccountIds.length}
                    </span>{" "}
                    account{selectedAccountIds.length > 1 ? "s" : ""}
                  </>
                ) : (
                  "Select at least one account to continue"
                )}
              </div>
              <button
                onClick={handleSaveSelection}
                disabled={selectedAccountIds.length === 0}
                className="btn btn-primary"
              >
                <span className="material-symbols-outlined">check</span>
                Save Selection
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !error && accounts.length === 0 && (
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-6xl text-secondary-text mb-4">
            account_balance_wallet
          </span>
          <h3 className="text-xl font-display text-primary-text mb-2">
            No Accounts Found
          </h3>
          <p className="text-secondary-text mb-6">
            This API client doesn't have any broker accounts available.
          </p>
          <button
            onClick={() => router.push("/settings/api-clients")}
            className="btn btn-secondary"
          >
            Back to API Clients
          </button>
        </div>
      )}
        </main>
      </div>
    </AuthGuard>
  );
}

interface AccountCardProps {
  account: BrokerAccount;
  selected: boolean;
  onToggle: () => void;
}

function AccountCard({ account, selected, onToggle }: AccountCardProps) {
  return (
    <div
      onClick={onToggle}
      className={`card card-interactive p-6 cursor-pointer transition-all ${
        selected ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
      data-testid="account-card"
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 h-5 w-5 rounded border-secondary-text/30 text-primary focus:ring-primary focus:ring-offset-0"
        />

        {/* Account Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-primary-text mb-1">
                {account.name || "Unnamed Account"}
              </h3>
              <p className="text-secondary-text text-sm mb-3">
                Account ID: <span className="font-mono">{account.id}</span>
              </p>
            </div>

            {/* Status Badge */}
            <span
              className={`badge ${
                account.is_active ? "badge-success" : "badge-error"
              }`}
            >
              {account.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Broker Type */}
          <div className="text-xs text-secondary-text">
            <span className="material-symbols-outlined text-sm align-middle mr-1">
              business
            </span>
            {account.broker_type}
          </div>
        </div>

        {/* Selection Indicator */}
        {selected && (
          <div className="text-primary">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
        )}
      </div>
    </div>
  );
}
