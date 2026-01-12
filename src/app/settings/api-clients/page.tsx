"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/AuthGuard";
import { Header, CosmicBackground } from "@/components/layout";
import { Badge, Button } from "@/components/ui";
import apiClient from "@/lib/api-client";
import type { ApiClient } from "@/types/api";

export default function ApiClientsPage() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    broker_type: "t_investments",
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
      setFormData({ broker_type: "t_investments", token: "", is_sandbox: true });
      fetchClients();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Failed to add API client");
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
      <CosmicBackground />
      <div className="grain-overlay" />

      <div className="relative min-h-screen">
        <Header />
        <main className="container-app py-8">
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
              <Button
                onClick={() => setShowAddForm(!showAddForm)}
                leftIcon={<span className="material-symbols-outlined">add</span>}
              >
                Add Connection
              </Button>
            </div>

            {showAddForm && (
              <div className="card">
                <h2 className="text-xl font-display text-primary-text mb-4">
                  Add New API Client
                </h2>
                {error && (
                  <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="label">Broker Type</label>
                    <select
                      className="input"
                      value={formData.broker_type}
                      onChange={(e) =>
                        setFormData({ ...formData, broker_type: e.target.value })
                      }
                    >
                      <option value="t_investments">T-Investments (Tinkoff)</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">API Token</label>
                    <input
                      type="text"
                      className="input font-mono text-sm"
                      value={formData.token}
                      onChange={(e) =>
                        setFormData({ ...formData, token: e.target.value })
                      }
                      placeholder="t.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      required
                    />
                    <p className="helper-text">
                      Get your API token from T-Investments app settings
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_sandbox"
                      checked={formData.is_sandbox}
                      onChange={(e) =>
                        setFormData({ ...formData, is_sandbox: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-border-dark bg-background-dark text-coral focus:ring-coral"
                    />
                    <label htmlFor="is_sandbox" className="text-sm text-primary-text">
                      Sandbox Mode (recommended for testing)
                    </label>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button type="submit">Add Connection</Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="card text-center py-12">
                <div className="w-8 h-8 border-4 border-border-dark border-t-coral rounded-full animate-spin mx-auto mb-4" />
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
                <Button onClick={() => setShowAddForm(true)}>
                  Add Connection
                </Button>
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
                            <Badge
                              variant={client.is_sandbox ? "warning" : "success"}
                            >
                              {client.is_sandbox ? "Sandbox" : "Production"}
                            </Badge>
                            <span className="text-sm text-secondary-text">
                              ID: {client.id}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-error hover:text-error/80 transition-colors p-2"
                        title="Remove connection"
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
      </div>
    </AuthGuard>
  );
}
