"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TablePosition } from "@/types/position";
import { formatPercent } from "@/utils/formatters";
import { updatePositionAttributes } from "@/lib/api/position-attributes";
import { toast } from "sonner";

interface EditTargetsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  position: TablePosition | null;
  onSave: () => Promise<void>;
}

export function EditTargetsDialog({
  isOpen,
  onClose,
  position,
  onSave,
}: EditTargetsDialogProps) {
  const [editedProportion, setEditedProportion] = useState("");
  const [editedTargetProfit, setEditedTargetProfit] = useState("");
  const [editedExitDrawdown, setEditedExitDrawdown] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize edited values when position changes
  useEffect(() => {
    if (position) {
      if (position.plan_proportion_in_portfolio) {
        setEditedProportion(
          (position.plan_proportion_in_portfolio * 100).toFixed(2)
        );
      }
      if (position.target_profit) {
        setEditedTargetProfit((position.target_profit * 100).toFixed(2));
      }
      if (position.exit_drawdown) {
        setEditedExitDrawdown((position.exit_drawdown * 100).toFixed(2));
      }
    }
  }, [position]);

  const handleSave = async () => {
    if (!position) return;

    setIsLoading(true);
    try {
      // Validate inputs
      const proportionValue = parseFloat(editedProportion);
      const targetProfitValue = parseFloat(editedTargetProfit);
      const exitDrawdownValue = parseFloat(editedExitDrawdown);

      if (
        isNaN(proportionValue) ||
        proportionValue < 0 ||
        proportionValue > 100
      ) {
        toast.error("Invalid proportion", {
          description: "Target proportion must be between 0% and 100%",
        });
        return;
      }
      if (
        isNaN(targetProfitValue) ||
        targetProfitValue < 0 ||
        targetProfitValue > 1000
      ) {
        toast.error("Invalid target profit", {
          description: "Target profit must be between 0% and 1000%",
        });
        return;
      }
      if (
        isNaN(exitDrawdownValue) ||
        exitDrawdownValue < 0 ||
        exitDrawdownValue > 100
      ) {
        toast.error("Invalid exit drawdown", {
          description: "Exit drawdown must be between 0% and 100%",
        });
        return;
      }

      // Convert percentages to decimals
      const decimalProportion = proportionValue / 100;
      const decimalTargetProfit = targetProfitValue / 100;
      const decimalExitDrawdown = exitDrawdownValue / 100;

      // Call API to update attributes
      await updatePositionAttributes(position.figi, {
        plan_proportion_in_portfolio: decimalProportion,
        target_profit: decimalTargetProfit,
        exit_drawdown: decimalExitDrawdown,
      });

      // Show success message
      toast.success("Position attributes updated", {
        description: `Updated settings for ${position.ticker}`,
      });

      // Refresh data and close modal
      await onSave();
    } catch (error: any) {
      console.error("Failed to update position attributes:", error);
      toast.error("Failed to update attributes", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!position) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Position Attributes</DialogTitle>
          <DialogDescription>
            Adjust target proportion, profit, and drawdown for {position.ticker}
            ({position.name})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Current Proportion */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Current Proportion
            </label>
            <div className="text-lg font-semibold text-text-secondary">
              {formatPercent(position.proportion_in_portfolio)}
            </div>
          </div>

          {/* Target Proportion */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-text-primary"
              htmlFor="target-proportion"
            >
              Target Proportion (%)
            </label>
            <input
              id="target-proportion"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={editedProportion}
              onChange={(e) => setEditedProportion(e.target.value)}
              placeholder="e.g., 5%"
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
              disabled={isLoading}
            />
          </div>

          {/* Target Profit */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-text-primary"
              htmlFor="target-profit"
            >
              Target Profit (%)
            </label>
            <input
              id="target-profit"
              type="number"
              step="0.01"
              min="0"
              max="1000"
              value={editedTargetProfit}
              onChange={(e) => setEditedTargetProfit(e.target.value)}
              placeholder="e.g., 20%"
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
              disabled={isLoading}
            />
          </div>

          {/* Exit Drawdown */}
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-text-primary"
              htmlFor="exit-drawdown"
            >
              Exit Drawdown (%)
            </label>
            <input
              id="exit-drawdown"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={editedExitDrawdown}
              onChange={(e) => setEditedExitDrawdown(e.target.value)}
              placeholder="e.g., 10%"
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-text-primary"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
