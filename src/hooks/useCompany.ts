import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useCompany() {
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchCompanyInfo() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Auth error:', userError)
          throw userError
        }
        
        if (!user) {
          throw new Error('No authenticated user')
        }

        console.log('Fetching profile for user:', user.id)

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, company_name')  // CORRECTED: Using company_name
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          
          // If profile doesn't exist, it might need to be created
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found, creating new profile...')
            
            // Try to create a profile for the user
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || '',
                company_name: user.user_metadata?.company_name || 'My Company'
              }])
              .select('id, company_name')
              .single()
            
            if (createError) {
              console.error('Error creating profile:', createError)
              throw createError
            }
            
            console.log('New profile created:', newProfile)
            setCompanyId(newProfile.id)
            setCompanyName(newProfile.company_name)
            return
          }
          
          throw profileError
        }

        // The profile.id IS the company_id
        setCompanyId(profile.id)
        setCompanyName(profile.company_name) // CORRECTED: Using company_name
      } catch (err) {
        console.error('Error in fetchCompanyInfo:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch company info'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyInfo()
  }, [])

  return { companyId, companyName, isLoading, error }
}