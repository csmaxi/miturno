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

export function Navbar() {
  const { user, checkUser } = useAuthStore()
  const supabase = createClientSupabaseClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          useAuthStore.setState({ user })
          checkUser()
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
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
  }, [supabase, checkUser])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">MiTurno</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/explorar" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Explorar
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">
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
                onClick={async () => {
                  await supabase.auth.signOut()
                }}
              >
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link href="/auth/login">Iniciar sesión</Link>
              </Button>
            </div>
          )}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-4">
                <Link 
                  href="/explorar" 
                  className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Explorar
                </Link>
                <Link 
                  href="/pricing" 
                  className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Precios
                </Link>
                {user ? (
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={async () => {
                      await supabase.auth.signOut()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Cerrar sesión
                  </Button>
                ) : (
                  <Button asChild variant="ghost" className="justify-start">
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
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