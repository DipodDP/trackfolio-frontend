"use client";

interface ProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "coral" | "success" | "error" | "primary";
  className?: string;
}

const sizeClasses = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

const colorClasses = {
  coral: "bg-coral",
  success: "bg-success",
  error: "bg-error",
  primary: "bg-primary",
};

export function Progress({
  value,
  max = 100,
  showLabel = false,
  size = "md",
  color = "coral",
  className = "",
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`progress ${sizeClasses[size]} flex-1`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={`progress-bar ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-secondary min-w-[3ch] text-right">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

export default Progress;
