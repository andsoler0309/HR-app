import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useCompany() {
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true
    
    async function fetchCompanyInfo() {
      try {
        // Only run on client side
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Auth error:', userError)
          if (mounted) {
            setError(userError)
            setIsLoading(false)
          }
          return
        }
        
        if (!user) {
          console.error('No authenticated user')
          if (mounted) {
            setError(new Error('No authenticated user'))
            setIsLoading(false)
          }
          return
        }

        // Try to get existing profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, email, company_name')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error:', profileError)
          
          // If profile doesn't exist, create one
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found, creating new profile...')
            
            const newProfileData = {
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
              company_name: 'My Company'
            }
            
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([newProfileData])
              .select('id, full_name, company_name')
              .single()
            
            if (createError) {
              console.error('Error creating profile:', createError)
              if (mounted) {
                setError(createError)
                setIsLoading(false)
              }
              return
            }
            
            console.log('New profile created:', newProfile)
            if (mounted) {
              setCompanyId(newProfile.id)
              setCompanyName(newProfile.company_name || 'My Company')
              setIsLoading(false)
            }
            return
          }
          
          // Other profile errors
          if (mounted) {
            setError(profileError)
            setIsLoading(false)
          }
          return
        }

        if (mounted) {
          setCompanyId(profile.id)
          setCompanyName(profile.company_name || profile.full_name || 'My Company')
          setIsLoading(false)
        }
        
      } catch (err) {
        console.error('Error in fetchCompanyInfo:', err)
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch company info'))
          setIsLoading(false)
        }
      }
    }

    fetchCompanyInfo()
    
    return () => {
      mounted = false
    }
  }, [])

  return { companyId, companyName, isLoading, error }
}