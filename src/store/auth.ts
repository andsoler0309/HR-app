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
  fetchProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  isLoading: true,
  profile: null,
  fetchProfile: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({ profile, isLoading: false })
      } else {
        set({ profile: null, isLoading: false })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      set({ profile: null, isLoading: false })
    }
  },
  signOut: async () => {
    await supabase.auth.signOut()
    set({ profile: null })
  }
}))