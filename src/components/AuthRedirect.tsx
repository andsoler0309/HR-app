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

  useEffect(() => {
    if (!loading && isAuthenticated) {
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
  }, [loading, isAuthenticated, router, params])

  const handleWelcomeComplete = () => {
    const locale = params?.locale || 'es'
    router.push(`/${locale}/dashboard/employees`)
  }

  // Show welcome back animation for remembered users
  if (showWelcome && isAuthenticated) {
    return <WelcomeBack isVisible={true} onComplete={handleWelcomeComplete} />
  }

  // Show loading while checking authentication
  if (loading) {
    return <WelcomeBack isVisible={true} />
  }

  // If authenticated but not showing welcome, redirect immediately
  if (isAuthenticated) {
    return <WelcomeBack isVisible={true} onComplete={handleWelcomeComplete} />
  }

  // If not authenticated, show the landing page
  return <>{children}</>
}
