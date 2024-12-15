import '@/app/globals.css'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}