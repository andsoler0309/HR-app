// src/components/time-off/EditPolicyModal.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/hooks/useCompany'
import type { TimeOffPolicy } from '@/types/timeoff'
import { useTranslations } from 'next-intl' 

const policySchema = z.object({
  name: z.string().min(3, 'editPolicyModal.errors.nameMin'), 
  type: z.enum(['VACATION', 'SICK_LEAVE', 'PERSONAL', 'BEREAVEMENT', 'OTHER'], {
    errorMap: () => ({ message: 'editPolicyModal.errors.invalidType' }), 
  }),
  days_per_year: z.number().min(0, 'editPolicyModal.errors.daysPerYearMin'), 
  carries_forward: z.boolean().optional(),
  max_carry_forward: z.number().min(0, 'editPolicyModal.errors.maxCarryForwardMin').optional(), 
  description: z.string().max(500, 'editPolicyModal.errors.descriptionMax').optional(), 
}).refine((data) => {
  if (data.carries_forward && data.max_carry_forward === undefined) {
    return false;
  }
  return true;
}, {
  message: "editPolicyModal.errors.maxCarryForwardRequired", 
  path: ["max_carry_forward"]
});

// Infer the form values type from the schema
type PolicyFormValues = z.infer<typeof policySchema>

// Define the props for the modal component
interface EditPolicyModalProps {
  isOpen: boolean
  onClose: () => void
  policy: TimeOffPolicy
  onSuccess: () => void
}

export default function EditPolicyModal({ isOpen, onClose, policy, onSuccess }: EditPolicyModalProps) {
  const t = useTranslations('TimeOffPage'); // Use 'TimeOffPage' namespace
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { companyId } = useCompany()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      name: policy.name,
      type: policy.type,
      days_per_year: policy.days_per_year,
      carries_forward: policy.carries_forward || false,
      max_carry_forward: policy.carries_forward ? policy.max_carry_forward || 0 : 0,
      description: policy.description || '',
    },
  })

  const carriesForward = watch('carries_forward')

  const onSubmit = async (data: PolicyFormValues) => {
    try {
      setIsLoading(true)
      setError(null)

      // Update the policy
      const { error: updateError } = await supabase
        .from('time_off_policies')
        .update({
          name: data.name,
          type: data.type,
          days_per_year: data.days_per_year,
          carries_forward: data.carries_forward || false,
          max_carry_forward: data.carries_forward ? data.max_carry_forward || 0 : 0,
          description: data.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', policy.id)

      if (updateError) throw updateError

      // Optionally, update related time_off_balances if days_per_year or carries_forward changed
      // This requires fetching related balances and updating them accordingly

      reset()
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unexpected')) 
    } finally {
      setIsLoading(false)
    }
  }

  // If the modal is not open, do not render anything
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-lg overflow-y-auto max-h-full border border-card-border shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-platinum">{t('editPolicyModal.title')}</h2> 
          <button onClick={onClose} className="text-sunset hover:text-flame text-2xl leading-none">
            &times;
          </button>
        </div>
   
        {error && (
          <div className="mb-4 p-4 text-sm text-error bg-error/10 rounded-lg">
            {error}
          </div>
        )}
   
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Policy Name */}
          <div>
            <label className="block text-sm font-medium text-sunset">{t('editPolicyModal.fields.policyName')}</label> 
            <input
              {...register('name')}
              type="text"
              className={`input-base mt-1 block w-full ${
                errors.name ? 'border-error' : 'border-card-border'
              }`}
              placeholder={t('editPolicyModal.placeholders.policyName')} 
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-error">{t(errors.name.message as string)}</p> 
            )}
          </div>
   
          {/* Policy Type */}
          <div>
            <label className="block text-sm font-medium text-sunset">{t('editPolicyModal.fields.policyType')}</label> 
            <select
              {...register('type')}
              className={`input-base mt-1 block w-full ${
                errors.type ? 'border-error' : 'border-card-border'
              }`}
              disabled={isLoading}
            >
              <option value="">{t('editPolicyModal.placeholders.selectPolicyType')}</option> 
              <option value="VACATION">{t('editPolicyModal.options.vacation')}</option> 
              <option value="SICK_LEAVE">{t('editPolicyModal.options.sickLeave')}</option> 
              <option value="PERSONAL">{t('editPolicyModal.options.personal')}</option> 
              <option value="BEREAVEMENT">{t('editPolicyModal.options.bereavement')}</option> 
              <option value="OTHER">{t('editPolicyModal.options.other')}</option> 
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-error">{t(errors.type.message as string)}</p> 
            )}
          </div>
   
          {/* Days Per Year */}
          <div>
            <label className="block text-sm font-medium text-sunset">{t('editPolicyModal.fields.daysPerYear')}</label> 
            <input
              {...register('days_per_year', { valueAsNumber: true })}
              type="number"
              className={`input-base mt-1 block w-full ${
                errors.days_per_year ? 'border-error' : 'border-card-border'
              }`}
              placeholder={t('editPolicyModal.placeholders.daysPerYear')} 
              min="0"
              disabled={isLoading}
            />
            {errors.days_per_year && (
              <p className="mt-1 text-sm text-error">{t(errors.days_per_year.message as string)}</p> 
            )}
          </div>
   
          {/* Carries Forward */}
          <div className="flex items-center">
            <input
              {...register('carries_forward')}
              type="checkbox"
              className="h-4 w-4 text-flame border-card-border rounded focus:ring-flame/20"
              disabled={isLoading}
            />
            <label className="ml-2 block text-sm text-sunset">{t('editPolicyModal.fields.carriesForward')}</label> 
          </div>
   
          {/* Max Carry Forward */}
          {carriesForward && (
            <div>
              <label className="block text-sm font-medium text-sunset">{t('editPolicyModal.fields.maxCarryForward')}</label> 
              <input
                {...register('max_carry_forward', { valueAsNumber: true })}
                type="number"
                className={`input-base mt-1 block w-full ${
                  errors.max_carry_forward ? 'border-error' : 'border-card-border'
                }`}
                placeholder={t('editPolicyModal.placeholders.maxCarryForward')} 
                min="0"
                disabled={isLoading}
              />
              {errors.max_carry_forward && (
                <p className="mt-1 text-sm text-error">
                  {t(errors.max_carry_forward.message as string)}
                </p>
              )}
            </div>
          )}
   
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-sunset">{t('editPolicyModal.fields.description')}</label> 
            <textarea
              {...register('description')}
              rows={3}
              className={`input-base mt-1 block w-full ${
                errors.description ? 'border-error' : 'border-card-border'
              }`}
              placeholder={t('editPolicyModal.placeholders.description')} 
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error">{t(errors.description.message as string)}</p>
            )}
          </div>
   
          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 rounded-md disabled:opacity-50"
              disabled={isLoading}
            >
              {t('editPolicyModal.buttons.cancel')} 
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary px-4 py-2 rounded-md disabled:opacity-50"
            >
              {isLoading ? t('editPolicyModal.buttons.updating') : t('editPolicyModal.buttons.updatePolicy')} 
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
