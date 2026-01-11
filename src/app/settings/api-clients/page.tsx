"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import Navigation from "@/components/Navigation";
import apiClient from "@/lib/api-client";
import type { ApiClient } from "@/types/api";

export default function ApiClientsPage() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    broker_type: "tinkoff",
    token: "",
    is_sandbox: true,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await apiClient.get("/api-clients");
      setClients(response.data.data || []);
    } catch (err) {
      console.error("Error fetching API clients:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await apiClient.post("/api-clients", formData);
      setShowAddForm(false);
      setFormData({ broker_type: "tinkoff", token: "", is_sandbox: true });
      fetchClients();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add API client");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this connection?")) {
      return;
    }

    try {
      await apiClient.delete(`/api-clients/${id}`);
      fetchClients();
    } catch (err) {
      console.error("Error deleting API client:", err);
    }
  };

  return (
    <AuthGuard>
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display text-primary tracking-wider mb-2">
                API CLIENTS
              </h1>
              <p className="text-secondary-text">
                Manage your broker connections
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              <span>Add Connection</span>
            </button>
          </div>

          {showAddForm && (
            <div className="card">
              <h2 className="text-xl font-display text-primary-text mb-4">
                Add New API Client
              </h2>
              {error && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Broker Type
                  </label>
                  <select
                    className="input w-full"
                    value={formData.broker_type}
                    onChange={(e) =>
                      setFormData({ ...formData, broker_type: e.target.value })
                    }
                  >
                    <option value="tinkoff">T-Investments (Tinkoff)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    API Token
                  </label>
                  <input
                    type="text"
                    className="input w-full font-mono text-sm"
                    value={formData.token}
                    onChange={(e) =>
                      setFormData({ ...formData, token: e.target.value })
                    }
                    placeholder="t.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_sandbox"
                    checked={formData.is_sandbox}
                    onChange={(e) =>
                      setFormData({ ...formData, is_sandbox: e.target.checked })
                    }
                    className="rounded"
                  />
                  <label htmlFor="is_sandbox" className="text-sm">
                    Sandbox Mode (recommended for testing)
                  </label>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn-primary">
                    Add Connection
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="card text-center py-12">
              <div className="text-secondary-text">Loading connections...</div>
            </div>
          ) : clients.length === 0 ? (
            <div className="card text-center py-12">
              <span className="material-symbols-outlined text-6xl text-secondary-text mb-4">
                link_off
              </span>
              <h3 className="text-xl font-display text-primary-text mb-2">
                No API Clients
              </h3>
              <p className="text-secondary-text mb-4">
                Add your first broker connection to get started
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                Add Connection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map((client) => (
                <div key={client.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-4xl text-primary">
                        link
                      </span>
                      <div>
                        <h3 className="text-lg font-display text-primary-text">
                          {client.broker_type.toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              client.is_sandbox
                                ? "bg-coral/20 text-coral"
                                : "bg-success/20 text-success"
                            }`}
                          >
                            {client.is_sandbox ? "Sandbox" : "Production"}
                          </span>
                          <span className="text-sm text-secondary-text">
                            ID: {client.id}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-error hover:text-error/80 transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
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
