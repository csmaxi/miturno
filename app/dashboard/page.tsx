import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Clock, ExternalLink, Users } from "lucide-react";

// Definir interfaces para tipado (opcional)
interface UserData {
  id: string;
  username: string;
  email?: string;
  full_name?: string;
  // Agrega otros campos según tu tabla "users"
}

interface Appointment {
  id: string;
  client_name: string;
  client_email: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

export default async function Dashboard() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirigir a login si no hay usuario autenticado
  if (!user) {
    redirect("/auth/login");
  }

  // Obtener todos los datos en paralelo
  const [
    { data: userData },
    { data: servicesCount },
    { data: teamCount },
    { data: appointmentsCount },
    { data: pendingAppointments }
  ] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).single(),
    supabase.from("services").select("id", { count: "exact" }).eq("user_id", user.id),
    supabase.from("team_members").select("id", { count: "exact" }).eq("user_id", user.id),
    supabase.from("appointments").select("id", { count: "exact" }).eq("user_id", user.id),
    supabase.from("appointments")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("appointment_date", { ascending: true })
      .limit(5)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href={`/${userData?.username}`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver mi página
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicesCount?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Servicios configurados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamCount?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Miembros del equipo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnos</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsCount?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Turnos reservados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos turnos</CardTitle>
          <CardDescription>Turnos pendientes de confirmación</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingAppointments && pendingAppointments.length > 0 ? (
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{appointment.client_name}</p>
                    <p className="text-sm text-muted-foreground">{appointment.client_email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full dark:bg-yellow-800 dark:text-yellow-100">
                        Pendiente
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{new Date(appointment.appointment_date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.start_time.substring(0, 5)} - {appointment.end_time.substring(0, 5)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No hay turnos pendientes</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}