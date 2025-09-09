'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PerformanceReview, ReviewType, PerformanceRating } from '@/types/performance'
import { Employee } from '@/types/employee'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslations } from 'next-intl'
import { createClientAuditLog } from '@/lib/audit'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Star, Save, X } from 'lucide-react'

const reviewSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  reviewer_id: z.string().min(1, 'Reviewer is required'),
  review_period_start: z.string().min(1, 'Start date is required'),
  review_period_end: z.string().min(1, 'End date is required'),
  review_type: z.enum(['ANNUAL', 'QUARTERLY', 'PROBATIONARY', 'MID_YEAR']),
  overall_rating: z.number().min(1).max(5).optional(),
  goals_achievement: z.number().min(1).max(5).optional(),
  job_knowledge: z.number().min(1).max(5).optional(),
  communication: z.number().min(1).max(5).optional(),
  teamwork: z.number().min(1).max(5).optional(),
  initiative: z.number().min(1).max(5).optional(),
  employee_comments: z.string().optional(),
  manager_comments: z.string().optional(),
  goals_for_next_period: z.string().optional(),
  development_areas: z.string().optional()
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormModalProps {
  isOpen: boolean
  onClose: () => void
  review?: PerformanceReview | null
  employees: Employee[]
  onSuccess: () => void
}

