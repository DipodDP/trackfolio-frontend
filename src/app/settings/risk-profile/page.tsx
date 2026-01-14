"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import { Header, CosmicBackground } from "@/components/layout";
import { Button, Card, Slider, Skeleton } from "@/components/ui";
import apiClient from "@/lib/api-client";
import type { PortfolioStructure } from "@/types/api";

// All proportions are percentages
interface FormData {
  risk_profile: number;
  max_risk_part_drawdown: number;
  risk_proportion: number;
  corp_bonds_proportion: number;
  shares_proportion: number;
}

const initialFormData: FormData = {
  risk_profile: 50,
  max_risk_part_drawdown: 20,
  risk_proportion: 60,
  corp_bonds_proportion: 30,
  shares_proportion: 70,
};

export default function RiskProfilePage() {
  return (
    <AuthGuard>
      <RiskProfilePageContent />
    </AuthGuard>
  );
}

function RiskProfilePageContent() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [existingStructure, setExistingStructure] =
    useState<PortfolioStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchStructure = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<PortfolioStructure>(
          "/portfolio-structures"
        );
        if (response.data) {
          const fetchedData = response.data;
          setFormData({
            risk_profile: fetchedData.risk_profile * 100,
            max_risk_part_drawdown: fetchedData.max_risk_part_drawdown * 100,
            risk_proportion: (fetchedData.risk_proportion || 0) * 100,
            corp_bonds_proportion: fetchedData.corp_bonds_proportion * 100,
            shares_proportion: fetchedData.shares_proportion * 100,
          });
          setExistingStructure(fetchedData);
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          setError(
            err.response?.data?.detail || "Failed to load risk profile."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStructure();
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const validateForm = (): string | null => {
    // Validate that low-risk proportions sum to 100%
    const govBondsProportion = 100 - formData.corp_bonds_proportion;
    if (formData.corp_bonds_proportion < 0 || formData.corp_bonds_proportion > 100) {
      return "Corporate Bonds proportion must be between 0% and 100%.";
    }

    // Validate that high-risk proportions sum to 100%
    const etfProportion = 100 - formData.shares_proportion;
    if (formData.shares_proportion < 0 || formData.shares_proportion > 100) {
      return "Shares proportion must be between 0% and 100%.";
    }

    // Validate drawdown
    if (formData.max_risk_part_drawdown < 5 || formData.max_risk_part_drawdown > 50) {
      return "Max drawdown must be between 5% and 50%.";
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setIsSaving(false);
      return;
    }

    try {
      let response;
      const payload = {
        risk_profile: formData.risk_profile / 100,
        max_risk_part_drawdown: formData.max_risk_part_drawdown / 100,
        corp_bonds_proportion: formData.corp_bonds_proportion / 100,
        shares_proportion: formData.shares_proportion / 100,
      };

      if (existingStructure) {
        // Update existing structure
        response = await apiClient.patch<PortfolioStructure>(
          "/portfolio-structures",
          payload
        );
      } else {
        // Create new structure
        response = await apiClient.post<PortfolioStructure>(
          "/portfolio-structures",
          payload
        );
      }
      setExistingStructure(response.data);
      setSuccess("Risk profile saved successfully!");
    } catch (err: any) {
      setError(
        JSON.stringify(err.response?.data?.detail) || "Failed to save profile."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <CosmicBackground />
      <div className="grain-overlay" />

      <div className="relative min-h-screen">
        <Header />
        <main className="container-app py-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-display text-primary tracking-wider mb-2">
                RISK PROFILE
              </h1>
              <p className="text-secondary-text">
                Define your target portfolio structure based on your risk tolerance.
              </p>
            </div>

            {isLoading ? (
              <Card>
                <div className="space-y-8 p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </Card>
            ) : (
              <form onSubmit={handleSubmit}>
                <Card>
                  <div className="space-y-8 p-4">
                    <Slider
                      label="Risk Profile"
                      value={formData.risk_profile}
                      onChange={(e) => handleChange("risk_profile", e.target.value)}
                      min="0"
                      max="100"
                      step="1"
                      valueLabel={`${formData.risk_profile}%`}
                      minLabel="Conservative"
                      maxLabel="Aggressive"
                    />

                    <Slider
                      label="Max Drawdown for Risky Part"
                      value={formData.max_risk_part_drawdown}
                      onChange={(e) =>
                        handleChange("max_risk_part_drawdown", e.target.value)
                      }
                      min="5"
                      max="50"
                      step="1"
                      valueLabel={`${formData.max_risk_part_drawdown}%`}
                      minLabel="5%"
                      maxLabel="50%"
                    />
                    
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-medium text-primary-text">
                        Proportion of Risky Assets
                        <span
                          className="material-symbols-outlined text-base text-secondary-text ml-1.5"
                          title="This value is calculated automatically from your Risk Profile and Max Drawdown settings."
                        >
                          info
                        </span>
                      </label>
                      <div className="flex items-center justify-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {formData.risk_proportion.toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Slider
                        label="Proportion of Corporate Bonds in Low-Risk Part"
                        value={formData.corp_bonds_proportion}
                        onChange={(e) => handleChange("corp_bonds_proportion", e.target.value)}
                        min="0"
                        max="100"
                        step="1"
                        valueLabel={`${formData.corp_bonds_proportion}%`}
                        minLabel="0%"
                        maxLabel="100%"
                      />
                      <p className="text-xs text-secondary-text">
                        Government Bonds: {100 - formData.corp_bonds_proportion}%
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Slider
                        label="Proportion of Shares in High-Risk Part"
                        value={formData.shares_proportion}
                        onChange={(e) => handleChange("shares_proportion", e.target.value)}
                        min="0"
                        max="100"
                        step="1"
                        valueLabel={`${formData.shares_proportion}%`}
                        minLabel="0%"
                        maxLabel="100%"
                      />
                      <p className="text-xs text-secondary-text">
                        ETFs: {100 - formData.shares_proportion}%
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border-dark mt-6 pt-6 px-8 pb-6">
                    {error && <div className="text-error mb-4">{error}</div>}
                    {success && <div className="text-success mb-4">{success}</div>}
                    <div className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                      >
                        Back
                      </Button>
                      <Button type="submit" isLoading={isSaving}>
                        Save Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              </form>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
