import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL and Anon Key must be defined in environment variables"
    )
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async get(name: string) {
        return (await cookieStore).get(name)?.value
      },
      async set(name: string, value: string, options: any) {
        try {
          (await cookieStore).set({ name, value, ...options })
        } catch (error) {
          // Manejar error de cookies
        }
      },
      async remove(name: string, options: any) {
        try {
          (await cookieStore).set({ name, value: "", ...options })
        } catch (error) {
          // Manejar error de cookies
        }
      },
    },
  })
}

// Versión segura para obtener usuario autenticado
export async function getAuthUser() {
  const supabase = createServerSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error("Error de autenticación:", error)
    return null
  }

  return user
}