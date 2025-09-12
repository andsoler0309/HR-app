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
    // If we don't have an initial session, get it from Supabase
    if (!initialSession) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
        setIsLoading(false)
      })
    } else {
      setIsLoading(false)
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
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
