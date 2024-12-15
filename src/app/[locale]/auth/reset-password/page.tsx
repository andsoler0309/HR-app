'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Lock, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

type ResetPasswordFormValues = {
  password: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const t = useTranslations('ResetPasswordPage')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { register, handleSubmit, watch } = useForm<ResetPasswordFormValues>()

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (data.password !== data.confirmPassword) {
      setError(t('passwordsDoNotMatch'))
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password
      })

      if (updateError) throw updateError

      // Password updated successfully, redirect to login
      router.push('/auth/login')
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

          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-3">
              <label htmlFor="password" className="block text-base font-medium text-sunset">
                {t('newPasswordLabel')}
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
                  placeholder={t('enterNewPasswordPlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="confirmPassword" className="block text-base font-medium text-sunset">
                {t('confirmPasswordLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-6 w-6 text-sunset" />
                </div>
                <input
                  {...register('confirmPassword')}
                  id="confirmPassword"
                  type="password"
                  required
                  className="input-base pl-12 py-3 text-base"
                  placeholder={t('confirmPasswordPlaceholder')}
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
                  {t('updating')}
                </>
              ) : (
                t('updatePassword')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}