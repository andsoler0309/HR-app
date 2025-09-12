import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Create the main Supabase client 
export const supabase = createClientComponentClient()

// Function to configure session persistence based on rememberMe option
export const configureSessionPersistence = (rememberMe: boolean) => {
  // This will be handled in the login function
  if (typeof window !== 'undefined') {
    const storageKey = 'supabase.auth.remember-me'
    if (rememberMe) {
      localStorage.setItem(storageKey, 'true')
    } else {
      localStorage.removeItem(storageKey)
      // Clear any existing session if user doesn't want to be remembered
      sessionStorage.removeItem('supabase.auth.token')
    }
  }
}