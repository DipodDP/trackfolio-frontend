"use client";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    isPositive: boolean;
  };
  subtitle?: string;
  icon?: string;
  accentColor?: "primary" | "success" | "coral";
}

export function StatCard({
  title,
  value,
  change,
  subtitle,
  icon,
  accentColor = "primary",
}: StatCardProps) {
  return (
    <div className="bg-card rounded-lg p-4 sm:p-5 border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-text-primary">
              {value}
            </span>
            {change && (
              <span
                className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                  change.isPositive
                    ? "bg-success/10 text-success"
                    : "bg-error/10 text-error"
                }`}
              >
                {change.isPositive ? "▲" : "▼"} {change.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-base font-medium text-text-secondary mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <span
            className={`material-symbols-outlined text-3xl ${
              change?.isPositive ? "text-success" : "text-text-secondary"
            }`}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

export default StatCard;
