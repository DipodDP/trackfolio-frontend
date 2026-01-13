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
            risk_profile: fetchedData.risk_profile,
            max_risk_part_drawdown: fetchedData.max_risk_part_drawdown,
            risk_proportion: fetchedData.risk_proportion,
            corp_bonds_proportion: fetchedData.corp_bonds_proportion,
            shares_proportion: fetchedData.shares_proportion,
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

    // Validate risk proportion
    if (formData.risk_proportion < 10 || formData.risk_proportion > 90) {
      return "Risk proportion must be between 10% and 90%.";
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
        ...formData,
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
      setError(err.response?.data?.detail || "Failed to save risk profile.");
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
                    
                    <Slider
                      label="Proportion of Risky Assets"
                      value={formData.risk_proportion}
                      onChange={(e) => handleChange("risk_proportion", e.target.value)}
                      min="10"
                      max="90"
                      step="1"
                      valueLabel={`${formData.risk_proportion}%`}
                      minLabel="10%"
                      maxLabel="90%"
                    />
                    
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
