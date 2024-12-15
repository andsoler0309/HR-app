// src/components/time-off/CreatePolicyModal.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/hooks/useCompany'
import type { TimeOffPolicy } from '@/types/timeoff'
import { useTranslations } from 'next-intl' // Import useTranslations

// Helper function to calculate prorated days based on hire date
const calculateProratedDays = (
    totalDaysPerYear: number,
    hireDate: Date,
    year: number
  ): number => {
    const startOfYear = new Date(year, 0, 1)
    const endOfYear = new Date(year, 11, 31)
    const employeeStartDate = hireDate.getFullYear() === year ? hireDate : startOfYear
    
    // Calculate days remaining in the year from the employee's start date
    const daysInYear = 365 // Consider adding leap year handling if needed
    const daysRemaining = Math.ceil(
      (endOfYear.getTime() - employeeStartDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return Number(((totalDaysPerYear * daysRemaining) / daysInYear).toFixed(2))
  }

// Helper function to determine if we need to create next year's balance
const shouldCreateNextYearBalance = (hireDate: Date): boolean => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const anniversaryThisYear = new Date(
      currentYear,
      hireDate.getMonth(),
      hireDate.getDate()
    )
    
    // If we're within 30 days of the anniversary, create next year's balance too
    const thirtyDaysFromNow = new Date(currentDate)
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    
    return anniversaryThisYear <= thirtyDaysFromNow
  }

// Define the schema for policy creation using Zod
const policySchema = z.object({
    type: z.enum(['VACATION', 'SICK_LEAVE', 'PERSONAL', 'BEREAVEMENT', 'OTHER'], {
      errorMap: () => ({ message: 'Please select a valid policy type' }),
    }),
    days_per_year: z
      .number({ invalid_type_error: 'Days per year must be a number' })
      .min(0, 'Days per year must be a positive number'),
    carries_forward: z.boolean().optional(),
    max_carry_forward: z.number().min(0).optional(),
    description: z.string().max(500, 'Description can be at most 500 characters').optional(),
  }).refine((data) => {
    if (data.carries_forward && data.max_carry_forward === undefined) {
      return false;
    }
    return true;
  }, {
    message: "Max carry forward is required if carries forward is enabled",
    path: ["max_carry_forward"]
  });

// Infer the form values type from the schema
type PolicyFormValues = z.infer<typeof policySchema>

// Define the props for the modal component
interface CreatePolicyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreatePolicyModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePolicyModalProps) {
  const t = useTranslations('TimeOffPage')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { companyId } = useCompany()

