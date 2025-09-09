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
        const { data: { user } } = await supabase.auth.getUser()
        
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
          throw profileError
        }

        console.log('Profile data:', profile)

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