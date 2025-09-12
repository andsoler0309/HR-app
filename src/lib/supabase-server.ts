import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { cache } from 'react'

// Create server component client (cached to avoid multiple instances)
export const createServerClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
})

// Server-side session check utility
export async function getServerSession() {
  try {
    const supabase = createServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting server session:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('Error in getServerSession:', error)
    return null
  }
}
