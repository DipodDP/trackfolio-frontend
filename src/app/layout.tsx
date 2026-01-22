"use client";

import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { useTheme } from "next-themes";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});



// Themed Toaster Component
function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      theme={resolvedTheme as "light" | "dark"}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${bebasNeue.variable} ${manrope.variable} antialiased`}
      >
        <div className="grain-overlay" />
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
