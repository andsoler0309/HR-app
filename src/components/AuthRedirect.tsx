'use client'
import { useEffect, useState, useRef } from 'react'
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Marcar que hemos completado la verificación inicial después de un tiempo mínimo
    if (!loading) {
      // Añadir un pequeño delay para evitar flashes, pero no demasiado
      const timer = setTimeout(() => {
        setHasCheckedAuth(true)
      }, 100) // Solo 100ms de delay
      
      return () => clearTimeout(timer)
    }
  }, [loading])

  useEffect(() => {
    if (!loading && isAuthenticated && hasCheckedAuth) {
      // Verificar si es un usuario que regresa
      const isRemembered = typeof window !== 'undefined' && 
        localStorage.getItem('supabase.auth.remember-me') === 'true'
      
      if (isRemembered) {
        setShowWelcome(true)
        // Auto-redirigir después de un tiempo corto si es usuario recordado
        timeoutRef.current = setTimeout(() => {
          const locale = params?.locale || 'es'
          router.push(`/${locale}/dashboard/employees`)
        }, 2000) // 2 segundos para usuarios recordados
      } else {
        // Redirección directa para nuevas sesiones
        const locale = params?.locale || 'es'
        router.push(`/${locale}/dashboard/employees`)
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [loading, isAuthenticated, hasCheckedAuth, router, params])

  const handleWelcomeComplete = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    const locale = params?.locale || 'es'
    router.push(`/${locale}/dashboard/employees`)
  }

  // Mostrar animación de bienvenida para usuarios recordados
  if (showWelcome && isAuthenticated && hasCheckedAuth) {
    return <WelcomeBack isVisible={true} onComplete={handleWelcomeComplete} />
  }

  // Mostrar loading solo si realmente está cargando
  if (loading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si está autenticado pero no mostrando welcome, redirigir inmediatamente
  if (isAuthenticated && hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse h-8 w-8 bg-primary rounded-full mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, mostrar la página de aterrizaje
  return <>{children}</>
}
