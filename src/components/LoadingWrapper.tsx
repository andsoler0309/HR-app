'use client'

import { Suspense } from 'react'
import DashboardLoading from './DashboardLoading'

interface LoadingWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function LoadingWrapper({ children, fallback }: LoadingWrapperProps) {
  return (
    <Suspense fallback={fallback || <DashboardLoading />}>
      {children}
    </Suspense>
  )
}
