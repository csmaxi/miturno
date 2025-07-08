"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store/auth-store"
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

interface UserContextType {
  user: User | null
  loading: boolean
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const { user, setUser, setUserData } = useAuthStore()

  useEffect(() => {
    const supabase = createClientSupabaseClient()

    // Obtener el usuario inicial
    const initializeUser = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("Error getting user:", error)
          setLoading(false)
          return
        }

        setUser(currentUser)
        setLoading(false)
      } catch (error) {
        console.error("Error in initializeUser:", error)
        setLoading(false)
      }
    }

    initializeUser()

    // Suscribirse a cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log("Auth state changed:", event, session?.user?.id)
      
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setUserData(null)
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setUserData])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
} 