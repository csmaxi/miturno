import type React from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "./components/dashboard-nav";
import { Navbar } from "@/components/navbar";

// Definir interfaz para tipado de userData
interface UserData {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  // Agrega otros campos según tu tabla "users"
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirigir a login si no hay usuario autenticado
  if (!user) {
    redirect("/auth/login");
  }

  // Obtener datos del usuario
  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single() as { data: UserData | null; error: any };

  // Manejar errores o falta de datos
  if (error || !userData) {
    redirect("/dashboard/complete-profile");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <div className="flex flex-1 flex-col md:flex-row">
        <DashboardNav user={userData} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}