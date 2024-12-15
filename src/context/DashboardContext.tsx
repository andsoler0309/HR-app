// context/DashboardContext.tsx

'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import * as queries from '@/lib/queries'

interface Metrics {
  totalEmployees: number
  openPositions: number
  upcomingEvents: number
  timeOffRequests: number
  trends: {
    employees: { value: number; isPositive: boolean }
    positions: { value: number; isPositive: boolean }
    events: { value: number; isPositive: boolean }
    requests: { value: number; isPositive: boolean }
  }
}

interface DashboardContextType {
  metrics: Metrics
  recentActivities: any[]
  timeOffEvents: any[]
  workforceTrends: any[]
  departmentDistribution: any[]
  recentApplications: any[]
  isLoading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Omit<DashboardContextType, 'refreshData' | 'isLoading' | 'error'>>({
    metrics: {
      totalEmployees: 0,
      openPositions: 0,
      upcomingEvents: 0,
      timeOffRequests: 0,
      trends: {
        employees: { value: 0, isPositive: true },
        positions: { value: 0, isPositive: true },
        events: { value: 0, isPositive: true },
        requests: { value: 0, isPositive: true }
      }
    },
    recentActivities: [],
    timeOffEvents: [],
    workforceTrends: [],
    departmentDistribution: [],
    recentApplications: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchDashboardData() {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const [
        metrics,
        activities,
        timeOff,
        trends,
        departments,
        applications
      ] = await Promise.all([
        queries.getDashboardMetrics(user.id),
        queries.getRecentActivities(user.id),
        queries.getTimeOffEvents(user.id),
        queries.getWorkforceTrends(user.id),
        queries.getDepartmentDistribution(user.id),
        queries.getRecentApplications(user.id)
      ])

      setData({
        metrics,
        recentActivities: activities,
        timeOffEvents: timeOff,
        workforceTrends: trends,
        departmentDistribution: departments,
        recentApplications: applications
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        ...data,
        isLoading,
        error,
        refreshData: fetchDashboardData
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}