  // Initialize the form with react-hook-form and Zod resolver
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: {
      carries_forward: false,
      max_carry_forward: 0,
    },
  })

  // Watch the 'carries_forward' checkbox to conditionally display the 'max_carry_forward' field
  const carriesForward = watch('carries_forward')

  // Handle form submission
  const onSubmit = async (data: PolicyFormValues) => {
    if (!companyId) {
      setError(t('createPolicyModal.errors.companyIdMissing')) 
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Check if policy type already exists
      const { data: existingPolicy, error: checkError } = await supabase
        .from('time_off_policies')
        .select('id')
        .eq('company_id', companyId)
        .eq('type', data.type)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { 
        throw checkError
      }

      if (existingPolicy) {
        setError(t('createPolicyModal.errors.policyAlreadyExists', { type: t(`balances.balanceTypes.${data.type}`) })) 
        return
      }

      // Start a transaction-like sequence
      // 1. Insert the new policy into 'time_off_policies' table
      const { data: policyData, error: policyError } = await supabase
        .from('time_off_policies')
        .insert([
          {
            name: t(`balances.balanceTypes.${data.type}`), 
            type: data.type,
            days_per_year: data.days_per_year,
            carries_forward: data.carries_forward || false,
            max_carry_forward: data.carries_forward ? data.max_carry_forward || 0 : 0,
            description: data.description || null,
            company_id: companyId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()

      if (policyError) {
        throw policyError
      }

      if (!policyData || policyData.length === 0) {
        throw new Error(t('createPolicyModal.errors.creationFailed')) 
      }

      const newPolicy = policyData[0]

      // 2. Fetch all employees belonging to the company
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, hire_date')
        .eq('company_id', companyId)

      if (employeesError) {
        throw employeesError
      }

      if (!employees || employees.length === 0) {
        console.warn(t('createPolicyModal.warnings.noEmployees')) 
      } else {
        const currentYear = new Date().getFullYear()
        const balanceEntries = []

        // Create balance entries for each employee
        for (const employee of employees) {
          const hireDate = new Date(employee.hire_date)
          
          // Calculate current year's balance
          const proratedDays = calculateProratedDays(
            data.days_per_year,
            hireDate,
            currentYear
          )

          balanceEntries.push({
            company_id: companyId,
            employee_id: employee.id,
            policy_id: newPolicy.id,
            year: currentYear,
            total_days: proratedDays,
            used_days: 0,
            carried_over: 0, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          // If we're close to the employee's anniversary, create next year's balance too
          if (shouldCreateNextYearBalance(hireDate)) {
            balanceEntries.push({
              company_id: companyId,
              employee_id: employee.id,
              policy_id: newPolicy.id,
              year: currentYear + 1,
              total_days: data.days_per_year, 
              used_days: 0,
              carried_over: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          }
        }

        // Insert all balance entries
        const { error: balanceInsertError } = await supabase
          .from('time_off_balances')
          .insert(balanceEntries)

        if (balanceInsertError) throw balanceInsertError
      }

      reset()
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error creating policy:', err)
      setError(
        err instanceof Error ? err.message : t('createPolicyModal.errors.unexpected')
      )
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
          <h2 className="text-2xl font-semibold text-platinum">{t('createPolicyModal.title')}</h2>
          <button onClick={onClose} className="text-sunset hover:text-flame text-2xl leading-none" aria-label={t('createPolicyModal.close')}>
            &times;
          </button>
        </div>
   
        {error && (
          <div className="mb-4 p-4 text-sm text-error bg-error/10 rounded-lg">
            {error}
          </div>
        )}
   
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
   
          {/* Policy Type */}
          <div>
            <label className="block text-sm font-medium text-sunset">{t('createPolicyModal.labels.policyType')}</label>
            <select
              {...register('type')}
              className={`input-base mt-1 block w-full ${
                errors.type ? 'border-error' : 'border-card-border'
              }`}
              disabled={isLoading}
            >
              <option value="">{t('createPolicyModal.placeholders.selectPolicyType')}</option>
              <option value="VACATION">{t('balances.balanceTypes.VACATION')}</option>
              <option value="SICK_LEAVE">{t('balances.balanceTypes.SICK')}</option>
              <option value="PERSONAL">{t('balances.balanceTypes.PERSONAL')}</option>
              <option value="BEREAVEMENT">{t('balances.balanceTypes.BEREAVEMENT')}</option>
              <option value="OTHER">{t('balances.balanceTypes.OTHER')}</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-error">{errors.type.message}</p>
            )}
          </div>
   
          {/* Days Per Year */}
          <div>
            <label className="block text-sm font-medium text-sunset">{t('createPolicyModal.labels.daysPerYear')}</label>
            <input
              {...register('days_per_year', { valueAsNumber: true })}
              type="number"
              className={`input-base mt-1 block w-full ${
                errors.days_per_year ? 'border-error' : 'border-card-border'
              }`}
              placeholder={t('createPolicyModal.placeholders.daysPerYear')}
              min="0"
              disabled={isLoading}
            />
            {errors.days_per_year && (
              <p className="mt-1 text-sm text-error">{errors.days_per_year.message}</p>
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
            <label className="ml-2 block text-sm text-sunset">{t('createPolicyModal.labels.carriesForward')}</label> 
          </div>
   
          {/* Max Carry Forward */}
          {carriesForward && (
            <div>
              <label className="block text-sm font-medium text-sunset">{t('createPolicyModal.labels.maxCarryForward')}</label>
              <input
                {...register('max_carry_forward', { valueAsNumber: true })}
                type="number"
                className={`input-base mt-1 block w-full ${
                  errors.max_carry_forward ? 'border-error' : 'border-card-border'
                }`}
                placeholder={t('createPolicyModal.placeholders.maxCarryForward')}
                min="0"
                disabled={isLoading}
              />
              {errors.max_carry_forward && (
                <p className="mt-1 text-sm text-error">{errors.max_carry_forward.message}</p>
              )}
            </div>
          )}
   
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-sunset">{t('createPolicyModal.labels.description')}</label>
            <textarea
              {...register('description')}
              rows={3}
              className={`input-base mt-1 block w-full ${
                errors.description ? 'border-error' : 'border-card-border'
              }`}
              placeholder={t('createPolicyModal.placeholders.description')}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error">{errors.description.message}</p>
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
              {t('createPolicyModal.buttons.cancel')} {/* Translated "Cancel" */}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary px-4 py-2 rounded-md disabled:opacity-50"
            >
              {isLoading ? t('createPolicyModal.buttons.creating') : t('createPolicyModal.buttons.createPolicy')}
            </button>
          </div>
        </form>
      </div>
    </div>
   )
}
