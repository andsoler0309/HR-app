'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface DashboardLoadingProps {
  message?: string
  subtitle?: string
}

export default function DashboardLoading({ message, subtitle }: DashboardLoadingProps) {
  const t = useTranslations('common')
  
  const loadingMessage = message || t('loading', { defaultValue: 'Loading...' })
  const loadingSubtitle = subtitle || t('preparingWorkspace', { defaultValue: 'Please wait while we prepare your workspace...' })

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="text-center space-y-6">
        {/* Logo or brand area */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
        
        {/* Loading message */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-platinum">
            {loadingMessage}
          </h2>
          <p className="text-sunset text-sm">
            {loadingSubtitle}
          </p>
        </div>
        
        {/* Loading animation */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}
