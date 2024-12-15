'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { useDashboard } from '@/context/DashboardContext'
import { Skeleton } from "@/components/ui/skeleton"

export default function MetricCards() {
  const { metrics, isLoading, error } = useDashboard()

  const metricConfigs = [
    { 
      title: 'Total Employees', 
      value: metrics?.totalEmployees || 0, 
      icon: Users,
      trend: metrics?.trends.employees,
      subtitle: 'from last month',
      color: 'text-blue-500'
    },
    { 
      title: 'Open Positions', 
      value: metrics?.openPositions || 0, 
      icon: FileText,
      trend: metrics?.trends.positions,
      subtitle: 'from last month',
      color: 'text-green-500'
    },
    { 
      title: 'Upcoming Events', 
      value: metrics?.upcomingEvents || 0, 
      icon: Calendar,
      trend: metrics?.trends.events,
      subtitle: 'from last month',
      color: 'text-purple-500'
    },
    { 
      title: 'Time Off Requests', 
      value: metrics?.timeOffRequests || 0, 
      icon: Clock,
      trend: metrics?.trends.requests,
      subtitle: 'from last month',
      color: 'text-orange-500'
    }
  ]

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-lg">
        Error loading metrics: {error}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-4 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {metricConfigs.map((metric) => (
        <Card 
          key={metric.title} 
          className="transition-all duration-300 hover:shadow-lg hover:scale-105"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            <metric.icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.trend && (
                <div className={`flex items-center text-xs ${
                  metric.trend.isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {metric.trend.isPositive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {metric.trend.value.toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}