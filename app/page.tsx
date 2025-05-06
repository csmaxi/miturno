"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";
import { Calendar, Clock, Share2, Users } from "lucide-react";
import { Session } from '@supabase/supabase-js';
import { Navbar } from "@/components/navbar";

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
  <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-lg border bg-card">
    <div className="bg-primary/10 p-4 rounded-full">
      {icon}
    </div>
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

// Componente principal
export default function Home() {
  const [username, setUsername] = useState("");
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabaseClient(), []);
  const { user, userData, loading, checkUser } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!mounted) return;

        if (user) {
          useAuthStore.setState({ user });
          checkUser();
        } else {
          useAuthStore.setState({ user: null, userData: null });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          useAuthStore.setState({ user: null, userData: null });
        }
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string) => {
      if (!mounted) return;

      if (event === "SIGNED_IN") {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          useAuthStore.setState({ user });
          await checkUser();
        }
      } else if (event === "SIGNED_OUT") {
        useAuthStore.setState({ user: null, userData: null });
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, checkUser]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {user ? (
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  ¡Bienvenido,{" "}
                  <span className="text-primary">
                    {userData?.full_name || user.user_metadata?.full_name || user.email || "Usuario"}
                  </span>
                  !
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Gracias por ser parte de MiTurno. Gestiona tus citas y turnos desde tu panel.
                </p>
              </div>
              <div className="flex gap-4">
                <Button asChild size="lg">
                  <Link href="/dashboard">Ir a mi Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Potenciá tu agenda
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    MiTurno es una plataforma que te permite gestionar tus citas y turnos con tu propia URL
                    personalizada.
                  </p>
                </div>
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                        miturno.app/
                      </div>
                      <Input
                        className="pl-[105px]"
                        placeholder="usuario"
                        value={username}
                        onChange={handleUsernameChange}
                        onKeyDown={handleKeyDown}
                        aria-label="Nombre de usuario para tu URL personalizada"
                      />
                    </div>
                    <Button onClick={handleUsernameSubmit}>Crear cuenta</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ¿Ya tienes cuenta? <Link href="/auth/login" className="underline">Inicia sesión</Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-3 items-start">
                <FeatureCard
                  icon={<Users className="h-6 w-6 text-primary" />}
                  title="Creá tu cuenta"
                  description="Solo te llevará 60 segundos personalizar tu perfil y comenzar a compartir lo que hacés."
                />
                <FeatureCard
                  icon={<Clock className="h-6 w-6 text-primary" />}
                  title="Creá tus servicios"
                  description="Configura los servicios que ofreces, sus duraciones y precios para que tus clientes puedan reservar."
                />
                <FeatureCard
                  icon={<Share2 className="h-6 w-6 text-primary" />}
                  title="Compartí tu enlace"
                  description="Contale a tu comunidad sobre MiTurno y tus servicios, publicalo en redes sociales así más personas
                  podrán reservar turnos."
                />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}