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

const accentColorClasses = {
  primary: "border-primary",
  success: "border-success",
  coral: "border-coral",
};

export function StatCard({
  title,
  value,
  change,
  subtitle,
  icon,
  accentColor = "primary",
}: StatCardProps) {
  return (
    <div
      className={`bg-card rounded-lg p-2 sm:p-4 border-l-4 ${accentColorClasses[accentColor]} hover:border-coral transition-colors duration-300 shadow-sm border border-border`}
    >
      <div className="flex justify-between items-start mb-0.5 sm:mb-1">
        <div className="flex-1">
          <h3 className="text-[10px] sm:text-sm text-text-secondary uppercase tracking-wider">
            {title}
          </h3>
          <p className="text-lg sm:text-3xl font-semibold text-text-primary mt-0.5 sm:mt-1">
            {value}
            {change && (
              <span
                className={`text-xs sm:text-base font-medium ml-1 sm:ml-2 ${
                  change.isPositive ? "text-success" : "text-error"
                }`}
              >
                ({change.isPositive ? "+" : ""}
                {change.value})
              </span>
            )}
          </p>
          {subtitle && (
            <p className="text-[10px] sm:text-sm text-text-secondary mt-0.5 sm:mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <span
            className={`material-symbols-outlined text-sm sm:text-3xl ${
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
