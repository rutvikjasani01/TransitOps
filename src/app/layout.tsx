import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TransitStateProvider } from "@/contexts/TransitStateContext";
import { ToastProvider } from "@/contexts/ToastContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NAVIX – Smart Fleet Management Platform",
  description: "Modern, professional fleet management and transport logistics dashboard for fleet managers, dispatchers, safety officers, and financial analysts.",
  keywords: "fleet management, dispatch, safety score, fuel log, expense management, transport software, NAVIX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen text-foreground transition-colors duration-300`}
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
