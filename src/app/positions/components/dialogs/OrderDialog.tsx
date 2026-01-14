"use client";

import { TablePosition } from "@/types/position";
import {
  OrderDialog as SharedOrderDialog,
  OrderInstrumentData,
} from "@/components/trading/OrderDialog";

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position: TablePosition;
  orderType: "BUY" | "SELL";
  recommendedLots: number;
  onSuccess?: () => void;
}

/**
 * Position-specific wrapper for the shared OrderDialog
 * Converts TablePosition to OrderInstrumentData format
 */
export function OrderDialog({
  open,
  onOpenChange,
  position,
  orderType,
  recommendedLots,
  onSuccess,
}: OrderDialogProps) {
  // Convert TablePosition to OrderInstrumentData
  const instrumentData: OrderInstrumentData = {
    figi: position.figi,
    ticker: position.ticker,
    name: position.name,
    currentPrice: position.current_price,
    currency: position.current_price.currency,
  };

  return (
    <SharedOrderDialog
      open={open}
      onOpenChange={onOpenChange}
      instrument={instrumentData}
      orderType={orderType}
      recommendedLots={recommendedLots}
      onSuccess={onSuccess}
    />
  );
}
