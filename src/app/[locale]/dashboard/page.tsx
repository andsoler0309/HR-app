'use client'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { DashboardProvider } from '@/context/DashboardContext'
import MetricCards from '@/components/dashboard/MetricCards'
import WorkforceTrends from '@/components/dashboard/WorkforceTrends'
import DepartmentDistribution from '@/components/dashboard/DepartmentDistribution'
import RecentActivities from '@/components/dashboard/RecentActivities'
import TimeOffCalendar from '@/components/dashboard/TimeOffCalendar'
import QuickActions from '@/components/dashboard/QuickActions'
import RecentApplications from '@/components/dashboard/RecentApplications'

const PaymentAlert = ({ status }: { status: string }) => {
  switch (status) {
    case 'success':
      return (
        <Alert className="mb-6 border-green-500 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">
            Payment successful! Your subscription has been activated.
          </AlertDescription>
        </Alert>
      );
    case 'failed':
      return (
        <Alert className="mb-6 border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            Payment failed. Please try again or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      );
    case 'pending':
      return (
        <Alert className="mb-6 border-yellow-500 bg-yellow-500/10">
          <Clock className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-500">
            Payment is pending. We'll update your subscription once the payment is confirmed.
          </AlertDescription>
        </Alert>
      );
    case 'error':
      return (
        <Alert className="mb-6 border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            An error occurred while processing your payment. Please try again later.
          </AlertDescription>
        </Alert>
      );
    default:
      return null;
  }
};

function DashboardContent() {
    const searchParams = useSearchParams()
    const paymentStatus = searchParams.get('payment')
  
    return (
      <div className="space-y-6">
        {paymentStatus && <PaymentAlert status={paymentStatus} />}
        
        <h1 className="text-3xl font-semibold text-platinum">HR Analytics Dashboard</h1>
        
        <MetricCards />
        
        <div className="grid grid-cols-3 gap-6">
          <RecentActivities />
          <TimeOffCalendar />
          <QuickActions />
        </div>
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3">
            <WorkforceTrends />
          </div>
          <div className="col-span-2">
            <DepartmentDistribution />
          </div>
        </div>
        <RecentApplications />
      </div>
    )
  }
  
  export default function DashboardPage() {
    return (
      <DashboardProvider>
        <DashboardContent />
      </DashboardProvider>
    )
  }