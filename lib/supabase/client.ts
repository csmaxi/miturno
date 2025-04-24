import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClientSupabaseClient() {
  if (client) return client

  // Get environment variables with fallbacks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  // Check if environment variables are available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Anon Key is missing. Using mock client.")

    // Return a mock client that won't crash the app
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
        signUp: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            neq: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
            }),
            order: () => ({
              limit: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null }),
          }),
        }),
        insert: () => Promise.resolve({ error: null }),
        update: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
    } as any
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
  return client
}
