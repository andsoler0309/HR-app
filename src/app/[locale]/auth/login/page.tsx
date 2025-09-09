'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import {useTranslations} from 'next-intl'


type LoginFormValues = {
  email: string
  password: string
  rememberMe?: boolean
}

export default function LoginPage() {
  const t = useTranslations('LoginPage');
  const params = useParams() as { locale: string };
  

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { register, handleSubmit } = useForm<LoginFormValues>()

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
  
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })
  
      if (signInError) throw signInError
  
      if (authData.user && authData.session) {
        router.refresh()
        router.push('/dashboard/employees')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : t('errorOccurred'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-16 sm:px-8 lg:px-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Back to Home link */}
        <div className="mb-4">
          <Link
            href={`/${params.locale}`}
            className="block text-xs text-sunset hover:text-primary font-medium transition-colors"
            aria-label={t('backToHomeAria', { defaultValue: 'Back to Home' })}
          >
            <span className="mr-1" aria-hidden="true">←</span>
            {t('backToHome', { defaultValue: 'Back to Home' })}
          </Link>
        </div>
        <h2 className="text-center text-4xl font-bold text-platinum">
          {t('title')}
        </h2>
        <p className="mt-4 text-center text-base text-sunset">
          {t('subtitle')}
        </p>
      </div>
  
      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-card py-10 px-8 shadow-md sm:rounded-xl border border-card-border">
          {error && (
            <div className="mb-8 p-4 bg-error/10 rounded-lg border border-error/20 flex items-center gap-3 text-base text-error">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}
  
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3">
              <label htmlFor="email" className="block text-base font-medium text-sunset">
                {t('emailLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-6 w-6 text-sunset" />
                </div>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  required
                  className="input-base pl-12 py-3 text-base"
                  placeholder={t('enterEmailPlaceholder')}
                />
              </div>
            </div>
  
            <div className="space-y-3">
              <label htmlFor="password" className="block text-base font-medium text-sunset">
                {t('passwordLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-6 w-6 text-sunset" />
                </div>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  required
                  className="input-base pl-12 py-3 text-base"
                  placeholder={t('enterPasswordPlaceholder')}
                />
              </div>
            </div>
  
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  id="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-primary focus:ring-flame/20 border-card-border rounded"
                />
                <label htmlFor="remember-me" className="ml-3 block text-base text-sunset">
                  {t('rememberMe')}
                </label>
              </div>
  
              <Link 
                href="/auth/forgot-password" 
                className="text-base font-medium text-primary hover:text-vanilla transition-colors"
              >
                {t('forgotPassword')}
              </Link>
            </div>
  
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center items-center gap-3 py-3 px-4 rounded-lg shadow-sm text-base font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                t('signInButton')
              )}
            </button>
          </form>
  
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-card-border" />
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-4 bg-card text-text-muted">
                  {t('noAccount')}
                </span>
              </div>
            </div>
  
            <div className="mt-8">
              <Link
                href="/auth/register"
                className="btn-secondary w-full inline-flex justify-center py-3 px-4 border border-card-border rounded-lg text-base font-medium"
              >
                {t('createAccount')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
