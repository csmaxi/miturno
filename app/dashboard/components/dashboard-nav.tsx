"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Home, LogOut, Settings, Users, Clock, CalendarDays, CalendarRange } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"


interface DashboardNavProps {
  user: any
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientSupabaseClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
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
  const MobileNav = () => (
    <div className="md:hidden flex items-center justify-between w-full border-b px-4 h-14">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <Calendar className="h-6 w-6" />
        <span>MiTurno</span>
      </Link>
      <div className="flex items-center gap-2">
       
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
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
                className="h-5 w-5"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span className="sr-only">Menú</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de navegación</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full">
              <div className="flex h-14 items-center border-b px-4">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                  <Calendar className="h-6 w-6" />
                  <span>MiTurno</span>
                </Link>
              </div>
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
                <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )

  // Versión desktop
  const DesktopNav = () => (
    <div className="hidden md:flex flex-col w-64 border-r bg-muted/40 h-screen">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Calendar className="h-6 w-6" />
          <span>MiTurno</span>
        </Link>
        <div className="ml-auto">
         
        </div>
      </div>
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
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
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