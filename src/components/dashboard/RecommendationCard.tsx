"use client";

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
      className="p-4 rounded-lg border border-border bg-card min-h-[120px] flex flex-col justify-between cursor-pointer hover:border-coral transition-colors shadow-sm"
      onClick={onClick}
    >
      <Badge variant={isBuy ? "success" : "error"}>{action}</Badge>
      <div>
        <p className="text-lg font-bold mt-2 text-text-primary">{ticker}</p>
        <p className="text-xs text-text-secondary mt-1 mb-1.5">
          <span className="font-semibold text-text-primary">
            Qty: {isBuy ? "+" : "-"}
            {Math.abs(quantity)}
          </span>
          <br />
          {reason}
        </p>
      </div>
      <Badge variant="coral">
        {type === "rebalance"
          ? "Rebalance"
          : type === "target"
          ? "Target"
          : "Risk"}
      </Badge>
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
        />
      ))}
    </div>
  );
}

export default RecommendationCard;
