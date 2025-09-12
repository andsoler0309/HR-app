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
  const [isLoading, setIsLoading] = useState(!initialSession)

  useEffect(() => {
    // Si tenemos una sesión inicial del servidor, usar esa y no hacer verificación adicional
    if (initialSession) {
      setSession(initialSession)
      setIsLoading(false)
      return
    }

    // Solo verificar con Supabase si no tenemos sesión inicial
    let mounted = true

    const getSession = async () => {
      try {
        // Use getUser() for security validation
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (mounted) {
          if (error || !user) {
            console.log('No valid session found')
            setSession(null)
          } else {
            // Get the actual session if user is valid
            const { data: { session: currentSession } } = await supabase.auth.getSession()
            setSession(currentSession)
          }
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Session error:', error)
        if (mounted) {
          setSession(null)
          setIsLoading(false)
        }
      }
    }

    // Pequeño delay para evitar flash de loading si la sesión se carga rápidamente
    const timer = setTimeout(() => {
      if (mounted) {
        getSession()
      }
    }, 50)

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session)
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
        user: session?.user || null,
        isLoading,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}
