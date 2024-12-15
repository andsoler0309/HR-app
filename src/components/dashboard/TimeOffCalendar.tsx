'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboard } from '@/context/DashboardContext'
import { format } from 'date-fns'
import { Skeleton } from "@/components/ui/skeleton"

export default function TimeOffCalendar() {
  const { timeOffEvents, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Time Off Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-l-4 border-blue-500 pl-4">
                <Skeleton className="h-4 w-[150px] mb-2" />
                <Skeleton className="h-4 w-[100px] mb-2" />
                <Skeleton className="h-4 w-[120px]" />
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
        <CardTitle>Time Off Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {timeOffEvents.map((event) => (
            <li key={event.id} className="border-l-4 border-blue-500 pl-4">
              <p className="font-medium">{`${event.employee.first_name} ${event.employee.last_name}`}</p>
              <p className="text-sm text-gray-500">{event.department.name}</p>
              <p className="text-sm text-gray-400">
                {format(new Date(event.start_date), 'MMM d')} - {format(new Date(event.end_date), 'MMM d')}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}