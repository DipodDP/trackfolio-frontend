"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OrderDirection } from "@/types/trading";
import { formatMoneyValue, moneyValueToNumber } from "@/lib/utils/money";
import { placeMarketOrder } from "@/lib/api/orders";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import type { MoneyValue } from "@/types/api";

/**
 * Generic instrument data for orders
 */
export interface OrderInstrumentData {
  figi: string;
  ticker: string;
  name: string;
  currentPrice?: MoneyValue | null;
  currency?: string;
}

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instrument: OrderInstrumentData;
  orderType: "BUY" | "SELL";
  recommendedLots?: number;
  onSuccess?: () => void;
}

export function OrderDialog({
  open,
  onOpenChange,
  instrument,
  orderType,
  recommendedLots = 1,
  onSuccess,
}: OrderDialogProps) {
  const { selectedApiClientId, selectedAccountIds } = useAppStore();
  const [quantity, setQuantity] = useState(Math.abs(recommendedLots));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate estimated total if price is available
  const currentPrice = instrument.currentPrice
    ? moneyValueToNumber(instrument.currentPrice)
    : null;

  const estimatedTotal = useMemo(() => {
    if (!currentPrice) return null;
    return currentPrice * quantity;
  }, [currentPrice, quantity]);

  // Check if quantity differs from recommendation
  const differsFromRecommendation = quantity !== Math.abs(recommendedLots);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setQuantity(value);
    setError(null);
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedApiClientId) {
      setError("No API client selected. Please configure one in Settings.");
      return;
    }

    if (selectedAccountIds.length === 0) {
      setError("No account selected. Please configure one in Settings.");
      return;
    }

    if (quantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    if (!Number.isInteger(quantity)) {
      setError("Quantity must be a whole number");
      return;
    }

    // Submit order
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await placeMarketOrder({
        apiClientId: selectedApiClientId,
        accountId: selectedAccountIds[0], // Use first account for now
        figi: instrument.figi,
        lots: quantity,
        direction: orderType as OrderDirection,
      });

      // Success!
      toast.success(
        `✓ Order executed: ${orderType} ${result.executed_quantity} lots of ${instrument.ticker}`,
        {
          description: `Order ID: ${result.order_id}`,
        }
      );

      // Call onSuccess callback to refresh data
      onSuccess?.();

      // Close dialog
      onOpenChange(false);

      // Reset state
      setQuantity(Math.abs(recommendedLots));
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to execute order";
      setError(errorMessage);
      toast.error(`✗ Order failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    // Reset state
    setQuantity(Math.abs(recommendedLots));
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-primary">
              {orderType === "BUY" ? "trending_up" : "trending_down"}
            </span>
            <span>{orderType} Order</span>
          </DialogTitle>
          <DialogDescription>
            Execute a market {orderType.toLowerCase()} order for {instrument.ticker}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Instrument Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-secondary-text uppercase tracking-wider">
                Ticker
              </label>
              <div className="font-mono font-bold text-lg text-primary-text">
                {instrument.ticker}
              </div>
            </div>
            <div>
              <label className="text-xs text-secondary-text uppercase tracking-wider">
                Name
              </label>
              <div className="text-sm text-primary-text truncate">
                {instrument.name}
              </div>
            </div>
          </div>

          {/* Current Price */}
          {instrument.currentPrice && (
            <div>
              <label className="text-xs text-secondary-text uppercase tracking-wider">
                Current Price
              </label>
              <div className="text-lg font-semibold text-primary-text">
                {formatMoneyValue(instrument.currentPrice, { decimals: 2 })}
              </div>
            </div>
          )}

          {/* Order Type Badge */}
          <div>
            <label className="text-xs text-secondary-text uppercase tracking-wider">
              Order Type
            </label>
            <div className="mt-1">
              <Badge className={orderType === "BUY" ? "bg-success" : "bg-coral"}>
                {orderType} MARKET ORDER
              </Badge>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="text-xs text-secondary-text uppercase tracking-wider block mb-2">
              Quantity (Lots)
            </label>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              step="1"
              className="w-full px-4 py-2 bg-background border border-border/50 rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isSubmitting}
            />
            {differsFromRecommendation && recommendedLots > 0 && (
              <p className="text-xs text-warning mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  warning
                </span>
                Differs from recommended: {Math.abs(recommendedLots)} lots
              </p>
            )}
          </div>

          {/* Estimated Total */}
          {estimatedTotal !== null && instrument.currentPrice && (
            <div>
              <label className="text-xs text-secondary-text uppercase tracking-wider">
                Estimated Total
              </label>
              <div className="text-xl font-bold text-primary">
                ≈{" "}
                {formatMoneyValue(
                  {
                    units: Math.floor(estimatedTotal),
                    nano: Math.floor((estimatedTotal % 1) * 1_000_000_000),
                    currency: instrument.currentPrice.currency,
                  },
                  { decimals: 2 }
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-error/10 border border-error rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-error text-sm">
                error
              </span>
              <p className="text-sm text-error flex-1">{error}</p>
            </div>
          )}

          {/* Account Info */}
          <div className="pt-2 border-t border-border/30">
            <div className="text-xs text-secondary-text">
              {selectedAccountIds.length > 0 ? (
                <>Account: {selectedAccountIds[0]}</>
              ) : (
                <>No account selected - Please configure in Settings</>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || quantity <= 0 || !selectedApiClientId || selectedAccountIds.length === 0}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-lg">
                  progress_activity
                </span>
                Executing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">check</span>
                Confirm Order
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
