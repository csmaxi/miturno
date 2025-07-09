"use client";

import { Suspense, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, MapPin, Star, Calendar, Sparkles, Filter, TrendingUp, Heart } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import useSWR from "swr"
import { createClientSupabaseClient } from "@/lib/supabase/client"

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

// Componente de carga para los perfiles
const ProfilesSkeleton = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Card key={i} className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/50 hover:shadow-xl transition-all duration-300">
        <CardHeader className="p-0">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/40 animate-pulse" />
        </CardHeader>
        <CardContent className="p-6 pt-0 -mt-12 text-center">
          <div className="h-24 w-24 rounded-full bg-muted animate-pulse mx-auto border-4 border-background" />
          <div className="mt-4 h-6 w-32 bg-muted animate-pulse mx-auto" />
          <div className="mt-2 h-4 w-24 bg-muted animate-pulse mx-auto" />
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-center">
          <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

const fetchUsers = async (page: number, searchQuery: string) => {
  const supabase = createClientSupabaseClient()
  const pageSize = 12
  const start = (page - 1) * pageSize
  const end = start + pageSize - 1

  let query = supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })

  if (searchQuery) {
    query = query.or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,profile_title.ilike.%${searchQuery}%`)
  }

  const { data, count, error } = await query.range(start, end)
  if (error) throw error
  return { users: data, totalPages: Math.ceil((count || 0) / pageSize) }
}

// Componente para la lista de perfiles
const ProfilesList = ({ page, searchQuery }: { page: number; searchQuery: string }) => {
  const { data, error, isLoading } = useSWR(["users", page, searchQuery], () => fetchUsers(page, searchQuery))

  if (isLoading) return <ProfilesSkeleton />
  if (error) return (
    <div className="col-span-full text-center py-12">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Search className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-red-500 font-medium">Error al cargar perfiles</p>
        <p className="text-sm text-muted-foreground">Intenta recargar la página</p>
      </div>
    </div>
  )
  if (!data || !data.users || data.users.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">No se encontraron perfiles</p>
          <p className="text-sm text-muted-foreground">Intenta con otros términos de búsqueda</p>
        </div>
      </div>
    )
  }
  const { users, totalPages } = data

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {users.map((user: UserData) => (
          <Card key={user.id} className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-card/50 hover:shadow-xl transition-all duration-300 group hover:scale-105">
            <CardHeader className="p-0 relative">
              <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/40 relative overflow-hidden">
                {user.banner_image_url && (
                  <img
                    src={user.banner_image_url || "/placeholder.svg"}
                    alt="Banner"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                {/* Status indicator */}
                <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-background shadow-lg">
                  <div className="w-full h-full bg-green-400 rounded-full animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 -mt-12 text-center relative">
              <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <AvatarImage src={user.profile_image_url || ""} alt={user.full_name} />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  {user.full_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4 text-lg group-hover:text-primary transition-colors">{user.full_name}</CardTitle>
              <CardDescription className="text-sm font-medium">@{user.username}</CardDescription>
              {user.profile_title && (
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{user.profile_title}</p>
              )}
              
              {/* Quick stats */}
              <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Disponible</span>
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>Nuevo</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-6 pt-0 flex justify-center">
              <Button asChild className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href={`/${user.username}`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Ver perfil
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              href={`/explorar?page=${pageNum}${searchQuery ? `&search=${searchQuery}` : ''}`}
              className={`px-4 py-2 rounded-md transition-all duration-300 ${
                pageNum === page
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted hover:bg-muted/80 hover:shadow-md"
              }`}
            >
              {pageNum}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default function ExplorarPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const router = useRouter();
  const page = Number(searchParams.page) || 1;
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.search || "");
  const [session, setSession] = useState<any>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      router.push(`/explorar?page=1${searchQuery ? `&search=${searchQuery}` : ''}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container px-4 py-12 md:px-6 -mt-16 md:-mt-20">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6 relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl" />
            <div className="absolute top-0 left-1/4 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-primary/5 rounded-full blur-xl" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  Explorar
                </span>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                Descubre Profesionales
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Encuentra los mejores{" "}
                <span className="text-primary font-semibold">profesionales y servicios</span>{" "}
                disponibles en MiTurno
              </p>
            </div>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre, servicio o especialidad..." 
                className="pl-12 h-12 text-base border-2 focus:border-primary/50 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Quick filters */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filtros:</span>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                <MapPin className="mr-1 h-3 w-3" />
                Cerca de ti
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <TrendingUp className="mr-1 h-3 w-3" />
                Más populares
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Star className="mr-1 h-3 w-3" />
                Mejor valorados
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 text-center">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-600 mb-1">50+</div>
                <div className="text-sm text-muted-foreground">Profesionales</div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/10 to-green-500/5 text-center">
              <CardContent className="p-6">
                <Calendar className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-600 mb-1">200+</div>
                <div className="text-sm text-muted-foreground">Servicios</div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 text-center">
              <CardContent className="p-6">
                <Heart className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-purple-600 mb-1">1000+</div>
                <div className="text-sm text-muted-foreground">Reservas</div>
              </CardContent>
            </Card>
          </div>

          {/* Profiles List */}
          <ProfilesList page={page} searchQuery={debouncedSearch} />
        </div>
      </div>
    </div>
  );
}