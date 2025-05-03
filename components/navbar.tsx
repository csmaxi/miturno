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

export function Navbar({ user: propUser }: { user: any }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const { user, setUser, setUserData } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserData(null)
      router.push("/")
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
    {
      href: "/pricing",
      label: "Precios",
      active: pathname === "/pricing",
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="font-bold text-xl">MiTurno</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2">
          <nav className="hidden md:flex items-center space-x-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            {user ? (
              <>
                <Button variant="ghost" onClick={handleSignOut}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4">
            <nav className="grid gap-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    route.active ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {route.label}
                </Link>
              ))}
              {user ? (
                <>
                  <button className="text-left text-sm font-medium hover:text-primary" onClick={handleSignOut}>
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <Link href="/auth/login" className="text-sm font-medium hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                  Iniciar sesión
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
