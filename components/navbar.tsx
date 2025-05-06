"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Menu, Settings } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useAuthStore } from "@/lib/store/auth-store"
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js"

interface NavbarProps {
  user: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const { setUser, setUserData, checkUser } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await checkUser()
      }
    }

    initializeAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        await checkUser()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setUserData(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, setUser, setUserData, checkUser])

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
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span className="font-bold text-xl hidden sm:inline-block">MiTurno</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
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
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeSwitcher />
            {user ? (
              <Button variant="ghost" onClick={handleSignOut} className="hidden sm:inline-flex">
                Cerrar sesión
              </Button>
            ) : (
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
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
        <div className="md:hidden border-t animate-in slide-in-from-top-5 duration-300">
          <div className="container py-4">
            <nav className="grid gap-4">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary py-2",
                    route.active ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {route.label}
                </Link>
              ))}
              {user ? (
                <button 
                  className="text-left text-sm font-medium hover:text-primary py-2" 
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Cerrar sesión
                </button>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="text-sm font-medium hover:text-primary py-2" 
                  onClick={() => setIsMobileMenuOpen(false)}
                >
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
