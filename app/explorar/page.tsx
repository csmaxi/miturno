"use client";

import { Suspense, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";

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
      <Card key={i} className="overflow-hidden">
        <CardHeader className="p-0">
          <div className="h-32 bg-muted animate-pulse" />
        </CardHeader>
        <CardContent className="p-6 pt-0 -mt-12 text-center">
          <div className="h-24 w-24 rounded-full bg-muted animate-pulse mx-auto" />
          <div className="mt-4 h-6 w-32 bg-muted animate-pulse mx-auto" />
          <div className="mt-2 h-4 w-24 bg-muted animate-pulse mx-auto" />
        </CardContent>
        <CardFooter className="p-6 pt-0 flex justify-center">
          <div className="h-9 w-24 bg-muted animate-pulse" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

// Componente para la lista de perfiles
const ProfilesList = ({ page, searchQuery }: { page: number; searchQuery: string }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchUsers = async () => {
    setLoading(true);
    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (searchQuery) {
      query = query.or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%,profile_title.ilike.%${searchQuery}%`);
    }

    const { data, count } = await query.range(start, end);

    if (data) {
      setUsers(data);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery]);

  if (loading) {
    return <ProfilesSkeleton />;
  }

  if (!users || users.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-muted-foreground">No se encontraron perfiles</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {users.map((user) => (
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
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link
              key={pageNum}
              href={`/explorar?page=${pageNum}${searchQuery ? `&search=${searchQuery}` : ''}`}
              className={`px-4 py-2 rounded-md ${
                pageNum === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      router.push(`/explorar?page=1${searchQuery ? `&search=${searchQuery}` : ''}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={null} />
      <div className="container px-4 py-12 md:px-6">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Explorar Perfiles
            </h1>
            <p className="text-gray-500 md:text-xl dark:text-gray-400 max-w-2xl mx-auto">
              Descubre profesionales y servicios disponibles en MiTurno
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre o servicio..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ProfilesList page={page} searchQuery={debouncedSearch} />
        </div>
      </div>
    </div>
  );
}