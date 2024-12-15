'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboard } from '@/context/DashboardContext'
import { format } from 'date-fns'
import { Skeleton } from "@/components/ui/skeleton"

export default function RecentApplications() {
  const { recentApplications, isLoading } = useDashboard()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
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
        <CardTitle>Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Applied</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentApplications.map((application) => (
              <TableRow key={application.id} className="hover:bg-gray-50 transition-colors duration-200">
                <TableCell className="font-medium">{application.applicant_name}</TableCell>
                <TableCell>{application.position}</TableCell>
                <TableCell>{application.department.name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    application.status === 'IN_REVIEW' ? 'bg-blue-100 text-blue-800' :
                    application.status === 'INTERVIEWED' ? 'bg-purple-100 text-purple-800' :
                    application.status === 'OFFERED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {application.status.replace('_', ' ')}
                  </span>
                </TableCell>
                <TableCell>{format(new Date(application.created_at), 'MMM d, yyyy')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}