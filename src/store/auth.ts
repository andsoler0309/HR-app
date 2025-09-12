import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  company: string
  avatar_url: string | null
  profile_picture: string | null
  department: string
  created_at: string
}

type AuthStore = {
  isLoading: boolean
  profile: Profile | null
  isAuthenticated: boolean
  fetchProfile: () => Promise<void>
  signOut: () => Promise<void>
  checkRememberMe: () => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  isLoading: true,
  profile: null,
  isAuthenticated: false,
  
  fetchProfile: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({ 
          profile, 
          isLoading: false, 
          isAuthenticated: true 
        })
      } else {
        set({ 
          profile: null, 
          isLoading: false, 
          isAuthenticated: false 
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      set({ 
        profile: null, 
        isLoading: false, 
        isAuthenticated: false 
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