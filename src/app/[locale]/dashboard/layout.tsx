import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import ResponsiveDashboardLayout from '@/components/ResponsiveDashboardLayout'
import DashboardLoading from '@/components/DashboardLoading'
import { constructMetadata } from '@/lib/metadata'

export const metadata = constructMetadata({
  title: 'NodoHR',
  description: 'View and manage your HR analytics, employee data, and company metrics.',
})

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ 
    cookies: () => cookieStore 
  })
  const response = await supabase.auth.getSession()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <Suspense fallback={<DashboardLoading />}>
      <ResponsiveDashboardLayout>{children}</ResponsiveDashboardLayout>
    </Suspense>
  )
}