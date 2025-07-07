"use client"

import { useState, useEffect } from "react";
import { createClientSupabaseClient } from "@/lib/supabase/client";
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
import { Clock, Users, Instagram, ArrowLeft, Phone, MessageCircle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

import { OptimizedImage } from "@/components/ui/optimized-image";
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Definir la interfaz para las props del AppointmentForm
interface AppointmentFormProps {
  userId: string;
  services: any[];
  teamMembers: any[];
  availability: any[];
}

// Componente de carga para el formulario
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

// Cargar el formulario de manera lazy con tipos correctos
const AppointmentForm = dynamic<AppointmentFormProps>(() =>
  import('./components/appointment-form').then(mod => mod.AppointmentForm), {
  loading: () => <AppointmentFormLoader />,
  ssr: false
});

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const [userData, setUserData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { username } = await params;
        const supabase = createClientSupabaseClient();

        // Obtener datos del usuario por username
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        if (userError || !user) {
          setError(true);
          return;
        }

        setUserData(user);

        // Obtener todos los datos en paralelo
        const [
          { data: servicesData },
          { data: teamMembersData },
          { data: availabilityData }
        ] = await Promise.all([
          supabase
            .from("services")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("created_at", { ascending: true }),
          supabase
            .from("team_members")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true }),
          supabase
            .from("availability")
            .select("*")
            .eq("user_id", user.id)
            .order("day_of_week", { ascending: true })
        ]);

        setServices(servicesData || []);
        setTeamMembers(teamMembersData || []);
        setAvailability(availabilityData || []);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };

    loadData();
  }, [params]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </main>
      </div>
    );
  }

  if (error || !userData) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
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
                <div>
                  <h1 className="text-2xl font-bold">{userData.full_name}</h1>
                  <p className="text-muted-foreground">@{userData.username}</p>
                  {userData.profile_description && (
                    <p className="text-sm text-muted-foreground mt-1">{userData.profile_description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Services Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Selecciona un Servicio</CardTitle>
                  <CardDescription>Elige el servicio que deseas reservar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md border-border hover:border-primary/50"
                        onClick={() => {
                          // This will be handled by the client component
                          window.dispatchEvent(new CustomEvent('serviceSelected', { 
                            detail: { service } 
                          }))
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-primary" />
                            <div>
                              <h3 className="font-medium">{service.name}</h3>
                              {service.description && (
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {service.duration} min
                            </div>
                            {service.price && <p className="font-medium">${service.price.toLocaleString()}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userData.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{userData.phone}</span>
                    </div>
                  )}
                  {userData.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => window.open(`https://wa.me/${userData.phone?.replace(/\D/g, "")}`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contactar por WhatsApp
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Team Members */}
              {teamMembers.length > 0 && (
                <Card>
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
                    {teamMembers.map((member) => (
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

            {/* Booking Form */}
            <div>
              <Suspense fallback={<AppointmentFormLoader />}>
                <AppointmentForm
                  userId={userData.id}
                  services={services}
                  teamMembers={teamMembers}
                  availability={availability}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
  