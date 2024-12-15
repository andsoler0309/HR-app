// src/components/time-off/RequestTimeOffModal.tsx
'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { differenceInBusinessDays, parseISO } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { X, Calendar, Clock, AlertCircle } from 'lucide-react'
import type { TimeOffPolicy } from '@/types/timeoff'
import { useTranslations } from 'next-intl'

const requestSchema = z.object({
  policy_id: z.string().uuid('requestTimeOffModal.errors.selectLeaveType'),
  start_date: z.string(),
  end_date: z.string(),
  reason: z.string().min(5, 'requestTimeOffModal.errors.reasonMin').max(500, 'requestTimeOffModal.errors.reasonMax'),
  type: z.enum(['VACATION', 'SICK_LEAVE', 'PERSONAL', 'BEREAVEMENT', 'OTHER'])
})

type RequestFormValues = z.infer<typeof requestSchema>

interface RequestTimeOffModalProps {
  isOpen: boolean
  onClose: () => void
  policies: TimeOffPolicy[]
  onSuccess: () => void
}

export default function RequestTimeOffModal({
  isOpen,
  onClose,
  policies,
  onSuccess
}: RequestTimeOffModalProps) {
  const t = useTranslations('TimeOffPage')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema)
  })

  const startDate = watch('start_date')
  const endDate = watch('end_date')

  const calculateDays = () => {
    if (startDate && endDate) {
      return differenceInBusinessDays(parseISO(endDate), parseISO(startDate)) + 1
    }
    return 0
  }

  const onSubmit = async (data: RequestFormValues) => {
    try {
      setIsLoading(true)
      setError(null)

      const days = calculateDays()

      const { data: balances, error: balanceError } = await supabase
        .from('time_off_balances')
        .select('*')
        .eq('policy_id', data.policy_id)
        .single()

      if (balanceError) throw balanceError

      const availableDays = balances.total_days - balances.used_days + balances.carried_over

      if (days > availableDays) {
        throw new Error(t('requestTimeOffModal.errors.insufficientBalance'))
      }

      const { error: requestError } = await supabase
        .from('time_off_requests')
        .insert([
          {
            ...data,
            days,
            status: 'PENDING'
          }
        ])

      if (requestError) throw requestError

      reset()
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('requestTimeOffModal.errors.unexpected'))
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">{t('requestTimeOffModal.title')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 p-4 text-sm text-red-800 bg-red-50 rounded-lg border border-red-100">
            <AlertCircle size={16} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('requestTimeOffModal.fields.leaveType')}
            </label>
            <select
              {...register('policy_id')}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            >
              <option value="">{t('requestTimeOffModal.placeholders.selectLeaveType')}</option>
              {policies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.name} ({policy.days_per_year} {t('units.days')}/year)
                </option>
              ))}
            </select>
            {errors.policy_id && (
              <p className="mt-1.5 text-sm text-red-600">{t(errors.policy_id.message as string)}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('requestTimeOffModal.fields.startDate')}
              </label>
              <div className="relative">
                <input
                  {...register('start_date')}
                  type="date"
                  className="w-full rounded-lg border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-gray-700 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  min={new Date().toISOString().split('T')[0]}
                />
                <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
              </div>
              {errors.start_date && (
                <p className="mt-1.5 text-sm text-red-600">{t(errors.start_date.message as string)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('requestTimeOffModal.fields.endDate')}
              </label>
              <div className="relative">
                <input
                  {...register('end_date')}
                  type="date"
                  className="w-full rounded-lg border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-gray-700 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  min={startDate}
                />
                <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
              </div>
              {errors.end_date && (
                <p className="mt-1.5 text-sm text-red-600">{t(errors.end_date.message as string)}</p>
              )}
            </div>
          </div>

          {startDate && endDate && (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-100">
              <Clock size={16} className="shrink-0" />
              <p className="text-sm">
                {t('requestTimeOffModal.labels.totalWorkingDays')}: <span className="font-semibold">{calculateDays()}</span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('requestTimeOffModal.fields.reason')}
            </label>
            <textarea
              {...register('reason')}
              rows={3}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
              placeholder={t('requestTimeOffModal.placeholders.reason')}
            />
            {errors.reason && (
              <p className="mt-1.5 text-sm text-red-600">{t(errors.reason.message as string)}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors font-medium"
            >
              {t('requestTimeOffModal.buttons.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors font-medium"
            >
              {isLoading ? t('requestTimeOffModal.buttons.submitting') : t('requestTimeOffModal.buttons.submitRequest')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
