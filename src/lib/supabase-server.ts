import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { cache } from 'react'

// Create server component client (cached to avoid multiple instances)
export const createServerClient = cache(() => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
})

// Server-side user check utility (more secure than session)
export async function getServerUser() {
  try {
    const supabase = createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting server user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error in getServerUser:', error)
    return null
  }
}

// Server-side session check utility (keep for backward compatibility, but prefer getServerUser)
export async function getServerSession() {
  try {
    const supabase = createServerClient()
    // First validate user for security
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('No valid user found:', userError)
      return null
    }
    
    // Only get session if user is valid
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
