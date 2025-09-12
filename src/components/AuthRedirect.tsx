'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, useParams } from 'next/navigation'
import WelcomeBack from './WelcomeBack'

interface AuthRedirectProps {
  children: React.ReactNode
}

export default function AuthRedirect({ children }: AuthRedirectProps) {
  const { loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams() as { locale: string }
  const [showWelcome, setShowWelcome] = useState(false)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    // Mark that we've completed the initial auth check
    if (!loading) {
      setHasCheckedAuth(true)
    }
  }, [loading])

  useEffect(() => {
    if (!loading && isAuthenticated && hasCheckedAuth) {
      // Check if this is a returning user (has remember me set)
      const isRemembered = typeof window !== 'undefined' && 
        localStorage.getItem('supabase.auth.remember-me') === 'true'
      
      if (isRemembered) {
        setShowWelcome(true)
      } else {
        // Direct redirect for new sessions
        const locale = params?.locale || 'es'
        router.push(`/${locale}/dashboard/employees`)
      }
    }
  }, [loading, isAuthenticated, hasCheckedAuth, router, params])

  const handleWelcomeComplete = () => {
    const locale = params?.locale || 'es'
    router.push(`/${locale}/dashboard/employees`)
  }

  // Show welcome back animation for remembered users
  if (showWelcome && isAuthenticated && hasCheckedAuth) {
    return <WelcomeBack isVisible={true} onComplete={handleWelcomeComplete} />
  }

  // Show loading while checking authentication
  if (loading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // If authenticated but not showing welcome, redirect immediately
  if (isAuthenticated && hasCheckedAuth) {
    return <WelcomeBack isVisible={true} onComplete={handleWelcomeComplete} />
  }

  // If not authenticated, show the landing page
  return <>{children}</>
}
