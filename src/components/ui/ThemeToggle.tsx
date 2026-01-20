"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by showing placeholder until mounted
  if (!mounted) {
    return (
      <div
        className={`w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 ${className || ""}`}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`btn-icon ${className || ""}`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span className="material-symbols-outlined">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
