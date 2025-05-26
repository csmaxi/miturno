      export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          full_name: string
          profile_title: string | null
          profile_description: string | null
          profile_image_url: string | null
          banner_image_url: string | null
          created_at: string
          updated_at: string
          phone: string | null
          trial_activated: boolean | null
          trial_start_date: string | null
          trial_end_date: string | null
          has_active_plan: boolean | null
          is_public: boolean | null
          subscription_plan: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          full_name: string
          profile_title?: string | null
          profile_description?: string | null
          profile_image_url?: string | null
          banner_image_url?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          trial_activated?: boolean | null
          trial_start_date?: string | null
          trial_end_date?: string | null
          has_active_plan?: boolean | null
          is_public?: boolean | null
          subscription_plan?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          full_name?: string
          profile_title?: string | null
          profile_description?: string | null
          profile_image_url?: string | null
          banner_image_url?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          trial_activated?: boolean | null
          trial_start_date?: string | null
          trial_end_date?: string | null
          has_active_plan?: boolean | null
          is_public?: boolean | null
          subscription_plan?: string
        }
      }
      services: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          duration: number
          price: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          duration: number
          price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          duration?: number
          price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          user_id: string
          name: string
          position: string | null
          bio: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          position?: string | null
          bio?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          position?: string | null
          bio?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      availability: {
        Row: {
          id: string
          user_id: string
          day_of_week: number
          start_time: string
          end_time: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          day_of_week: number
          start_time: string
          end_time: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          service_id: string | null
          team_member_id: string | null
          client_name: string
          client_email: string
          client_phone: string | null
          appointment_date: string
          start_time: string
          end_time: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id?: string | null
          team_member_id?: string | null
          client_name: string
          client_email: string
          client_phone?: string | null
          appointment_date: string
          start_time: string
          end_time: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service_id?: string | null
          team_member_id?: string | null
          client_name?: string
          client_email?: string
          client_phone?: string | null
          appointment_date?: string
          start_time?: string
          end_time?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
