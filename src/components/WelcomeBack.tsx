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

    const timer1 = setTimeout(() => setStep('found'), 500)
    const timer2 = setTimeout(() => setStep('redirecting'), 1500)
    const timer3 = setTimeout(() => onComplete?.(), 2500)

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
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          )}
          {step === 'found' && (
            <CheckCircle className="w-12 h-12 mx-auto text-success animate-scale-in" />
          )}
          {step === 'redirecting' && (
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-platinum mb-2">
          {step === 'checking' && 'Verificando sesión...'}
          {step === 'found' && '¡Bienvenido de vuelta!'}
          {step === 'redirecting' && 'Redirigiendo...'}
        </h2>
        
        <p className="text-sunset">
          {step === 'checking' && 'Comprobando si ya has iniciado sesión'}
          {step === 'found' && 'Encontramos tu sesión activa'}
          {step === 'redirecting' && 'Te llevamos a tu panel de control'}
        </p>
      </div>
    </div>
  )
}
