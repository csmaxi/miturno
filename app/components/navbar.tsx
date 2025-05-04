"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store/auth-store"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { AuthChangeEvent } from "@supabase/supabase-js"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export function Navbar() {
  const { user, checkUser } = useAuthStore()
  const supabase = createClientSupabaseClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          useAuthStore.setState({ user })
          await checkUser()
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar la sesión",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent) => {
      if (event === "SIGNED_IN") {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          useAuthStore.setState({ user })
          await checkUser()
        }
      } else if (event === "SIGNED_OUT") {
        useAuthStore.setState({ user: null, userData: null })
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, checkUser, toast])

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="banner"
    >
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link 
            href="/" 
            className="mr-6 flex items-center space-x-2"
            aria-label="Ir al inicio"
          >
            <span className="font-bold">MiTurno</span>
          </Link>
          <nav 
            className="hidden md:flex items-center space-x-6 text-sm font-medium"
            role="navigation"
            aria-label="Navegación principal"
          >
            <Link 
              href="/explorar" 
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              aria-label="Explorar servicios"
            >
              Explorar
            </Link>
            <Link 
              href="/pricing" 
              className="transition-colors hover:text-foreground/80 text-foreground/60"
              aria-label="Ver precios"
            >
              Precios
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeSwitcher />
          {user ? (
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                disabled={isLoading}
                aria-label="Cerrar sesión"
              >
                {isLoading ? "Cerrando..." : "Cerrar sesión"}
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button 
                asChild 
                variant="ghost"
                aria-label="Iniciar sesión"
              >
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
            </div>
          )}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[300px] sm:w-[400px]"
              role="dialog"
              aria-label="Menú de navegación"
            >
              <nav 
                className="flex flex-col space-y-4 mt-4"
                role="navigation"
                aria-label="Navegación móvil"
              >
                <Link 
                  href="/explorar" 
                  className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Explorar servicios"
                >
                  Explorar
                </Link>
                <Link 
                  href="/pricing" 
                  className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Ver precios"
                >
                  Precios
                </Link>
                {user ? (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={handleSignOut}
                    disabled={isLoading}
                    aria-label="Cerrar sesión"
                  >
                    {isLoading ? "Cerrando..." : "Cerrar sesión"}
                  </Button>
                ) : (
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="justify-start"
                    aria-label="Iniciar sesión"
                  >
                    <Link 
                      href="/auth/login" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Iniciar sesión
                    </Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
} 