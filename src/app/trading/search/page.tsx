"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Navigation from "@/components/Navigation";
import apiClient from "@/lib/api-client";
import type { Instrument } from "@/types/api";

export default function TradingSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await apiClient.get("/instruments/search", {
        params: { query },
      });
      setResults(response.data.instruments || []);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <div className="flex gap-4">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Search by ticker or name (e.g., SBER, AAPL, BTCUSD)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <span className="material-symbols-outlined">search</span>
                  <span>Search</span>
                </button>
              </div>
            </form>
          </div>

          {loading && (
            <div className="card text-center py-12">
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
                <div key={instrument.figi} className="card hover:border-primary transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-display text-primary-text">
                          {instrument.ticker}
                        </h3>
                        <span className="px-2 py-1 rounded text-xs bg-card-dark border border-border-dark text-secondary-text">
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
                    <a
                      href={`/trading/execute?figi=${instrument.figi}`}
                      className="btn-primary flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">trending_up</span>
                      <span>Trade</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