export default function ReviewFormModal({
  isOpen,
  onClose,
  review,
  employees,
  onSuccess
}: ReviewFormModalProps) {
  const t = useTranslations('performance')
  const [loading, setLoading] = useState(false)
  const [reviewers, setReviewers] = useState<Employee[]>([])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      review_type: 'ANNUAL'
    }
  })

  useEffect(() => {
    if (isOpen) {
      fetchReviewers()
      if (review) {
        reset({
          employee_id: review.employee_id,
          reviewer_id: review.reviewer_id,
          review_period_start: review.review_period_start,
          review_period_end: review.review_period_end,
          review_type: review.review_type,
          overall_rating: review.overall_rating,
          goals_achievement: review.goals_achievement,
          job_knowledge: review.job_knowledge,
          communication: review.communication,
          teamwork: review.teamwork,
          initiative: review.initiative,
          employee_comments: review.employee_comments || '',
          manager_comments: review.manager_comments || '',
          goals_for_next_period: review.goals_for_next_period || '',
          development_areas: review.development_areas || ''
        })
      } else {
        reset({
          review_type: 'ANNUAL'
        })
      }
    }
  }, [isOpen, review, reset])

  const fetchReviewers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', user.id)
        .eq('is_active', true)

      if (error) throw error
      setReviewers(data || [])
    } catch (error) {
      console.error('Error fetching reviewers:', error)
    }
  }

  const onSubmit = async (data: ReviewFormData) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const reviewData = {
        ...data,
        company_id: user.id,
        status: data.overall_rating ? 'COMPLETED' : 'IN_PROGRESS',
        updated_at: new Date().toISOString()
      }

      if (review) {
        // Update existing review
        const { error } = await supabase
          .from('performance_reviews')
          .update(reviewData)
          .eq('id', review.id)

        if (error) throw error

        await createClientAuditLog({
          action: 'UPDATE',
          resource: 'PERFORMANCE_REVIEW',
          resourceId: review.id,
          details: { action: 'updated_performance_review', ...data }
        })
      } else {
        // Create new review
        const { error } = await supabase
          .from('performance_reviews')
          .insert({
            ...reviewData,
            created_at: new Date().toISOString()
          })

        if (error) throw error

        await createClientAuditLog({
          action: 'CREATE',
          resource: 'PERFORMANCE_REVIEW',
          details: { action: 'created_performance_review', employee_id: data.employee_id }
        })
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error saving review:', error)
    } finally {
      setLoading(false)
    }
  }

  const RatingField = ({ 
    name, 
    label, 
    value 
  }: { 
    name: keyof ReviewFormData, 
    label: string, 
    value?: number 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-secondary">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => setValue(name, rating as PerformanceRating)}
            className={`p-1 rounded ${
              value === rating ? 'text-primary' : 'text-text-secondary hover:text-primary'
            }`}
          >
            <Star 
              className={`w-6 h-6 ${value === rating ? 'fill-primary' : ''}`} 
            />
          </button>
        ))}
      </div>
      {value && (
        <span className="text-sm text-text-secondary">
          {value}/5 - {t(`ratingScale.${value}`)}
        </span>
      )}
    </div>
  )

  const watchedRatings = {
    overall_rating: watch('overall_rating'),
    goals_achievement: watch('goals_achievement'),
    job_knowledge: watch('job_knowledge'),
    communication: watch('communication'),
    teamwork: watch('teamwork'),
    initiative: watch('initiative')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {review ? t('editReview') : t('createReview')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('employee')} *
              </label>
              <select
                {...register('employee_id')}
                className={`input-base w-full ${errors.employee_id ? 'border-error' : ''}`}
              >
                <option value="">{t('selectEmployee')}</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name} - {employee.position}
                  </option>
                ))}
              </select>
              {errors.employee_id && (
                <p className="text-error text-sm mt-1">{errors.employee_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('reviewer')} *
              </label>
              <select
                {...register('reviewer_id')}
                className={`input-base w-full ${errors.reviewer_id ? 'border-error' : ''}`}
              >
                <option value="">{t('selectReviewer')}</option>
                {reviewers.map((reviewer) => (
                  <option key={reviewer.id} value={reviewer.id}>
                    {reviewer.first_name} {reviewer.last_name}
                  </option>
                ))}
              </select>
              {errors.reviewer_id && (
                <p className="text-error text-sm mt-1">{errors.reviewer_id.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('reviewType')} *
              </label>
              <select
                {...register('review_type')}
                className="input-base w-full"
              >
                <option value="ANNUAL">{t('reviewType.annual')}</option>
                <option value="QUARTERLY">{t('reviewType.quarterly')}</option>
                <option value="MID_YEAR">{t('reviewType.midYear')}</option>
                <option value="PROBATIONARY">{t('reviewType.probationary')}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {t('periodStart')} *
                </label>
                <input
                  type="date"
                  {...register('review_period_start')}
                  className={`input-base w-full ${errors.review_period_start ? 'border-error' : ''}`}
                />
                {errors.review_period_start && (
                  <p className="text-error text-sm mt-1">{errors.review_period_start.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  {t('periodEnd')} *
                </label>
                <input
                  type="date"
                  {...register('review_period_end')}
                  className={`input-base w-full ${errors.review_period_end ? 'border-error' : ''}`}
                />
                {errors.review_period_end && (
                  <p className="text-error text-sm mt-1">{errors.review_period_end.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Performance Ratings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t('performanceRatings')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RatingField
                name="overall_rating"
                label={t('overallRating')}
                value={watchedRatings.overall_rating}
              />
              <RatingField
                name="goals_achievement"
                label={t('goalsAchievement')}
                value={watchedRatings.goals_achievement}
              />
              <RatingField
                name="job_knowledge"
                label={t('jobKnowledge')}
                value={watchedRatings.job_knowledge}
              />
              <RatingField
                name="communication"
                label={t('communication')}
                value={watchedRatings.communication}
              />
              <RatingField
                name="teamwork"
                label={t('teamwork')}
                value={watchedRatings.teamwork}
              />
              <RatingField
                name="initiative"
                label={t('initiative')}
                value={watchedRatings.initiative}
              />
            </div>
          </div>

          {/* Comments and Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">{t('commentsAndGoals')}</h3>
            
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('managerComments')}
              </label>
              <textarea
                {...register('manager_comments')}
                rows={3}
                className="input-base w-full"
                placeholder={t('managerCommentsPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('developmentAreas')}
              </label>
              <textarea
                {...register('development_areas')}
                rows={3}
                className="input-base w-full"
                placeholder={t('developmentAreasPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('goalsForNextPeriod')}
              </label>
              <textarea
                {...register('goals_for_next_period')}
                rows={3}
                className="input-base w-full"
                placeholder={t('goalsForNextPeriodPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                {t('employeeComments')}
              </label>
              <textarea
                {...register('employee_comments')}
                rows={3}
                className="input-base w-full"
                placeholder={t('employeeCommentsPlaceholder')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-card-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              {loading ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
