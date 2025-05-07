import React from "react";
import { CookiesProvider } from "next-client-cookies/server";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XU SMIS - Scholarship Management",
  description: "This is your easy-to-use scholarship management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <CookiesProvider>
          {children}
        </CookiesProvider>
      </body>
    </html>
  );
}
