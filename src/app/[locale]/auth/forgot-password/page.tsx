'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

type ForgotPasswordFormValues = {
  email: string
}

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPasswordPage')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { register, handleSubmit } = useForm<ForgotPasswordFormValues>()

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true)
      setError(null)
      setSuccessMessage(null)

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      )

      if (resetError) throw resetError

      setSuccessMessage(t('checkEmail'))
    } catch (err) {
      console.error('Password reset error:', err)
      setError(err instanceof Error ? err.message : t('errorOccurred'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-16 sm:px-8 lg:px-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
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

          {successMessage && (
            <div className="mb-8 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20 flex items-center gap-3 text-base text-emerald-500">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {successMessage}
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

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center items-center gap-3 py-3 px-4 rounded-lg shadow-sm text-base font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('sending')}
                </>
              ) : (
                t('sendResetLink')
              )}
            </button>
          </form>

          <div className="mt-8">
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 text-primary hover:text-vanilla transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}