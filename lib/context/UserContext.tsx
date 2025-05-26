"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/store/auth-store"
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

interface UserContextType {
  user: User | null
  loading: boolean
  userPlan: string
  refetchUserPlan: () => Promise<void>
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const { user, setUser, setUserData } = useAuthStore()
  const [userPlan, setUserPlan] = useState('free')

  const fetchUserPlan = async () => {
    if (!user) return
    try {
      const supabase = createClientSupabaseClient()
      const { data: userData, error } = await supabase
        .from("users")
        .select("subscription_plan")
        .eq("id", user.id)
        .single()
      
      if (error) {
        console.error("Error fetching user plan:", error)
        return
      }
      
      setUserPlan(userData?.subscription_plan || 'free')
    } catch (error) {
      console.error("Error in fetchUserPlan:", error)
    }
  }

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
        
        if (currentUser) {
          await fetchUserPlan()
        }
        
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
        setUserPlan('free')
      } else if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        await fetchUserPlan()
      }
    })

    // Suscribirse a cambios en la tabla users
    const channel = supabase
      .channel('user_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user?.id}`
        },
        async () => {
          await fetchUserPlan()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
      channel.unsubscribe()
    }
  }, [setUser, setUserData, user?.id])

  return (
    <UserContext.Provider value={{ user, loading, userPlan, refetchUserPlan: fetchUserPlan }}>
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