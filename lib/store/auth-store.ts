import { create } from 'zustand'
import { createClientSupabaseClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserData {
  id: string
  full_name: string | null
  username: string | null
  email: string | null
  banner_image_url?: string
}

interface AuthState {
  user: User | null
  userData: UserData | null
  loading: boolean
  supabase: ReturnType<typeof createClientSupabaseClient>
  setUser: (user: User | null) => void
  setUserData: (userData: UserData | null) => void
  setLoading: (loading: boolean) => void
  fetchUserData: (userId: string) => Promise<void>
  checkUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userData: null,
  loading: true,
  supabase: createClientSupabaseClient(),

  setUser: (user) => set({ user }),
  setUserData: (userData) => set({ userData }),
  setLoading: (loading) => set({ loading }),

  fetchUserData: async (userId: string) => {
    try {
      const { data, error } = await get().supabase
        .from('users')
        .select('id, full_name, username, email, banner_image_url')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      set({ userData: data })
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  },

  checkUser: async () => {
    try {
      set({ loading: true })
      const { data: { user } } = await get().supabase.auth.getUser()
      set({ user })
      if (user) await get().fetchUserData(user.id)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      set({ loading: false })
    }
  }
})) 