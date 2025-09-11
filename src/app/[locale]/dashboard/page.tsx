'use client'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
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
import TourGuide from '@/components/shared/TourGuide'
import HelpWidget from '@/components/shared/HelpWidget'
import OnboardingProgress from '@/components/shared/OnboardingProgress'
import WelcomeModal from '@/components/shared/WelcomeModal'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useHelp } from '@/context/HelpContext'
import { dashboardTour } from '@/lib/tour-configs'

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
    const { shouldShowOnboarding, markStepComplete, onboardingState } = useOnboarding()
    const { tourIsVisible, helpIsVisible, setTourVisible, setHelpVisible } = useHelp()
    const [showWelcome, setShowWelcome] = useState(false)

    // Show welcome modal for completely new users
    useEffect(() => {
      if (!onboardingState.hasCompletedTour && onboardingState.currentStep === 'welcome') {
        setShowWelcome(true)
      }
    }, [onboardingState])

    // Listen for tour requests from navbar
    useEffect(() => {
      if (tourIsVisible) {
        setTourVisible(true)
      }
    }, [tourIsVisible])
  
    const handleStartStep = (step: string) => {
      if (step === 'tour') {
        setTourVisible(true)
      }
      // Handle other onboarding steps here
    }

    const handleTourComplete = () => {
      markStepComplete('hasCompletedTour')
      setTourVisible(false)
    }

    const handleWelcomeStartTour = () => {
      setShowWelcome(false)
      setTourVisible(true)
    }
  
    return (
      <div className="space-y-6">
        {paymentStatus && <PaymentAlert status={paymentStatus} />}
        
        {/* Onboarding Progress */}
        {shouldShowOnboarding() && (
          <OnboardingProgress onStartStep={handleStartStep} />
        )}
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-platinum">HR Analytics Dashboard</h1>
            <p className="text-sm text-sunset mt-1 sm:hidden">Panel de control principal</p>
          </div>
        </div>
        
        <div className="metric-cards">
          <MetricCards />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="recent-activities">
            <RecentActivities />
          </div>
          <TimeOffCalendar />
          <div className="quick-actions">
            <QuickActions />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="lg:col-span-3">
            <WorkforceTrends />
          </div>
          <div className="lg:col-span-2">
            <DepartmentDistribution />
          </div>
        </div>
        <RecentApplications />

        {/* Welcome Modal */}
        <WelcomeModal
          isOpen={showWelcome}
          onClose={() => setShowWelcome(false)}
          onStartTour={handleWelcomeStartTour}
        />

        {/* Tour Guide */}
        <TourGuide
          steps={dashboardTour}
          isOpen={tourIsVisible}
          onClose={() => setTourVisible(false)}
          onComplete={handleTourComplete}
        />

        {/* Help Widget */}
        <div className="help-widget">
          <HelpWidget 
            currentPage="dashboard" 
            forceOpen={helpIsVisible}
            onOpenChange={(isOpen) => {
              if (!isOpen) setHelpVisible(false);
            }}
          />
        </div>
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