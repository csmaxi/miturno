import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Calendar, Clock, Users, Instagram } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AppointmentForm } from "./components/appointment-form";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  // Await params to resolve the dynamic route parameters
  const { username } = await params;

  // Crear el cliente de Supabase
  const supabase = createServerSupabaseClient();

  // Obtener datos del usuario por username
  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  // Si no se encuentra el usuario o ocurre un error, mostrar 404
  if (error || !userData) {
    notFound();
  }

  // Obtener servicios del usuario
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("user_id", userData.id)
    .eq("is_active", true)
    .order("name", { ascending: true });

  // Obtener miembros del equipo
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("*")
    .eq("user_id", userData.id)
    .order("name", { ascending: true });

  // Obtener disponibilidad
  const { data: availability } = await supabase
    .from("availability")
    .select("*")
    .eq("user_id", userData.id)
    .order("day_of_week", { ascending: true });

  // Obtener usuario autenticado de forma segura
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const isOwner = currentUser?.id === userData.id;

  // Asegurarse de que los datos estén definidos antes de pasarlos
  const safeServices = services || [];
  const safeTeamMembers = teamMembers || [];
  const safeAvailability = availability || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={currentUser} />
      <main className="flex-1">
        <div className="relative">
          <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/40 w-full">
            {userData.banner_image_url && (
              <img
                src={userData.banner_image_url || "/placeholder.svg"}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="container px-4 md:px-6">
            <div className="relative -mt-12 flex flex-col items-center">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={userData.profile_image_url || ""} alt={userData.full_name} />
                <AvatarFallback className="text-2xl">{userData.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h1 className="mt-4 text-2xl font-bold">{userData.full_name}</h1>
              <p className="text-muted-foreground">@{userData.username}</p>
              {userData.profile_description && (
                <p className="mt-4 max-w-2xl text-center text-muted-foreground">{userData.profile_description}</p>
              )}
              {isOwner && (
                <Button className="mt-4" asChild>
                  <a href="/dashboard/settings">Editar perfil</a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="container px-4 py-12 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-8">
              {safeServices.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <CardTitle>Servicios</CardTitle>
                    </div>
                    <CardDescription>Servicios disponibles para reservar</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {safeServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
                          )}
                          <p className="text-sm mt-1">Duración: {service.duration} minutos</p>
                        </div>
                        {service.price && <div className="font-medium">${service.price.toFixed(2)}</div>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {safeTeamMembers.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <CardTitle>Equipo</CardTitle>
                    </div>
                    <CardDescription>Conoce a nuestro equipo</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-3">
                    {safeTeamMembers.map((member) => (
                      <div key={member.id} className="flex flex-col items-center text-center">
                        <Avatar className="h-16 w-16 mb-2">
                          <AvatarImage src={member.image_url || ""} alt={member.name} />
                          <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium">{member.name}</h3>
                        {member.position && <p className="text-sm text-muted-foreground">{member.position}</p>}
                        {member.bio && (
                          <div className="flex items-center mt-1">
                            <Instagram className="h-3 w-3 mr-1 text-pink-500" />
                            <a
                              href={`https://instagram.com/${member.bio.replace("@", "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-pink-500 hover:underline"
                            >
                              {member.bio}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle>Reservar turno</CardTitle>
                  </div>
                  <CardDescription>Completa el formulario para reservar un turno</CardDescription>
                </CardHeader>
                <CardContent>
                  <AppointmentForm
                    userId={userData.id}
                    services={safeServices}
                    teamMembers={safeTeamMembers}
                    availability={safeAvailability}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}