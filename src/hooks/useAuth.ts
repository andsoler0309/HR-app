'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
}

// Cache para evitar múltiples verificaciones
let cachedSession: Session | null = null
let lastSessionCheck = 0
const SESSION_CACHE_DURATION = 30000 // 30 segundos

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false
  })
  const router = useRouter()
  const params = useParams() as { locale: string }
  const isMountedRef = useRef(true)
  const hasInitialized = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    
    const getSession = async () => {
      try {
        // Verificar cache primero
        const now = Date.now()
        if (cachedSession && (now - lastSessionCheck) < SESSION_CACHE_DURATION) {
          if (isMountedRef.current) {
            setAuthState({
              user: cachedSession.user,
              session: cachedSession,
              loading: false,
              isAuthenticated: true
            })
          }
          return
        }

        // Si no hay cache válido, verificar con Supabase
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!isMountedRef.current) return
        
        if (error) {
          console.error('Error getting session:', error)
          setAuthState({ user: null, session: null, loading: false, isAuthenticated: false })
          cachedSession = null
          return
        }

        // Actualizar cache
        cachedSession = session
        lastSessionCheck = now

        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          isAuthenticated: !!session
        })

        // Solo redirigir si estamos en una página de auth y el usuario está autenticado
        if (session && typeof window !== 'undefined' && window.location.pathname.includes('/auth/')) {
          const locale = params?.locale || 'es'
          router.push(`/${locale}/dashboard/employees`)
        }
      } catch (error) {
        if (!isMountedRef.current) return
        console.error('Error in getSession:', error)
        setAuthState({ user: null, session: null, loading: false, isAuthenticated: false })
        cachedSession = null
      }
    }

    // Solo ejecutar la verificación inicial una vez
    if (!hasInitialized.current) {
      hasInitialized.current = true
      getSession()
    }

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMountedRef.current) return
        
        console.log('Auth state changed:', event, session?.user?.email)
        
        // Actualizar cache
        cachedSession = session
        lastSessionCheck = Date.now()
        
        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          isAuthenticated: !!session
        })

        // Manejar eventos de autenticación
        if (event === 'SIGNED_IN' && session) {
          const locale = params?.locale || 'es'
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard/')) {
            router.push(`/${locale}/dashboard/employees`)
          }
        } else if (event === 'SIGNED_OUT') {
          const locale = params?.locale || 'es'
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/')) {
            router.push(`/${locale}/auth/login`)
          }
        }
      }
    )

    return () => {
      isMountedRef.current = false
      subscription.unsubscribe()
    }
  }, [router, params])

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      await supabase.auth.signOut()
      
      // Limpiar cache
      cachedSession = null
      lastSessionCheck = 0
      
      // Limpiar preferencia de recordar
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
