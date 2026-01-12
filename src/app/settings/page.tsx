"use client";

import AuthGuard from "@/components/AuthGuard";
import { Header, CosmicBackground } from "@/components/layout";
import Link from "next/link";

const settingsSections = [
  {
    title: "API Clients",
    description: "Manage broker connections and API tokens",
    href: "/settings/api-clients",
    icon: "link",
  },
  {
    title: "Risk Profile",
    description: "Configure your portfolio structure and risk tolerance",
    href: "/settings/risk-profile",
    icon: "shield",
  },
  {
    title: "Position Targets",
    description: "Set profit targets and stop-loss levels for positions",
    href: "/settings/position-targets",
    icon: "target",
  },
  {
    title: "Account Settings",
    description: "Manage your account and profile information",
    href: "/settings/account",
    icon: "account_circle",
  },
];

export default function SettingsPage() {
  return (
    <AuthGuard>
      <CosmicBackground />
      <div className="grain-overlay" />

      <div className="relative min-h-screen">
        <Header />
        <main className="container-app py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-display text-primary tracking-wider mb-2">
                SETTINGS
              </h1>
              <p className="text-secondary-text">Manage your Trackfolio preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settingsSections.map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="card hover:border-coral transition-colors cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">
                      {section.icon}
                    </span>
                    <div className="flex-1">
                      <h2 className="text-xl font-display text-primary-text mb-2">
                        {section.title}
                      </h2>
                      <p className="text-secondary-text text-sm">
                        {section.description}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-secondary-text group-hover:text-coral transition-colors">
                      chevron_right
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
