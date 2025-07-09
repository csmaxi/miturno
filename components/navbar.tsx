"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Menu, Settings, Edit } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useAuthStore } from "@/lib/store/auth-store"
import { useUserContext } from "@/lib/context/UserContext"

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const router = useRouter()
  const supabase = useMemo(() => createClientSupabaseClient(), [])
  const { setUser, setUserData, userData } = useAuthStore()
  const { user, loading } = useUserContext()

  // Check if user is on their own profile page
  const isOwnProfile = userData && pathname.startsWith(`/${userData.username}`)

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show navbar when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true)
      } else {
        // Hide navbar when scrolling down
        setIsVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

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
    ...(user ? [{
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
    }] : []),
  ]

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300",
      isVisible ? "translate-y-0" : "-translate-y-full"
    )}>
      <div className="container mx-auto px-4 flex flex-col md:flex-row h-auto md:h-16">
        {/* Mobile & Tablet layout */}
        <div className="flex md:hidden flex-col">
          <div className="flex items-center justify-between py-3 px-2">
            <Link href="/" className="flex items-center space-x-2 min-w-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="font-bold text-lg sm:text-xl truncate">MiTurno</span>
            </Link>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {isOwnProfile && (
                <Button variant="outline" asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/dashboard/settings">
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">Editar</span>
                  </Link>
                </Button>
              )}
              {user ? (
                <Button 
                  variant="outline" 
                  onClick={handleSignOut} 
                  size="sm"
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Cerrar sesión</span>
                  <span className="sm:hidden">Salir</span>
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  asChild 
                  size="sm"
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Link href="/auth/login">
                    <span className="hidden sm:inline">Iniciar sesión</span>
                    <span className="sm:hidden">Entrar</span>
                  </Link>
                </Button>
              )}
              <ThemeSwitcher />
            </div>
          </div>
          <nav className="flex items-center justify-center space-x-4 sm:space-x-6 py-3 px-2 border-t">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm sm:text-base font-medium transition-colors hover:text-primary px-2 py-1 rounded-md",
                  route.active ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:flex h-16 items-center justify-between w-full">
          <div className="flex items-center space-x-4 lg:space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <span className="font-bold text-xl">MiTurno</span>
            </Link>
            <nav className="flex items-center space-x-4 lg:space-x-6">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md",
                    route.active ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-3 lg:space-x-4">
            {isOwnProfile && (
              <Button variant="outline" asChild size="sm" className="hidden lg:inline-flex">
                <Link href="/dashboard/settings">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar perfil
                </Link>
              </Button>
            )}
            {isOwnProfile && (
              <Button variant="outline" asChild size="sm" className="lg:hidden">
                <Link href="/dashboard/settings">
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {user ? (
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                size="sm"
                className="text-sm"
              >
                Cerrar sesión
              </Button>
            ) : (
              <Button 
                variant="outline" 
                asChild 
                size="sm"
                className="text-sm"
              >
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
            )}
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
