'use client'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export const useSignOut = () => {
  const router = useRouter()
  const params = useParams() as { locale: string }

  const signOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut()
      
      // Clear all stored user data
      if (typeof window !== 'undefined') {
        // Clear remember me data
        localStorage.removeItem('supabase.auth.remember-me')
        localStorage.removeItem('supabase.auth.last-email')
        
        // Clear any other user-specific data
        localStorage.removeItem('portal_user')
        
        // Clear session storage as well
        sessionStorage.clear()
      }
      
      // Redirect to login page
      const locale = params?.locale || 'es'
      router.push(`/${locale}/auth/login`)
      router.refresh()
      
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return { signOut }
}
