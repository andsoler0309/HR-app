'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

interface SessionContextType {
  session: Session | null
  user: User | null
  isLoading: boolean
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  user: null,
  isLoading: true,
})

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

interface SessionProviderProps {
  children: React.ReactNode
  initialSession?: Session | null
}

export default function SessionProvider({ children, initialSession }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession || null)
  const [user, setUser] = useState<User | null>(initialSession?.user || null)
  const [isLoading, setIsLoading] = useState(!initialSession)

  useEffect(() => {
    // Si tenemos una sesión inicial del servidor, usar esa y no hacer verificación adicional
    if (initialSession) {
      setSession(initialSession)
      setUser(initialSession.user)
      setIsLoading(false)
      return
    }

    // Solo verificar con Supabase si no tenemos sesión inicial
    let mounted = true

    const checkAuth = async () => {
      try {
        // Use getUser() for security validation instead of getSession()
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (mounted) {
          if (error || !user) {
            console.log('No valid user found')
            setSession(null)
            setUser(null)
          } else {
            // Only set user, don't fetch session to avoid security warnings
            setUser(user)
            setSession(null) // We don't need the session for most use cases
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setIsLoading(false)
        }
      }
    }

    // Pequeño delay para evitar flash de loading si la sesión se carga rápidamente
    const timer = setTimeout(() => {
      if (mounted) {
        checkAuth()
      }
    }, 50)

    // Escuchar cambios de autenticación - pero validar usuario de forma segura
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        if (event === 'SIGNED_IN' && session) {
          // Re-validate user with getUser() for security
          const { data: { user }, error } = await supabase.auth.getUser()
          if (user && !error) {
            setUser(user)
            setSession(null) // Don't store session to avoid warnings
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
        }
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [initialSession])

  return (
    <SessionContext.Provider
      value={{
        session,
        user,
        isLoading,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}
