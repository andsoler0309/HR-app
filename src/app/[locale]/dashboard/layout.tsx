import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import ResponsiveDashboardLayout from '@/components/ResponsiveDashboardLayout'
import DashboardLoading from '@/components/DashboardLoading'
import SessionProvider from '@/components/providers/SessionProvider'
import { constructMetadata } from '@/lib/metadata'
import { getServerSession } from '@/lib/supabase-server'

export const metadata = constructMetadata({
  title: 'Nodo',
  description: 'View and manage your HR analytics, employee data, and company metrics.',
})

export default async function DashboardLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Check session on server side
  const session = await getServerSession()

  // If no session, redirect to login with proper locale
  if (!session) {
    redirect(`/${params.locale}/auth/login`)
  }

  return (
    <SessionProvider initialSession={session}>
      <Suspense fallback={<DashboardLoading />}>
        <ResponsiveDashboardLayout>{children}</ResponsiveDashboardLayout>
      </Suspense>
    </SessionProvider>
  )
}