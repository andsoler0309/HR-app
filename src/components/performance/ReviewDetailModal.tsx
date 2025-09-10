'use client'
import React from 'react'
import { PerformanceReview } from '@/types/performance'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Star, Download, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ReviewDetailModalProps {
  isOpen: boolean
  onClose: () => void
  review: PerformanceReview | null
}

export default function ReviewDetailModal({
  isOpen,
  onClose,
  review
}: ReviewDetailModalProps) {
  const t = useTranslations('performance')

  if (!review) return null

  const getRatingDisplay = (rating?: number) => {
    if (!rating) return <span className="text-sunset">-</span>
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= rating ? 'text-vanilla fill-vanilla' : 'text-sunset'
              }`}
            />
          ))}
        </div>
        <span className="text-platinum font-medium">{rating}/5</span>
        <span className="text-sm text-sunset">({t(`ratingScale.${rating}`)})</span>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success/10 text-success border-success/20'
      case 'IN_PROGRESS':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'OVERDUE':
        return 'bg-error/10 text-error border-error/20'
      default:
        return 'bg-sunset/10 text-sunset border-sunset/20'
    }
  }

  const exportToPDF = () => {
    // Implementation for PDF export
    console.log('Exporting review to PDF...')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <DialogTitle className="text-lg sm:text-xl">
              {t('reviewDetails')} - {review.employee?.first_name} {review.employee?.last_name}
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={exportToPDF} className="text-xs sm:text-sm">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                {t('exportPDF')}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-platinum mb-3">{t('reviewInformation')}</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sunset">{t('employee')}: </span>
                      <span className="text-platinum">
                        {review.employee?.first_name} {review.employee?.last_name}
                      </span>
                    </div>
                    <div>
                      <span className="text-sunset">{t('position')}: </span>
                      <span className="text-platinum">{review.employee?.position}</span>
                    </div>
                    <div>
                      <span className="text-sunset">{t('department')}: </span>
                      <span className="text-platinum">{review.employee?.department?.name}</span>
                    </div>
                    <div>
                      <span className="text-sunset">{t('reviewer')}: </span>
                      <span className="text-platinum">
                        {review.reviewer?.first_name} {review.reviewer?.last_name}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-platinum mb-3">{t('reviewDetails')}</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sunset">{t('type')}: </span>
                      <span className="text-platinum">{t(`reviewType.${review.review_type.toLowerCase()}`)}</span>
                    </div>
                    <div>
                      <span className="text-sunset">{t('period')}: </span>
                      <span className="text-platinum">
                        {new Date(review.review_period_start).toLocaleDateString()} - {' '}
                        {new Date(review.review_period_end).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sunset">{t('status')}: </span>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(review.status)}`}>
                        {t(`status.${review.status.toLowerCase()}`)}
                      </span>
                    </div>
                    {review.completed_at && (
                      <div>
                        <span className="text-sunset">{t('completedAt')}: </span>
                        <span className="text-platinum">
                          {new Date(review.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Ratings */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-platinum mb-4">{t('performanceRatings')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-sunset">{t('overallRating')}</label>
                    <div className="mt-1">{getRatingDisplay(review.overall_rating)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-sunset">{t('goalsAchievement')}</label>
                    <div className="mt-1">{getRatingDisplay(review.goals_achievement)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-sunset">{t('jobKnowledge')}</label>
                    <div className="mt-1">{getRatingDisplay(review.job_knowledge)}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-sunset">{t('communication')}</label>
                    <div className="mt-1">{getRatingDisplay(review.communication)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-sunset">{t('teamwork')}</label>
                    <div className="mt-1">{getRatingDisplay(review.teamwork)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-sunset">{t('initiative')}</label>
                    <div className="mt-1">{getRatingDisplay(review.initiative)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-platinum mb-4">{t('commentsAndFeedback')}</h3>
              <div className="space-y-4">
                {review.manager_comments && (
                  <div>
                    <label className="text-sm font-medium text-sunset">{t('managerComments')}</label>
                    <div className="mt-2 p-3 bg-background rounded-lg border border-card-border">
                      <p className="text-platinum whitespace-pre-wrap">{review.manager_comments}</p>
                    </div>
                  </div>
                )}

                {review.employee_comments && (
                  <div>
                    <label className="text-sm font-medium text-sunset">{t('employeeComments')}</label>
                    <div className="mt-2 p-3 bg-background rounded-lg border border-card-border">
                      <p className="text-platinum whitespace-pre-wrap">{review.employee_comments}</p>
                    </div>
                  </div>
                )}

                {review.development_areas && (
                  <div>
                    <label className="text-sm font-medium text-sunset">{t('developmentAreas')}</label>
                    <div className="mt-2 p-3 bg-background rounded-lg border border-card-border">
                      <p className="text-platinum whitespace-pre-wrap">{review.development_areas}</p>
                    </div>
                  </div>
                )}

                {review.goals_for_next_period && (
                  <div>
                    <label className="text-sm font-medium text-sunset">{t('goalsForNextPeriod')}</label>
                    <div className="mt-2 p-3 bg-background rounded-lg border border-card-border">
                      <p className="text-platinum whitespace-pre-wrap">{review.goals_for_next_period}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-platinum mb-4">{t('timeline')}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sunset">{t('created')}: </span>
                  <span className="text-platinum">{new Date(review.created_at).toLocaleString()}</span>
                </div>
                {review.submitted_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-warning rounded-full"></div>
                    <span className="text-sunset">{t('submitted')}: </span>
                    <span className="text-platinum">{new Date(review.submitted_at).toLocaleString()}</span>
                  </div>
                )}
                {review.completed_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span className="text-sunset">{t('completed')}: </span>
                    <span className="text-platinum">{new Date(review.completed_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
