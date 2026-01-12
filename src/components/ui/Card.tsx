"use client";

import { type HTMLAttributes } from "react";

type CardVariant = "default" | "accent" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  accentColor?: "primary" | "success" | "coral" | "warning" | "error";
}

const variantClasses: Record<CardVariant, string> = {
  default: "card",
  accent: "card-accent",
  interactive: "card-interactive",
};

const accentColorClasses: Record<string, string> = {
  primary: "border-primary",
  success: "border-success",
  coral: "border-coral",
  warning: "border-warning",
  error: "border-error",
};

export function Card({
  variant = "default",
  accentColor,
  children,
  className = "",
  ...props
}: CardProps) {
  const accentClass = accentColor ? accentColorClasses[accentColor] : "";

  return (
    <div
      className={`${variantClasses[variant]} ${accentClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
