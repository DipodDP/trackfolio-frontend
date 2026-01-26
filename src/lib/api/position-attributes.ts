import apiClient from "@/lib/api-client";
import type { PositionAttributesUpdate } from "@/lib/schemas/position.schema";

/**
 * Response type for position attributes update
 */
export interface PositionAttributesResponse {
  figi: string;
  plan_proportion_in_portfolio: number;
  target_profit: number;
  exit_drawdown: number;
}

/**
 * Update position attributes (target proportion, target profit, exit drawdown)
 * @param figi - The FIGI identifier for the position
 * @param updates - Partial updates to position attributes
 * @returns Updated position attributes
 * @throws Error with user-friendly message on failure
 */
export async function updatePositionAttributes(
  figi: string,
  updates: Omit<PositionAttributesUpdate, "figi">
): Promise<PositionAttributesResponse> {
  // Validate FIGI
  if (!figi) {
    throw new Error("FIGI is required");
  }

  // Validate at least one update field is provided
  if (
    updates.plan_proportion_in_portfolio === undefined &&
    updates.target_profit === undefined &&
    updates.exit_drawdown === undefined
  ) {
    throw new Error("At least one field must be provided for update");
  }

  try {
    // Make API call
    const response = await apiClient.patch<PositionAttributesResponse>(
      `/position-attributes/${figi}`,
      updates
    );

    return response.data;
  } catch (error: any) {
    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          throw new Error("Invalid proportion value. Must be between 0% and 100%");
        case 404:
          throw new Error("Position attributes not found. Please refresh and try again");
        case 422:
          // Extract specific validation error from response
          const detail = data?.detail;
          if (Array.isArray(detail) && detail.length > 0) {
            const firstError = detail[0];
            throw new Error(firstError.msg || "Validation error");
          }
          throw new Error(JSON.stringify(detail) || "Validation error");
        default:
          throw new Error(
            JSON.stringify(data?.detail) || `Update failed with status ${status}`
          );
      }
    }

    // Network or unknown error
    throw new Error(error.message || "Connection failed. Please try again");
  }
}
