import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import AIChatWidget from "@/components/AIChatWidget";
import Navigation from "@/components/Navigation";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RailwayPrep - Master Railway Exams with AI",
  description: "Comprehensive exam preparation platform for Railway exams - ALP, NTPC, D Group, Sectional Controller, Technician. Powered by AI for adaptive learning.",
  keywords: ["Railway Exam", "ALP", "NTPC", "D Group", "RRB", "Exam Preparation", "Mock Test"],
  authors: [{ name: "RailwayPrep" }],
  openGraph: {
    title: "RailwayPrep - Master Railway Exams with AI",
    description: "AI-powered exam preparation platform for railway recruitment exams",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased bg-[var(--bg-primary)] min-h-screen`}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: 'white',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--danger)',
                secondary: 'white',
              },
            },
          }}
        />
        <Navigation />
        {children}
        <AIChatWidget />
      </body>
    </html>
  );
}
