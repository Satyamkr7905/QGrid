import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Q-Grid Shield | Smart Grid Management Dashboard",
  description: "AI & Quantum powered smart grid management dashboard with real-time monitoring, theft detection, transformer health prediction, and sustainability analytics.",
  keywords: ["smart grid", "energy management", "quantum computing", "AI analytics", "sustainability"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <TooltipProvider>
            <div className="flex h-screen overflow-hidden bg-background">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto bg-grid-pattern">
                  <div className="p-4 lg:p-6">
                    {children}
                  </div>
                </main>
              </div>
            </div>
            <Toaster
              position="bottom-right"
              richColors
              closeButton
              toastOptions={{
                className: "glass-card",
              }}
            />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
