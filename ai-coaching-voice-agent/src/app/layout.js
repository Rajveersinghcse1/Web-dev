import { Inter, Poppins } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import Provider from "./provider";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AchievementToastContainer } from "@/components/AchievementToast";
import CommandPalette from "@/components/CommandPalette";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineIndicator from "@/components/OfflineIndicator";
import { SkipLink } from "@/lib/accessibilityUtils";
import "./globals.css";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"]
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#9333ea" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
};

export const metadata = {
  title: "Brane Storm - AI Learning & Coaching Platform",
  description: "Your personal AI coaching platform for interviews, lectures, language learning, and meditation",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AI Coach",
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.className} antialiased`}>
        <SkipLink targetId="main-content" />
        <ThemeProvider>
          <StackProvider app={stackClientApp}>
            <StackTheme>
              <Provider>
                <OfflineIndicator />
                {children}
                <Toaster />
                <AchievementToastContainer />
                <CommandPalette />
                <InstallPrompt />
                <PerformanceMonitor 
                  enabled={process.env.NODE_ENV === 'development'} 
                  position="bottom-right" 
                />
              </Provider>
            </StackTheme>
          </StackProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
