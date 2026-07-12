import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TransitStateProvider } from "@/contexts/TransitStateContext";
import { ToastProvider } from "@/contexts/ToastContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TransitOps – Smart Transport Operations Platform",
  description: "Modern, professional logistics and transport management system dashboard for fleet managers, dispatchers, safety officers, and financial analysts.",
  keywords: "logistics, fleet management, dispatch, safety score, fuel log, expense management, transport software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-foreground transition-colors duration-300`}
      >
        <ThemeProvider>
          <TransitStateProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </TransitStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
