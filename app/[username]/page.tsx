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
} from "@/components/ui/avatar";
import { Clock, Users, Instagram } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

interface AppointmentFormProps {
  userId: string;
  services: any[];
  teamMembers: any[];
  availability: any[];
}

const AppointmentFormLoader = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-muted rounded w-3/4 mb-4" />
    <div className="h-4 bg-muted rounded w-1/2 mb-6" />
    <div className="space-y-4">
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
    </div>
  </div>
);

const AppointmentForm = dynamic<AppointmentFormProps>(() =>
  import('./components/appointment-form').then(mod => mod.AppointmentForm), {
  loading: () => <AppointmentFormLoader />,
  ssr: false
});

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = createServerSupabaseClient();

  const { data: userData, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !userData) {
    notFound();
  }

  const [
    { data: services },
    { data: teamMembers },
    { data: availability }
  ] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("user_id", userData.id)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    supabase
      .from("team_members")
      .select("*")
      .eq("user_id", userData.id)
      .order("name", { ascending: true }),
    supabase
      .from("availability")
      .select("*")
      .eq("user_id", userData.id)
      .order("day_of_week", { ascending: true })
  ]);

  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const isOwner = currentUser?.id === userData.id;

  const safeServices = services || [];
  const safeTeamMembers = teamMembers || [];
  const safeAvailability = availability || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6">
          <div className="space-y-8">
            <Suspense fallback={<AppointmentFormLoader />}>
              <AppointmentForm
                userId={userData.id}
                services={safeServices}
                teamMembers={safeTeamMembers}
                availability={safeAvailability}
              />
            </Suspense>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Perfil a la izquierda */}
              <Card className="md:col-span-1">
                <CardHeader className="items-center">
                  <Avatar className="h-24 w-24 border-4 border-background mb-4">
                    {userData.profile_image_url ? (
                      <OptimizedImage
                        src={userData.profile_image_url}
                        alt={userData.full_name}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {userData.full_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <h1 className="text-2xl font-bold text-center">{userData.full_name}</h1>
                  <p className="text-muted-foreground text-center">@{userData.username}</p>
                </CardHeader>
                <CardContent>
                  {userData.profile_description && (
                    <CardDescription className="text-center lg:text-xl mb-4">
                      {userData.profile_description}
                    </CardDescription>
                  )}
                  {isOwner && (
                    <div className="flex justify-center">
                      <Button asChild>
                        <a href="/dashboard/settings">Editar perfil</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Servicios a la derecha */}
              {safeServices.length > 0 && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <CardTitle className="flex-1">Servicios</CardTitle>
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
                          <h3 className="font-bold">{service.name}</h3>
                          {service.description && (
                            <p className="text-md text-gray-500 mt-1">
                              {service.description}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">{service.duration} min</p>
                        </div>
                        {service.price && (
                          <div className="font-medium">${service.price.toFixed(2)}</div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Equipo (opcional) */}
            {safeTeamMembers.length > 0 && (
              <Card className="w-full">
                <CardHeader>
                  <div className="flex justify-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle>Equipo</CardTitle>
                  </div>
                  <div className="flex justify-center">
                    <CardDescription>Conoce a nuestro equipo</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {safeTeamMembers.map((member) => (
                    <div key={member.id} className="flex flex-col items-center text-center">
                      <Avatar className="h-32 w-32 mb-2 border-2 border-black">
                        {member.image_url ? (
                          <OptimizedImage
                            src={member.image_url}
                            alt={member.name}
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback className="text-4xl">
                            {member.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <h3 className="font-medium">{member.name}</h3>
                      {member.role && (
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      )}
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
        </div>
      </main>
    </div>
  );
}
  