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
let cachedUser: User | null = null
let lastUserCheck = 0
const USER_CACHE_DURATION = 30000 // 30 segundos

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
    
    const checkAuth = async () => {
      try {
        // Verificar cache primero
        const now = Date.now()
        if (cachedUser && (now - lastUserCheck) < USER_CACHE_DURATION) {
          if (isMountedRef.current) {
            setAuthState({
              user: cachedUser,
              session: null, // Don't cache session for security
              loading: false,
              isAuthenticated: true
            })
          }
          return
        }

        // Usar getUser() para verificación segura sin depender de sessions inseguras
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (!isMountedRef.current) return
        
        if (error || !user) {
          setAuthState({ user: null, session: null, loading: false, isAuthenticated: false })
          cachedUser = null
          return
        }

        // Actualizar cache solo del usuario
        cachedUser = user
        lastUserCheck = now

        setAuthState({
          user,
          session: null, // Don't store session to avoid security warnings
          loading: false,
          isAuthenticated: true
        })

        // Solo redirigir si estamos en una página de auth y el usuario está autenticado
        if (user && typeof window !== 'undefined' && window.location.pathname.includes('/auth/')) {
          const locale = params?.locale || 'es'
          router.push(`/${locale}/dashboard/employees`)
        }
      } catch (error) {
        if (!isMountedRef.current) return
        console.error('Error in checkAuth:', error)
        setAuthState({ user: null, session: null, loading: false, isAuthenticated: false })
        cachedUser = null
      }
    }

    // Solo ejecutar la verificación inicial una vez
    if (!hasInitialized.current) {
      hasInitialized.current = true
      checkAuth()
    }

    // Escuchar cambios de autenticación - pero validar con getUser() en lugar de confiar en session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMountedRef.current) return
        
        // Para mayor seguridad, re-verificar con getUser() en lugar de usar session directamente
        if (event === 'SIGNED_IN' && session) {
          const { data: { user }, error } = await supabase.auth.getUser()
          if (user && !error) {
            cachedUser = user
            lastUserCheck = Date.now()
            
            setAuthState({
              user,
              session: null,
              loading: false,
              isAuthenticated: true
            })

            const locale = params?.locale || 'es'
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/dashboard/')) {
              router.push(`/${locale}/dashboard/employees`)
            }
          }
        } else if (event === 'SIGNED_OUT') {
          cachedUser = null
          lastUserCheck = 0
          
          setAuthState({
            user: null,
            session: null,
            loading: false,
            isAuthenticated: false
          })

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
      cachedUser = null
      lastUserCheck = 0
      
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
