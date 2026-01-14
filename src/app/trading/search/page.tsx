"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { Header, CosmicBackground } from "@/components/layout";
import apiClient from "@/lib/api-client";
import type { Instrument } from "@/types/api";
import { useAppStore } from "@/store/appStore";
import {
  OrderDialog,
  OrderInstrumentData,
} from "@/components/trading/OrderDialog";

export default function TradingSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [selectedInstrument, setSelectedInstrument] =
    useState<OrderInstrumentData | null>(null);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const { selectedApiClientId } = useAppStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!query.trim()) return;

    if (!selectedApiClientId) {
      setError("Please select an API client in the settings before searching.");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await apiClient.get("/instruments/search", {
        params: { query, api_client_id: selectedApiClientId },
      });
      setResults(response.data.instruments || []);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search instruments. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = (instrument: Instrument) => {
    // Convert Instrument to OrderInstrumentData
    const instrumentData: OrderInstrumentData = {
      figi: instrument.figi,
      ticker: instrument.ticker,
      name: instrument.name,
      currency: instrument.currency,
      // Note: We don't have current price from search,
      // so the dialog won't show estimated total
      currentPrice: null,
    };

    setSelectedInstrument(instrumentData);
    setIsOrderDialogOpen(true);
  };

  const handleOrderSuccess = () => {
    // Optionally navigate to positions page or show success message
    // For now, just close the dialog (toast will show success)
  };

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
                SEARCH INSTRUMENTS
              </h1>
              <p className="text-secondary-text">
                Find stocks, bonds, ETFs, and currencies
              </p>
            </div>

            <div className="card">
              <form onSubmit={handleSearch} className="space-y-4">
                {error && (
                  <div className="bg-error/10 border border-error text-error px-4 py-3 rounded">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined">error</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-4">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Search by ticker or name (e.g., SBER, AAPL, BTCUSD)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">search</span>
                    <span>Search</span>
                  </button>
                </div>
              </form>
            </div>

            {loading && (
              <div className="card text-center py-12">
                <div className="w-8 h-8 border-4 border-border-dark border-t-coral rounded-full animate-spin mx-auto mb-4" />
                <div className="text-secondary-text">Searching...</div>
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <div className="card text-center py-12">
                <span className="material-symbols-outlined text-6xl text-secondary-text mb-4">
                  search_off
                </span>
                <h3 className="text-xl font-display text-primary-text mb-2">
                  No Results Found
                </h3>
                <p className="text-secondary-text">
                  Try a different search term
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-4">
                {results.map((instrument) => (
                  <div
                    key={instrument.figi}
                    className="card hover:border-coral transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-display text-primary-text">
                            {instrument.ticker}
                          </h3>
                          <span className="badge-neutral">
                            {instrument.instrument_type}
                          </span>
                        </div>
                        <p className="text-secondary-text text-sm mb-1">
                          {instrument.name}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-secondary-text">
                          <span>FIGI: {instrument.figi}</span>
                          <span>Currency: {instrument.currency}</span>
                          <span>Lot: {instrument.lot}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBuyClick(instrument)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined">
                          trending_up
                        </span>
                        <span>Buy</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Order Dialog */}
            {selectedInstrument && (
              <OrderDialog
                open={isOrderDialogOpen}
                onOpenChange={setIsOrderDialogOpen}
                instrument={selectedInstrument}
                orderType="BUY"
                recommendedLots={1}
                onSuccess={handleOrderSuccess}
              />
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
