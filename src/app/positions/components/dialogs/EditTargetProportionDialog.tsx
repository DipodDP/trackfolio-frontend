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

interface EditTargetProportionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  position: TablePosition | null;
  onSave: () => Promise<void>;
}

export function EditTargetProportionDialog({
  isOpen,
  onClose,
  position,
  onSave,
}: EditTargetProportionDialogProps) {
  const [editedProportion, setEditedProportion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize editedProportion when position changes
  useEffect(() => {
    if (position?.plan_proportion_in_portfolio) {
      // Convert to percentage (multiply by 100)
      setEditedProportion(
        (position.plan_proportion_in_portfolio * 100).toFixed(2)
      );
    }
  }, [position]);

  const handleSave = async () => {
    if (!position) return;

    setIsLoading(true);
    try {
      // TODO: Call API to update target proportion
      // Backend API integration pending - requires endpoint to update single position's target proportion
      console.log(
        "Update target proportion:",
        position.figi,
        editedProportion,
        "%"
      );

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Call onSave to refresh data and close modal
      await onSave();
    } catch (error) {
      console.error("Failed to update target proportion:", error);
      // TODO: Show error toast notification
    } finally {
      setIsLoading(false);
    }
  };

  if (!position) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Target Proportion</DialogTitle>
          <DialogDescription>
            Adjust the target portfolio proportion for {position.ticker} (
            {position.name})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Current Proportion
            </label>
            <div className="text-lg font-semibold text-text-secondary">
              {formatPercent(position.proportion_in_portfolio)}
            </div>
          </div>
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
