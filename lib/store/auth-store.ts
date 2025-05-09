import { create } from 'zustand'
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
  setUser: (user: User | null) => void
  setUserData: (userData: UserData | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userData: null,
  loading: true,
  setUser: (user) => set({ user }),
  setUserData: (userData) => set({ userData }),
  setLoading: (loading) => set({ loading }),
})) 