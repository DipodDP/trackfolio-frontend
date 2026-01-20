"use client";

import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import QueryClient and QueryClientProvider
import React, { useState } from 'react'; // Import useState

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient()); // Instantiate QueryClient

  return (
    <html lang="en" className="dark">
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
        <QueryClientProvider client={queryClient}> {/* Wrap children with QueryClientProvider */}
          {children}
        </QueryClientProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="dark"
        />
      </body>
    </html>
  );
}
