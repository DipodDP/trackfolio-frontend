"use client";

type BadgeVariant = "success" | "error" | "warning" | "info" | "coral" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  withDot?: boolean;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "badge-success",
  error: "badge-error",
  warning: "badge-warning",
  info: "badge-info",
  coral: "badge-coral",
  neutral: "badge-neutral",
};

const dotColorClasses: Record<BadgeVariant, string> = {
  success: "bg-success",
  error: "bg-error",
  warning: "bg-warning",
  info: "bg-info",
  coral: "bg-coral",
  neutral: "bg-secondary-text",
};

export function Badge({
  variant = "neutral",
  children,
  withDot = false,
  className = "",
}: BadgeProps) {
  return (
    <span className={`${variantClasses[variant]} ${className}`}>
      {withDot && (
        <span className={`w-2 h-2 rounded-full ${dotColorClasses[variant]}`} />
      )}
      {children}
    </span>
  );
}

export default Badge;
