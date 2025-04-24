"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
// Importar el componente ThemeSwitcher
import { ThemeSwitcher } from "@/components/theme-switcher"

export function Navbar({ user }: { user?: any }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState<any>(user)
  const router = useRouter()
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    // Si no se proporciona un usuario, intentamos obtenerlo
    if (!user) {
      const checkSession = async () => {
        const { data } = await supabase.auth.getSession()
        setSession(data.session?.user)
      }
      checkSession()
    } else {
      setSession(user)
    }

    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: { user: any }) => {
      console.log("Navbar auth state changed:", event)
      setSession(session?.user || null)
    })

    return () => {
      // Limpiar el listener cuando el componente se desmonte
      authListener.subscription.unsubscribe()
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setSession(null)
      setOpen(false)
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
    {
      href: "/pricing",
      label: "Precios",
      active: pathname === "/pricing",
    },
  ]

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Calendar className="h-6 w-6" />
          <span className="text-xl">MiTurno</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <div className="hidden md:flex gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex gap-2">
            {session ? (
              <>
                <ThemeSwitcher />
                <Button variant="ghost" onClick={handleSignOut}>
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <ThemeSwitcher />
                <Button asChild variant="ghost">
                  <Link href="/auth/login">Ingresar</Link>
                </Button>
              </>
            )}
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn("hover:text-primary", route.active ? "text-primary" : "text-muted-foreground")}
                    onClick={() => setOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}
                {session ? (
                  <>
                    <Link href="/dashboard" className="hover:text-primary" onClick={() => setOpen(false)}>
                      Dashboard
                    </Link>
                    <button className="text-left hover:text-primary" onClick={handleSignOut}>
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login" className="hover:text-primary" onClick={() => setOpen(false)}>
                    Ingresar
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  )
}
