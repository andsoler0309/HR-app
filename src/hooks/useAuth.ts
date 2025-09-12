'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false
  })
  const router = useRouter()
  const params = useParams() as { locale: string }

  useEffect(() => {
    let isMounted = true
    
    // Check for existing session on component mount
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!isMounted) return
        
        if (error) {
          console.error('Error getting session:', error)
          setAuthState({ user: null, session: null, loading: false, isAuthenticated: false })
          return
        }

        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          isAuthenticated: !!session
        })

        // Only redirect if we're on an auth page and user is authenticated
        if (session && typeof window !== 'undefined' && window.location.pathname.includes('/auth/')) {
          const locale = params?.locale || 'es'
          router.push(`/${locale}/dashboard/employees`)
        }
      } catch (error) {
        if (!isMounted) return
        console.error('Error in getSession:', error)
        setAuthState({ user: null, session: null, loading: false, isAuthenticated: false })
      }
    }

    getSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        console.log('Auth state changed:', event, session?.user?.email)
        
        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          isAuthenticated: !!session
        })

        // Handle different auth events
        if (event === 'SIGNED_IN' && session) {
          const locale = params?.locale || 'es'
          // Only redirect if not already on dashboard and window is available
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard/')) {
            router.push(`/${locale}/dashboard/employees`)
          }
        } else if (event === 'SIGNED_OUT') {
          const locale = params?.locale || 'es'
          // Only redirect if not already on auth page and window is available
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
            router.push(`/${locale}/auth/login`)
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [router, params])

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      await supabase.auth.signOut()
      
      // Clear remember me preference
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.remember-me')
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const checkRememberMe = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('supabase.auth.remember-me') === 'true'
    }
    return false
  }

  return {
    ...authState,
    signOut,
    checkRememberMe
  }
}
