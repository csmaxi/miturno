"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";
import { Calendar, Clock, Share2, Users, Zap, Shield, Smartphone, Globe, CheckCircle, ArrowRight, Star, Sparkles, Target, TrendingUp } from "lucide-react";
import { Session } from '@supabase/supabase-js';
import { Navbar } from "@/components/navbar";
import { useUserContext } from "@/lib/context/UserContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Interfaces para tipado
interface UserData {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  banner_image_url?: string;
}

// Componente de características
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex flex-col items-center space-y-3 sm:space-y-4 text-center p-4 sm:p-6 rounded-lg border bg-card hover:shadow-lg transition-all duration-300 hover:scale-105">
    <div className="bg-primary/10 p-3 sm:p-4 rounded-full">
      {icon}
    </div>
    <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
    <p className="text-sm sm:text-base text-muted-foreground">{description}</p>
  </div>
);

// Componente principal
export default function Home() {
  const [username, setUsername] = useState("");
  const [stats, setStats] = useState({
    appointmentsToday: 0,
    activeServices: 0,
    pendingAppointments: 0,
    monthlyEarnings: 0
  });
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabaseClient(), []);
  const { user, loading: userLoading } = useUserContext();

  // Fetch real statistics when user is logged in
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user data from users table
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        
        setUserData(userData);
        
        // Get user's appointments
        const { data: appointments } = await supabase
          .from("appointments")
          .select("*")
          .eq("user_id", user.id);

        // Get user's services
        const { data: services } = await supabase
          .from("services")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true);

        // Calculate statistics
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const appointmentsToday = appointments?.filter((apt: any) => 
          apt.date === todayStr
        ).length || 0;

        const pendingAppointments = appointments?.filter((apt: any) => 
          apt.status === 'pending' || apt.status === 'confirmed'
        ).length || 0;

        const activeServices = services?.length || 0;

        // Calculate monthly earnings (sum of all completed appointments)
        const monthlyEarnings = appointments?.filter((apt: any) => 
          apt.status === 'completed' && 
          new Date(apt.date).getMonth() === today.getMonth()
        ).reduce((sum: number, apt: any) => sum + (apt.price || 0), 0) || 0;

        setStats({
          appointmentsToday,
          activeServices,
          pendingAppointments,
          monthlyEarnings
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && !userLoading) {
      fetchStats();
    }
  }, [user, userLoading, supabase]);

  // Validación del nombre de usuario (solo minúsculas, alfanuméricos, 3-20 caracteres)
  const isValidUsername = useCallback((username: string) => {
    const regex = /^[a-z0-9]{3,20}$/;
    return regex.test(username);
  }, []);

  const handleUsernameSubmit = useCallback(async () => {
    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername) {
      alert("El nombre de usuario no puede estar vacío.");
      return;
    }

    if (!isValidUsername(trimmedUsername)) {
      alert("El nombre de usuario debe tener entre 3 y 20 caracteres y solo puede contener letras minúsculas y números.");
      return;
    }

    try {
      const { data: existingUser, error } = await supabase
        .from("users")
        .select("username")
        .eq("username", trimmedUsername)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking username:", error);
        alert("Error al verificar el nombre de usuario. Intenta de nuevo.");
        return;
      }

      if (existingUser) {
        alert("El nombre de usuario ya está en uso.");
        return;
      }

      localStorage.setItem("preferredUsername", trimmedUsername);
      router.push("/auth/register");
    } catch (error) {
      console.error("Error in handleUsernameSubmit:", error);
      alert("Error al procesar el nombre de usuario. Intenta de nuevo.");
    }
  }, [username, isValidUsername, supabase, router]);

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value.toLowerCase());
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleUsernameSubmit();
    }
  }, [handleUsernameSubmit]);

  // Beneficios de la plataforma
  const benefits = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Configuración Rápida",
      description: "Crea tu perfil en menos de 2 minutos y comienza a recibir reservas"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "100% Gratis",
      description: "Sin costos ocultos, sin comisiones. Tu negocio, tus ganancias"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Optimizado para Móviles",
      description: "Funciona perfectamente en cualquier dispositivo"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "URL Personalizada",
      description: "Tu propia página web profesional con tu nombre"
    }
  ];

  // Casos de uso
  const useCases = [
    {
      title: "Peluquerías y Salones",
      description: "Gestiona citas para cortes, coloración y tratamientos",
      icon: "💇‍♀️"
    },
    {
      title: "Consultorios Médicos",
      description: "Organiza turnos para consultas y tratamientos",
      icon: "👨‍⚕️"
    },
    {
      title: "Servicios de Masajes",
      description: "Agenda sesiones de relajación y terapéuticas",
      icon: "💆‍♀️"
    },
    {
      title: "Tutores y Clases",
      description: "Coordina sesiones de enseñanza y mentoring",
      icon: "📚"
    },
    {
      title: "Servicios Técnicos",
      description: "Organiza visitas para reparaciones y mantenimiento",
      icon: "🔧"
    },
    {
      title: "Eventos y Talleres",
      description: "Gestiona inscripciones para actividades especiales",
      icon: "🎉"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {user ? (
        <section className="min-h-[calc(100vh-4rem)] py-8 sm:py-12 -mt-16 md:-mt-20">
          <div className="container px-4 md:px-6">
            {/* Header */}
            <div className="text-center mb-8 relative">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-2xl" />
              <div className="absolute top-0 left-1/4 w-16 h-16 bg-primary/10 rounded-full blur-lg" />
              <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-primary/5 rounded-full blur-lg" />
              
              <div className="relative z-10 py-8 px-6">
                {/* Welcome badge */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                    @{userData?.username || user.email?.split('@')[0] || 'usuario'}
                  </span>
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                
                {/* Main title with gradient */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
                  ¡Hola,{" "}
                  <span className="text-primary">
                    {user.user_metadata?.full_name || user.email || "Usuario"}
                  </span>
                  !
                </h1>
                
                {/* Subtitle with better styling */}
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Aquí tienes un{" "}
                  <span className="text-primary font-semibold">resumen completo</span>{" "}
                  de tu actividad y próximas acciones
                </p>
                
                {/* Decorative elements */}
                <div className="flex items-center justify-center gap-3 mt-6">
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  <div className="w-1.5 h-1.5 bg-primary/60 rounded-full" />
                  <div className="w-1 h-1 bg-primary rounded-full" />
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {loading ? (
                      <div className="animate-pulse bg-blue-600/20 h-8 w-12 rounded"></div>
                    ) : (
                      stats.appointmentsToday
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Citas Hoy</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {loading ? (
                      <div className="animate-pulse bg-green-600/20 h-8 w-12 rounded"></div>
                    ) : (
                      stats.activeServices
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Servicios Activos</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {loading ? (
                      <div className="animate-pulse bg-purple-600/20 h-8 w-12 rounded"></div>
                    ) : (
                      stats.pendingAppointments
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Reservas Pendientes</div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500/10 to-orange-500/5">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {loading ? (
                      <div className="animate-pulse bg-orange-600/20 h-8 w-12 rounded"></div>
                    ) : (
                      `$${stats.monthlyEarnings.toLocaleString()}`
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Ganancia del Mes</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Quick Actions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Acciones Rápidas
                  </CardTitle>
                  <CardDescription>
                    Accede a las funciones más utilizadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/dashboard/appointments">
                      <Calendar className="mr-2 h-4 w-4" />
                      Ver todas las citas
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/dashboard/services">
                      <Users className="mr-2 h-4 w-4" />
                      Gestionar servicios
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/dashboard/availability">
                      <Clock className="mr-2 h-4 w-4" />
                      Configurar horarios
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start" variant="outline">
                    <Link href="/dashboard/settings">
                      <Share2 className="mr-2 h-4 w-4" />
                      Ver mi enlace público
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Setup Checklist */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Configuración Inicial
                  </CardTitle>
                  <CardDescription>
                    Completa estos pasos para empezar a recibir reservas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs text-primary font-bold">1</span>
                    </div>
                    <span className="text-sm">Crear tu primer servicio</span>
                    <Button asChild size="sm" className="ml-auto">
                      <Link href="/dashboard/services">Hacer</Link>
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs text-primary font-bold">2</span>
                    </div>
                    <span className="text-sm">Configurar horarios disponibles</span>
                    <Button asChild size="sm" className="ml-auto">
                      <Link href="/dashboard/availability">Hacer</Link>
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs text-primary font-bold">3</span>
                    </div>
                    <span className="text-sm">Compartir tu enlace</span>
                    <Button asChild size="sm" className="ml-auto">
                      <Link href="/dashboard">Ver</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Actividad Reciente
                  </CardTitle>
                  <CardDescription>
                    Tus últimas acciones en la plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Cuenta creada exitosamente</p>
                        <p className="text-xs text-muted-foreground">Hace unos minutos</p>
                      </div>
                    </div>
                    
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay actividad reciente</p>
                      <p className="text-xs">Comienza configurando tus servicios</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips & Help */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Consejos Útiles
                  </CardTitle>
                  <CardDescription>
                    Aprovecha al máximo MiTurno
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <h4 className="font-medium text-sm mb-1">💡 Primer consejo</h4>
                    <p className="text-xs text-muted-foreground">
                      Agrega fotos a tus servicios para que se vean más profesionales
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <h4 className="font-medium text-sm mb-1">📱 Optimiza para móviles</h4>
                    <p className="text-xs text-muted-foreground">
                      La mayoría de tus clientes reservarán desde sus teléfonos
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <h4 className="font-medium text-sm mb-1">🔗 Comparte tu enlace</h4>
                    <p className="text-xs text-muted-foreground">
                      Incluye tu enlace en WhatsApp, Instagram y otras redes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-8">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                <Link href="/dashboard">
                  <Calendar className="mr-2 h-5 w-5" />
                  Ir al Dashboard Completo
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Hero Section */}
          <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-background via-background to-muted/30 py-8 sm:py-12 -mt-16 md:-mt-20 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
            <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-xl" />
            
            <div className="container px-4 md:px-6 relative z-10">
              <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8 text-center">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      Mi Turno
                    </span>
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 sm:mb-6 px-4 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent pb-4">
                    Potenciá tu agenda
                  </h1>
                  <p className="mx-auto max-w-[700px] text-lg sm:text-xl md:text-2xl text-muted-foreground px-4 leading-relaxed">
                    MiTurno es la plataforma que revoluciona la gestión de citas. 
                    <span className="text-primary font-semibold"> Crea tu URL personalizada</span> y comienza a recibir reservas en minutos.
                  </p>
                </div>

                <div className="w-full max-w-md space-y-4 px-4">
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground text-sm">
                        miturno.app/
                      </div>
                      <Input
                        className="pl-[105px] text-base h-12"
                        placeholder="tu-nombre"
                        value={username}
                        onChange={handleUsernameChange}
                        onKeyDown={handleKeyDown}
                        aria-label="Nombre de usuario para tu URL personalizada"
                      />
                    </div>
                    <Button 
                      onClick={handleUsernameSubmit} 
                      size="lg"
                      className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Crear cuenta
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ¿Ya tienes cuenta? <Link href="/auth/login" className="text-primary hover:underline font-medium">Inicia sesión</Link>
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center justify-center gap-8 pt-8">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Configuración en 2 minutos</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span>100% Gratis</span>
                  </div>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Smartphone className="h-4 w-4 text-purple-500" />
                    <span>Optimizado móvil</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-b from-muted/30 to-background">
            <div className="container px-4 md:px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  ¿Por qué elegir MiTurno?
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Diseñado para profesionales que quieren simplificar su gestión de citas
                </p>
              </div>
              
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 items-start">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/50 hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                        <div className="text-primary">{benefit.icon}</div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* How it Works Section */}
          <section className="w-full py-16 sm:py-20 md:py-24">
            <div className="container px-4 md:px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  ¿Cómo funciona?
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Tres pasos simples para comenzar a recibir reservas
                </p>
              </div>
              
              <div className="grid gap-8 sm:gap-12 md:grid-cols-3 items-start">
                <div className="relative">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                        1
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold">Creá tu cuenta</h3>
                      <p className="text-muted-foreground">Solo te llevará 60 segundos personalizar tu perfil y comenzar a compartir lo que hacés.</p>
                    </div>
                  </div>
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent transform translate-x-4" />
                </div>
                
                <div className="relative">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                        2
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold">Creá tus servicios</h3>
                      <p className="text-muted-foreground">Configura los servicios que ofreces, sus duraciones y precios para que tus clientes puedan reservar.</p>
                    </div>
                  </div>
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary to-transparent transform translate-x-4" />
                </div>
                
                <div className="relative">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                        3
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl font-bold">Compartí tu enlace</h3>
                      <p className="text-muted-foreground">Contale a tu comunidad sobre MiTurno y tus servicios, publicalo en redes sociales así más personas podrán reservar turnos.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-b from-background to-muted/30">
            <div className="container px-4 md:px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  Perfecto para cualquier negocio
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Desde profesionales independientes hasta pequeños negocios
                </p>
              </div>
              
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
                {useCases.map((useCase, index) => (
                  <Card key={index} className="border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/50 hover:shadow-xl transition-all duration-300 group hover:scale-105">
                    <CardContent className="p-6">
                      <div className="text-4xl mb-4">{useCase.icon}</div>
                      <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
                      <p className="text-sm text-muted-foreground">{useCase.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full py-16 sm:py-20 md:py-24 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
            <div className="container px-4 md:px-6">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                  ¿Listo para comenzar?
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Únete a los primeros profesionales que están revolucionando la gestión de sus citas
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="w-full max-w-md">
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground text-sm">
                          miturno.app/
                        </div>
                        <Input
                          className="pl-[105px] text-base h-12"
                          placeholder="tu-nombre"
                          value={username}
                          onChange={handleUsernameChange}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                      <Button 
                        onClick={handleUsernameSubmit} 
                        size="lg"
                        className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Crear cuenta
                      </Button>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-4">
                  ¿Ya tienes cuenta? <Link href="/auth/login" className="text-primary hover:underline font-medium">Inicia sesión</Link>
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}