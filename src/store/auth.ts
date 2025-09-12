import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

type Profile = {
  id: string
  full_name: string
  email: string
  company_name: string | null
  avatar_url: string | null
  profile_picture: string | null
  subscription_status: string | null
  subscription_end_date: string | null
  created_at: string
  updated_at: string
}

type AuthStore = {
  isLoading: boolean
  profile: Profile | null
  isAuthenticated: boolean
  isInitialized: boolean
  fetchProfile: () => Promise<void>
  signOut: () => Promise<void>
  checkRememberMe: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isLoading: true,
  profile: null,
  isAuthenticated: false,
  isInitialized: false,
  
  fetchProfile: async () => {
    try {
      // Ensure we're on the client side
      if (typeof window === 'undefined') {
        return;
      }

      // Don't fetch if already loading or already have a profile
      const currentState = get();
      if (currentState.isLoading && currentState.isInitialized) {
        return;
      }

      set({ isLoading: true });
      
      // Use getUser() for security - it validates the JWT
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        set({ 
          profile: null, 
          isLoading: false, 
          isAuthenticated: false,
          isInitialized: true
        })
        return;
      }

      // Get profile data - only select columns that exist
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name, company_name, avatar_url, profile_picture, subscription_status, subscription_end_date, created_at, updated_at')
        .eq('id', user.id)
        .single()

      set({ 
        profile, 
        isLoading: false, 
        isAuthenticated: true,
        isInitialized: true
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
      set({ 
        profile: null, 
        isLoading: false, 
        isAuthenticated: false,
        isInitialized: true
      })
    }
  },
  
  signOut: async () => {
    try {
      await supabase.auth.signOut()
      
      // Clear remember me preference
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.remember-me')
        localStorage.removeItem('supabase.auth.last-email')
      }
      
      set({ 
        profile: null, 
        isAuthenticated: false 
      })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  },
  
  checkRememberMe: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('supabase.auth.remember-me') === 'true'
    }
    return false
  }
}))