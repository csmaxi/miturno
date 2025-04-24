import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Definir interfaz para los datos de usuarios
interface UserData {
  id: string;
  username: string;
  full_name: string;
  profile_image_url?: string;
  banner_image_url?: string;
  profile_title?: string;
  created_at: string;
}

export default async function ExplorarPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Obtener usuarios con perfiles públicos
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(12) as { data: UserData[] | null };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Explorar Perfiles</h1>
              <p className="text-gray-500 md:text-xl dark:text-gray-400 max-w-2xl mx-auto">
                Descubre profesionales y servicios disponibles en MiTurno
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar por nombre o servicio..." className="pl-10" />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/40">
                        {user.banner_image_url && (
                          <img
                            src={user.banner_image_url || "/placeholder.svg"}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 -mt-12 text-center">
                      <Avatar className="h-24 w-24 mx-auto border-4 border-background">
                        <AvatarImage src={user.profile_image_url || ""} alt={user.full_name} />
                        <AvatarFallback className="text-2xl">
                          {user.full_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="mt-4">{user.full_name}</CardTitle>
                      <CardDescription>@{user.username}</CardDescription>
                      {user.profile_title && <p className="mt-2 text-sm">{user.profile_title}</p>}
                    </CardContent>
                    <CardFooter className="p-6 pt-0 flex justify-center">
                      <Button asChild>
                        <Link href={`/${user.username}`}>Ver perfil</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No se encontraron perfiles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}