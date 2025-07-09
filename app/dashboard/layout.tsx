import type React from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "./components/dashboard-nav";
import { MobileNav } from "./components/mobile-nav";
import { Navbar } from "@/components/navbar";

// Definir interfaz para tipado de userData
interface UserData {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  // Agrega otros campos según tu tabla "users"
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto px-4 flex flex-1 gap-4 lg:gap-8 xl:gap-12 pt-4">
        <aside className="hidden lg:flex w-48 xl:w-56 flex-col flex-shrink-0">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden min-w-0">
          <div className="flex items-center gap-4 mb-6 lg:hidden">
            <MobileNav />
            <h1 className="text-2xl font-bold">Dashboard</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}