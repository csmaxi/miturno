"use client";


import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col">
      
        <main className="flex-1">
          {children}
        </main>
       
        <Toaster />
      </div>
    </ThemeProvider>
  );
} 