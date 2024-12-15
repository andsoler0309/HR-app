'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useDashboard } from '@/context/DashboardContext'
import { Skeleton } from "@/components/ui/skeleton"

export default function WorkforceTrends() {
  const { workforceTrends, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workforce Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Workforce Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={workforceTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#8884d8" 
                fill="#8884d8" 
                name="Employees"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}