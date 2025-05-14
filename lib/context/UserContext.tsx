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
    supabase.auth.getUser().then(
      ({ data }: { data: { user: User | null } }) => {
        setUser(data?.user || null)
        setLoading(false)
      }
    )

    // Suscribirse a cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
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

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
} 