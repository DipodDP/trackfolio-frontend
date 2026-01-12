"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearTokens } from "@/lib/api-client";
import apiClient from "@/lib/api-client";
import { Button } from "@/components/ui";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/positions", label: "Assets" },
  { href: "/analysis", label: "Analysis" },
  { href: "/settings", label: "Settings" },
];

interface HeaderProps {
  isSandbox?: boolean;
  onToggleSandbox?: () => void;
  userName?: string;
}

export function Header({ isSandbox = false, onToggleSandbox, userName = "A" }: HeaderProps) {
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
    <header className="header">
      <nav className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="font-display text-2xl tracking-brand text-primary-text hover:text-primary transition-colors"
            >
              TRACKFOLIO
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors duration-fast ${
                    isActive
                      ? "text-primary-text"
                      : "text-secondary-text hover:text-primary-text"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Sandbox Toggle */}
            {onToggleSandbox && (
              <button
                onClick={onToggleSandbox}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isSandbox
                    ? "bg-warning/20 text-warning border border-warning/30"
                    : "bg-success/20 text-success border border-success/30"
                }`}
                title={isSandbox ? "Switch to Live Mode" : "Switch to Sandbox Mode"}
              >
                <span className="material-symbols-outlined text-base">
                  {isSandbox ? "science" : "verified"}
                </span>
                <span className="hidden sm:inline">{isSandbox ? "Sandbox" : "Live"}</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden btn-icon"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            {/* Add Asset button */}
            <Link href="/trading/search">
              <Button size="sm" className="hidden sm:flex">
                Add Asset
              </Button>
            </Link>

            {/* User Avatar & Logout */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-border-dark flex items-center justify-center text-primary-text font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1 text-secondary-text hover:text-primary-text transition-colors text-sm"
                title="Logout"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
