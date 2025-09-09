'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import type { PayrollConfig } from '@/types/salary'
import { Settings, Calendar, DollarSign, Bus, Heart, Pencil, PiggyBank, Save } from 'lucide-react'

const configSchema = z.object({
  year: z.number().min(2020).max(2100),
  minimum_wage: z.number().min(0),
  transportation_allowance: z.number().min(0),
  health_contribution_percentage: z.number().min(0).max(100),
  pension_contribution_percentage: z.number().min(0).max(100),
  solidarity_fund_threshold: z.number().min(0)
})

interface Props {
  currentConfig: PayrollConfig | null
  onUpdate: () => void
}

export default function SalaryConfiguration({ currentConfig, onUpdate }: Props) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: currentConfig || {
      year: new Date().getFullYear(),
      minimum_wage: 1300000,
      transportation_allowance: 140000,
      health_contribution_percentage: 4,
      pension_contribution_percentage: 4,
      solidarity_fund_threshold: 4000000
    }
  })

  async function onSubmit(data: z.infer<typeof configSchema>) {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('payroll_config')
        .upsert({
          ...data,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      onUpdate()
    } catch (error) {
      console.error('Error saving config:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-lg border border-card-border shadow-md">
      <div className="flex items-center gap-3 p-6 border-b border-card-border">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-platinum">Payroll Configuration</h2>
      </div>
   
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-sunset">
              <Calendar className="w-4 h-4 text-sunset" />
              Year
            </label>
            <input
              type="number"
              {...register('year', { valueAsNumber: true })}
              className="input-base w-full"
            />
            {errors.year && (
              <p className="text-sm text-error flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-error rounded-full" />
                {errors.year.message}
              </p>
            )}
          </div>
   
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-sunset">
              <DollarSign className="w-4 h-4 text-sunset" />
              Minimum Wage (SMLV)
            </label>
            <input
              type="number"
              {...register('minimum_wage', { valueAsNumber: true })}
              className="input-base w-full"
            />
            {errors.minimum_wage && (
              <p className="text-sm text-error flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-error rounded-full" />
                {errors.minimum_wage.message}
              </p>
            )}
          </div>
   
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-sunset">
              <Bus className="w-4 h-4 text-sunset" />
              Transportation Allowance
            </label>
            <input
              type="number"
              {...register('transportation_allowance', { valueAsNumber: true })}
              className="input-base w-full"
            />
            {errors.transportation_allowance && (
              <p className="text-sm text-error flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-error rounded-full" />
                {errors.transportation_allowance.message}
              </p>
            )}
          </div>
   
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-sunset">
              <Heart className="w-4 h-4 text-sunset" />
              Health Contribution %
            </label>
            <input
              type="number"
              step="0.01"
              {...register('health_contribution_percentage', { valueAsNumber: true })}
              className="input-base w-full"
            />
            {errors.health_contribution_percentage && (
              <p className="text-sm text-error flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-error rounded-full" />
                {errors.health_contribution_percentage.message}
              </p>
            )}
          </div>
   
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-sunset">
              <Pencil className="w-4 h-4 text-sunset" />
              Pension Contribution %
            </label>
            <input
              type="number"
              step="0.01"
              {...register('pension_contribution_percentage', { valueAsNumber: true })}
              className="input-base w-full"
            />
            {errors.pension_contribution_percentage && (
              <p className="text-sm text-error flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-error rounded-full" />
                {errors.pension_contribution_percentage.message}
              </p>
            )}
          </div>
   
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-sunset">
              <PiggyBank className="w-4 h-4 text-sunset" />
              Solidarity Fund Threshold
            </label>
            <input
              type="number"
              {...register('solidarity_fund_threshold', { valueAsNumber: true })}
              className="input-base w-full"
            />
            {errors.solidarity_fund_threshold && (
              <p className="text-sm text-error flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-error rounded-full" />
                {errors.solidarity_fund_threshold.message}
              </p>
            )}
          </div>
        </div>
   
        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg disabled:opacity-50 font-medium"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
   )
}