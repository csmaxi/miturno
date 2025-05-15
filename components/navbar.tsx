"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Menu, Settings } from "lucide-react"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useAuthStore } from "@/lib/store/auth-store"
import { useUserContext } from "@/lib/context/UserContext"

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const { setUser, setUserData } = useAuthStore()
  const { user, loading } = useUserContext()

  const handleSignOut = async () => {
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
      href: "/",
      label: "Inicio",
      active: pathname === "/",
    },
    {
      href: "/explorar",
      label: "Explorar",
      active: pathname === "/explorar",
    },
    // {
    //   href: "/pricing",
    //   label: "Precios",
    //   active: pathname === "/pricing",
    // },
    ...(user ? [{
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    }] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 hidden sm:block" />
            <span className="font-bold text-xl sm:inline-block hidden sm:inline-block">MiTurno</span>
          </Link>
          <nav className="flex items-center space-x-4 sm:space-x-6 -ml-2 sm:ml-0">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-xs sm:text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <Button variant="ghost" onClick={handleSignOut} className="inline-flex">
              Cerrar sesión
            </Button>
          ) : (
            <Button variant="ghost" asChild className="inline-flex">
              <Link href="/auth/login">Iniciar sesión</Link>
            </Button>
          )}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
