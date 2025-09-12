'use client'
import { useEffect, useState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'

interface WelcomeBackProps {
  isVisible: boolean
  onComplete?: () => void
}

export default function WelcomeBack({ isVisible, onComplete }: WelcomeBackProps) {
  const [step, setStep] = useState<'checking' | 'found' | 'redirecting'>('checking')

  useEffect(() => {
    if (!isVisible) return

    // Hacer las transiciones más rápidas
    const timer1 = setTimeout(() => setStep('found'), 300)
    const timer2 = setTimeout(() => setStep('redirecting'), 800)
    const timer3 = setTimeout(() => onComplete?.(), 1200)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [isVisible, onComplete])

  if (!isVisible) return null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-6">
          {step === 'checking' && (
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          )}
          {step === 'found' && (
            <CheckCircle className="w-8 h-8 mx-auto text-success animate-scale-in" />
          )}
          {step === 'redirecting' && (
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          )}
        </div>
        
        <h2 className="text-xl font-bold text-foreground mb-2">
          {step === 'checking' && 'Verificando sesión...'}
          {step === 'found' && '¡Bienvenido de vuelta!'}
          {step === 'redirecting' && 'Redirigiendo...'}
        </h2>
        
        <p className="text-muted-foreground text-sm">
          {step === 'checking' && 'Comprobando tu sesión'}
          {step === 'found' && 'Sesión activa encontrada'}
          {step === 'redirecting' && 'Llevándote al dashboard'}
        </p>
      </div>
    </div>
  )
}