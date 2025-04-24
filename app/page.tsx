"use client";

import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// Definir interfaces para tipado
interface UserData {
  id: string;
  full_name?: string;
  username?: string;
  email?: string;
  // Agrega otros campos que esperes de la tabla "users"
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null); // Cambiado de session a user
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    // Verificar usuario autenticado usando getUser
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUser(user);

          // Obtener datos adicionales del usuario desde la tabla "users" si es necesario
          const { data: userProfile } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (userProfile) {
            setUserData(userProfile);
          }
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log("Auth state changed:", event);
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Validar usuario con getUser
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          const { data: userProfile } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();
          setUserData(userProfile);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserData(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleUsernameSubmit = () => {
    if (username.trim()) {
      localStorage.setItem("preferredUsername", username.trim());
      router.push("/auth/register");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar user={null} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">Cargando...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        {user ? (
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    ¡Bienvenido,{" "}
                    <span className="text-primary">
                      {userData?.full_name || user.user_metadata?.full_name || user.email}
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
          <section className="w-full py-12 md:py-24 lg:py-32">
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
                        placeholder="  usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleUsernameSubmit()}
                      />
                    </div>
                    <Button onClick={handleUsernameSubmit}>Crear cuenta</Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 items-start">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 p-4 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Creá tu cuenta</h3>
                <p className="text-muted-foreground">
                  Solo te llevará 60 segundos personalizar tu perfil y comenzar a compartir lo que hacés.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 p-4 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M8 12h8" />
                    <path d="M12 8v8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Creá tus servicios</h3>
                <p className="text-muted-foreground">
                  Configura los servicios que ofreces, sus duraciones y precios para que tus clientes puedan reservar.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="bg-primary/10 p-4 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-primary"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <line x1="3" x2="21" y1="9" y2="9" />
                    <line x1="9" x2="9" y1="21" y2="9" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Compartí tu enlace</h3>
                <p className="text-muted-foreground">
                  Contale a tu comunidad sobre MiTurno y tus servicios, publicalo en redes sociales así más personas
                  podrán reservar turnos.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}