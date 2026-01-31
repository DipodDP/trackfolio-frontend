"use client";

import { Card } from "@/components/ui";
import { StructureTable } from "@/components/portfolio/StructureTable";
import { type StructureAnalysis, type CurrencyCode } from "@/types/portfolio";
import { AllocationBar, AllocationLegend } from "./AllocationBar";
import { formatPercent } from "@/utils/formatters";

interface RiskBreakdownProps {
  analysis: StructureAnalysis;
  currencyCode: CurrencyCode;
  allocationSegments: {
    current: any[];
    target: any[];
  };
  legendItems: any[];
}

interface RiskStripeProps {
  highRiskWidth: number;
  lowRiskWidth: number;
}

function RiskStripe({ highRiskWidth, lowRiskWidth }: RiskStripeProps) {
  return (
    <div className="flex items-center space-x-4">
      <span className="w-32"></span>
      <div className="flex-1 flex flex-col">
        <div className="flex gap-[2px]">
          <div
            className="h-4 bg-primary/20 border-l border-r border-primary/30"
            style={{ width: `${highRiskWidth}%`, minWidth: '16px' }}
          ></div>
          <div
            className="h-4 bg-success/20 border-l border-r border-success/30"
            style={{ width: `${lowRiskWidth}%`, minWidth: '16px' }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export function RiskBreakdown({
  analysis,
  currencyCode,
  allocationSegments,
  legendItems,
}: RiskBreakdownProps) {
  if (!analysis) return null;

  const currentHighRiskWidth =
    (allocationSegments.current.find((s) => s.label === "Shares")?.value || 0) +
    (allocationSegments.current.find((s) => s.label === "ETFs")?.value || 0);
  const currentLowRiskWidth =
    (allocationSegments.current.find((s) => s.label === "Bonds")?.value || 0) +
    (allocationSegments.current.find((s) => s.label === "Gov Bonds")?.value || 0);

  const targetHighRiskWidth =
    (allocationSegments.target.find((s) => s.label === "Shares")?.value || 0) +
    (allocationSegments.target.find((s) => s.label === "ETFs")?.value || 0);
  const targetLowRiskWidth =
    (allocationSegments.target.find((s) => s.label === "Bonds")?.value || 0) +
    (allocationSegments.target.find((s) => s.label === "Gov Bonds")?.value || 0);

  return (
    <Card className="p-6 lg:h-[659px] flex flex-col">
      <h2 className="text-lg font-semibold text-text-primary mb-4">
        Risk Allocation
      </h2>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 mt-2">
          <div>
            <div className="flex items-center space-x-4 mb-0">
              <span className="w-32"></span>
              <div className="flex-1 flex flex-col">
                <div className="flex gap-[2px] mb-0">
                  <div
                    className="flex items-center justify-between p-2 px-3 bg-primary/10 border border-primary/30 rounded-t-lg min-w-0 flex-shrink"
                    style={{ width: `${currentHighRiskWidth}%` }}
                  >
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">High Risk</span>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="font-semibold text-text-primary text-sm whitespace-nowrap">
                        {formatPercent(analysis.current_high_risk.proportion_in_portfolio)}
                      </span>
                      {analysis.plan_high_risk && (
                        <span className="text-xs text-text-secondary whitespace-nowrap">
                          → {formatPercent(analysis.plan_high_risk.proportion_in_portfolio)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className="flex items-center justify-between p-2 px-3 bg-success/10 border border-success/30 rounded-t-lg min-w-fit flex-grow"
                    style={{ width: `${currentLowRiskWidth}%` }}
                  >
                    <span className="text-xs font-medium text-text-secondary uppercase tracking-wide whitespace-nowrap">Low Risk</span>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="font-semibold text-text-primary text-sm whitespace-nowrap">
                        {formatPercent(analysis.current_low_risk.proportion_in_portfolio)}
                      </span>
                      {analysis.plan_low_risk && (
                        <span className="text-xs text-text-secondary whitespace-nowrap">
                          → {formatPercent(analysis.plan_low_risk.proportion_in_portfolio)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <RiskStripe highRiskWidth={currentHighRiskWidth} lowRiskWidth={currentLowRiskWidth} />
            <AllocationBar
              label="Current Allocation"
              segments={allocationSegments.current}
            />
            <RiskStripe highRiskWidth={targetHighRiskWidth} lowRiskWidth={targetLowRiskWidth} />
            <AllocationBar
              label="Target Allocation"
              segments={allocationSegments.target}
            />
          </div>
          <AllocationLegend items={legendItems} />
        </div>

        <div className="mt-6">
          <StructureTable data={analysis} currencyCode={currencyCode} />
        </div>
      </div>
    </Card>
  );
}
