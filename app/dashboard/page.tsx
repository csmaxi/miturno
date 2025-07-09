import { Suspense } from "react";
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

// Componente de carga para las estadísticas
const StatsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Componente de carga para los turnos pendientes
const AppointmentsSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="h-6 w-48 bg-muted animate-pulse rounded mb-2" />
      <div className="h-4 w-64 bg-muted animate-pulse rounded" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between border-b pb-4">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
            <div className="text-right space-y-2">
              <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Componente para las estadísticas
const StatsSection = async ({ userId }: { userId: string }) => {
  const supabase = createServerSupabaseClient();
  const [
    { data: servicesCount },
    { data: teamCount },
    { data: appointmentsCount }
  ] = await Promise.all([
    supabase.from("services").select("id", { count: "exact" }).eq("user_id", userId),
    supabase.from("team_members").select("id", { count: "exact" }).eq("user_id", userId),
    supabase.from("appointments").select("id", { count: "exact" }).eq("user_id", userId)
  ]);

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
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
  );
};

// Componente para los turnos pendientes
const PendingAppointments = async ({ userId }: { userId: string }) => {
  const supabase = createServerSupabaseClient();
  const { data: pendingAppointments } = await supabase
    .from("appointments")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .order("appointment_date", { ascending: true })
    .limit(5);

  return (
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
  );
};

export default async function Dashboard() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirigir a login si no hay usuario autenticado
  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        {/* <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1> */}
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/${userData?.username}`} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver mi página
          </Link>
        </Button>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection userId={user.id} />
      </Suspense>

      <Suspense fallback={<AppointmentsSkeleton />}>
        <PendingAppointments userId={user.id} />
      </Suspense>
    </div>
  );
}