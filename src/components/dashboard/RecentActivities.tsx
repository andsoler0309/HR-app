'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboard } from '@/context/DashboardContext'
import { formatDistanceToNow } from 'date-fns'
import { Skeleton } from "@/components/ui/skeleton"

export default function RecentActivities() {
  const { recentActivities, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {recentActivities.map((activity) => (
            <li key={activity.id} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-gray-500">{activity.department}</p>
              </div>
              <span className="text-sm text-gray-400">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}