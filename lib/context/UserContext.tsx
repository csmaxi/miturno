"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"

const UserContext = createContext<any>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClientSupabaseClient()
    supabase.auth.getUser().then(
      ({ data }: { data: any }) => {
        setUser(data?.user || null)
        setLoading(false)
      }
    )
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  return useContext(UserContext)
} 