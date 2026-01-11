"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearTokens } from "@/lib/api-client";
import apiClient from "@/lib/api-client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/positions", label: "Positions", icon: "inventory_2" },
  { href: "/trading/search", label: "Trading", icon: "candlestick_chart" },
  { href: "/analysis", label: "Analysis", icon: "analytics" },
  { href: "/operations", label: "History", icon: "history" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiClient.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearTokens();
      router.push("/login");
    }
  };

  return (
    <nav className="bg-card-dark border-b border-border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-2xl font-display text-primary tracking-wider">
              TRACKFOLIO
            </Link>
            <div className="hidden md:flex gap-4">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
                      isActive
                        ? "bg-primary text-primary-text"
                        : "text-secondary-text hover:text-primary-text hover:bg-background-dark"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-secondary-text hover:text-primary-text transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
