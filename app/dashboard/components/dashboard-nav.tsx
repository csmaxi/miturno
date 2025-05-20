"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Home, LogOut, Settings, Users, Clock, CalendarDays, CalendarRange, Menu } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAuthStore } from "@/lib/store/auth-store"


interface DashboardNavProps {
  user: any
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { setUser, setUserData } = useAuthStore()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Esperar un momento para asegurar que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 100))
      
      setUser(null)
      setUserData(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/appointments",
      label: "Turnos",
      icon: CalendarDays,
      active: pathname === "/dashboard/appointments",
    },
    {
      href: "/dashboard/services",
      label: "Servicios",
      icon: Clock,
      active: pathname === "/dashboard/services",
    },
    {
      href: "/dashboard/availability",
      label: "Disponibilidad",
      icon: CalendarRange,
      active: pathname === "/dashboard/availability",
    },
    {
      href: "/dashboard/team",
      label: "Equipo",
      icon: Users,
      active: pathname === "/dashboard/team",
    },
    {
      href: "/dashboard/settings",
      label: "Configuración",
      icon: Settings,
      active: pathname === "/dashboard/settings",
    },
  ]

  // Versión móvil
  const MobileNav = () => {
    const currentRoute = routes.find(route => route.active);
    
    return (
      <div className="md:hidden flex items-center justify-between w-full border-b px-4 h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 z-50">
        <div className="flex items-center gap-2">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 h-screen">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>Menú</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-[calc(100vh-3.5rem)]">
                <div className="flex-1 overflow-auto py-2">
                  <nav className="grid items-start px-2 text-sm font-medium">
                    {routes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-all",
                          route.active ? "bg-accent text-accent-foreground" : "transparent",
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <route.icon className="h-4 w-4" />
                        {route.label}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="mt-auto p-4 border-t">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarImage src={user.profile_image_url || ""} alt={user.full_name} />
                      <AvatarFallback>{user.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          {currentRoute && (
            <div className="flex items-center gap-2">
              <currentRoute.icon className="h-5 w-5 text-primary" />
              <span className="font-medium">{currentRoute.label}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Versión desktop
  const DesktopNav = () => (
    <div className="hidden md:flex flex-col w-64 border-r bg-muted/40 h-[calc(100vh-3.5rem)]">
     
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-all",
                route.active ? "bg-accent text-accent-foreground" : "transparent",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage src={user.profile_image_url || ""} alt={user.full_name} />
            <AvatarFallback>{user.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{user.full_name}</p>
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <MobileNav />
      <DesktopNav />
    </>
  )
}