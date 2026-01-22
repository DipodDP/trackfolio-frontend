"use client";

import Link from "next/link";
import { Badge } from "@/components/ui";

export interface Recommendation {
  action: "BUY" | "SELL";
  ticker: string;
  quantity: number;
  reason: string;
  type: "rebalance" | "target" | "risk";
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onClick?: () => void;
}

export function RecommendationCard({ recommendation, onClick }: RecommendationCardProps) {
  const { action, ticker, quantity, reason, type } = recommendation;
  const isBuy = action === "BUY";

  return (
    <div
      className="p-4 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors cursor-pointer shadow-sm"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
            isBuy
              ? "bg-success/10 text-success border border-success/20"
              : "bg-error/10 text-error border border-error/20"
          }`}
        >
          {action}
        </span>
        <span className="text-lg font-bold text-text-primary">
          {ticker}
        </span>
      </div>
      <p className="text-xs ttext-ext-secondary">
        <span className="font-semibold text-text-primary">
          Qty: {isBuy ? "+" : ""}
          {quantity}
        </span>
        <br />
        {reason}
      </p>
    </div>
  );
}

interface RecommendationsGridProps {
  recommendations: Recommendation[];
  onRecommendationClick?: (recommendation: Recommendation) => void;
}

export function RecommendationsGrid({
  recommendations,
  onRecommendationClick,
}: RecommendationsGridProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <span className="material-symbols-outlined text-3xl mb-2 block">
          check_circle
        </span>
        <p>Portfolio is balanced</p>
        <p className="text-sm mt-1">No rebalancing actions needed</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {recommendations.map((rec, index) => (
                  <RecommendationCard
                    key={index}
                    recommendation={rec}
                    onClick={() => onRecommendationClick?.(rec)}
                    className="h-full" // Add h-full here
                  />      ))}
    </div>
  );
}

export default RecommendationCard;
