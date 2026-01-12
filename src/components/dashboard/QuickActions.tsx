"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

interface QuickAction {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "outline";
}

interface QuickActionsProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  { href: "/trading/search", label: "Search Instruments", variant: "secondary" },
  { href: "/settings/api-clients", label: "Add Funds", variant: "outline" },
  { href: "/analysis", label: "Full Analysis", variant: "outline" },
];

export function QuickActions({ actions = defaultActions }: QuickActionsProps) {
  return (
    <div className="space-y-3">
      {actions.map((action, index) => (
        <Link key={index} href={action.href} className="block">
          <Button
            variant={action.variant || "outline"}
            className="w-full justify-center"
          >
            {action.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}

export default QuickActions;
