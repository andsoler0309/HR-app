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

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, company')  // We select id and company name
          .eq('id', user.id)
          .single()

        if (profileError) {
          throw profileError
        }

        // The profile.id IS the company_id
        setCompanyId(profile.id)
        setCompanyName(profile.company)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch company info'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanyInfo()
  }, [])

  return { companyId, companyName, isLoading, error }
}