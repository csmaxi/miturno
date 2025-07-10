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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, Users, Instagram, ArrowLeft, Phone, MessageCircle, Calendar } from "lucide-react";
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
  selectedService?: any;
  onClose?: () => void;
}

// Componente de carga para el formulario
const AppointmentFormLoader = () => (
  <div className="space-y-6">
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-muted/50 rounded-lg w-2/3" />
      <div className="h-4 bg-muted/50 rounded-lg w-1/2" />
    </div>
    <div className="space-y-4">
      <div className="h-12 bg-muted/50 rounded-lg" />
      <div className="h-12 bg-muted/50 rounded-lg" />
      <div className="h-12 bg-muted/50 rounded-lg" />
      <div className="h-12 bg-muted/50 rounded-lg" />
    </div>
    <div className="pt-4">
      <div className="h-12 bg-primary/20 rounded-lg animate-pulse" />
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

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
      <main className="flex-1 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        {/* Header */}
        <header className="relative bg-gradient-to-br from-background via-background/95 to-muted/30 backdrop-blur-sm border-b mt-12">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700/25" />
          
          <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-20">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Avatar Section */}
              <div className="relative">
                <div className="relative">
                  <Avatar className="h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 ring-4 ring-background shadow-2xl">
                    {userData.profile_image_url ? (
                      <OptimizedImage
                        src={userData.profile_image_url}
                        alt={userData.full_name}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="text-4xl sm:text-5xl lg:text-6xl font-semibold bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
                        {userData.full_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-background rounded-full shadow-lg">
                    <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="space-y-3 max-w-2xl">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                    {userData.full_name}
                  </h1>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    <p className="text-lg sm:text-xl text-muted-foreground font-medium">
                      @{userData.username}
                    </p>
                    <div className="w-1 h-1 bg-primary rounded-full" />
                  </div>
                </div>

                {userData.profile_description && (
                  <div className="mt-6">
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
                      {userData.profile_description}
                    </p>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="flex items-center justify-center gap-6 pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{services.length} servicios</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{teamMembers.length} equipo</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Disponible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 relative">
          <div className="grid gap-8 lg:grid-cols-1">
            {/* Services Selection */}
            <div className="space-y-8">
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/50">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Nuestros Servicios</CardTitle>
                      <CardDescription className="text-base">Descubre nuestra gama de servicios profesionales</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid gap-6">
                    {services.map((service, index) => (
                      <div
                        key={service.id}
                        className="group relative p-6 border rounded-xl cursor-pointer transition-all duration-300 hover:shadow-xl border-border hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent overflow-hidden"
                        onClick={() => {
                          setSelectedService(service);
                          setIsModalOpen(true);
                        }}
                      >
                        {/* Background pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              {/* Service Icon */}
                              <div className="relative mt-1">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                  <Calendar className="h-6 w-6 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background">
                                  <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                                </div>
                              </div>
                              
                              {/* Service Info */}
                              <div className="flex-1 space-y-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors">{service.name}</h3>
                                    <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                      Disponible
                                    </div>
                                  </div>
                                  {service.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                                  )}
                                </div>
                                
                                {/* Service Details */}
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{service.duration} min</span>
                                  </div>
                                  <div className="w-px h-4 bg-border" />
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>Profesional</span>
                                  </div>
                                  {service.price && (
                                    <>
                                      <div className="w-px h-4 bg-border" />
                                      <div className="flex items-center gap-1 text-primary font-semibold">
                                        <span className="text-xs">$</span>
                                        <span>{service.price.toLocaleString()}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Button */}
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                {service.price && (
                                  <div className="bg-primary/10 px-3 py-1 rounded-full">
                                    <p className="font-bold text-primary text-sm">${service.price.toLocaleString()}</p>
                                  </div>
                                )}
                              </div>
                              <Button
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary hover:bg-primary/90"
                              >
                                Reservar
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                    ))}
                  </div>
                  
                  {/* Empty state */}
                  {services.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No hay servicios disponibles</h3>
                      <p className="text-sm text-muted-foreground">
                        Por favor, contacta al profesional para más información
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Modal para el formulario de reserva */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Reservar Cita</DialogTitle>
                  <DialogDescription>
                    Completa el formulario para agendar tu cita
                  </DialogDescription>
                </DialogHeader>
                <Suspense fallback={<AppointmentFormLoader />}>
                  <AppointmentForm
                    userId={userData?.id}
                    services={services}
                    teamMembers={teamMembers}
                    availability={availability}
                    selectedService={selectedService}
                    onClose={() => setIsModalOpen(false)}
                  />
                </Suspense>
              </DialogContent>
            </Dialog>
          </div>

          {/* Team Members - Full Width */}
          {teamMembers.length > 0 && (
            <div className="mt-12">
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/50">
                <CardHeader className="bg-gradient-to-r from-purple-500/5 to-purple-500/10 border-b">
                  <div className="flex gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Equipo</CardTitle>
                      <CardDescription className="text-base">Conoce a nuestro equipo</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 justify-items-center">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="group relative flex flex-col items-center text-center p-8 sm:p-6 md:p-4 lg:p-6 rounded-xl border border-border hover:border-purple-500/30 hover:bg-gradient-to-br hover:from-purple-500/5 hover:to-transparent transition-all duration-300 w-full max-w-md">
                        <div className="relative mb-4">
                          <Avatar className="h-40 w-40 sm:h-44 sm:w-44 md:h-36 md:w-36 lg:h-40 lg:w-40 ring-4 ring-background shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            {member.image_url ? (
                              <OptimizedImage
                                src={member.image_url}
                                alt={member.name}
                                className="object-cover"
                              />
                            ) : (
                              <AvatarFallback className="text-4xl sm:text-5xl md:text-3xl lg:text-4xl font-semibold bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                {member.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          {/* Status indicator */}
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-9 sm:h-9 md:w-7 md:h-7 lg:w-8 lg:h-8 bg-green-500 border-3 border-background rounded-full shadow-lg">
                            <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="font-semibold text-2xl sm:text-xl md:text-lg lg:text-xl group-hover:text-purple-600 transition-colors">{member.name}</h3>
                          {member.position && (
                            <p className="text-lg sm:text-base md:text-sm lg:text-base text-muted-foreground font-medium">{member.position}</p>
                          )}
                          {member.instagram && (
                            <div className="flex items-center justify-center mt-2">
                              <div className="p-1 bg-pink-500/10 rounded-full">
                                <Instagram className="h-3 w-3 text-pink-500" />
                              </div>
                              <a
                                href={`https://instagram.com/${member.instagram.replace("@", "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-pink-500 hover:text-pink-600 font-medium ml-2 transition-colors"
                              >
                                {member.instagram}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
  