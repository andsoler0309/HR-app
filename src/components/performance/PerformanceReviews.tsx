'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PerformanceReview, ReviewType, ReviewStatus } from '@/types/performance'
import { Employee } from '@/types/employee'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Download, Star, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createClientAuditLog } from '@/lib/audit'
import ReviewFormModal from './ReviewFormModal'
import ReviewDetailModal from './ReviewDetailModal'

export default function PerformanceReviews() {
  const t = useTranslations('performance')
  
  const [reviews, setReviews] = useState<PerformanceReview[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'ALL'>('ALL')
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([fetchReviews(), fetchEmployees()])
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('performance_reviews')
        .select(`
          *,
          employee:employee_id(id, first_name, last_name, position, department:department_id(name)),
          reviewer:reviewer_id(id, first_name, last_name)
        `)
        .eq('company_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          department:department_id(id, name)
        `)
        .eq('company_id', user.id)
        .eq('is_active', true)

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleCreateReview = () => {
    setSelectedReview(null)
    setIsFormModalOpen(true)
  }

  const handleEditReview = (review: PerformanceReview) => {
    setSelectedReview(review)
    setIsFormModalOpen(true)
  }

  const handleViewReview = (review: PerformanceReview) => {
    setSelectedReview(review)
    setIsDetailModalOpen(true)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm(t('confirmDelete'))) return

    try {
      const { error } = await supabase
        .from('performance_reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      await createClientAuditLog({
        action: 'DELETE',
        resource: 'PERFORMANCE_REVIEW',
        resourceId: reviewId,
        details: { action: 'deleted_performance_review' }
      })

      fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const getStatusIcon = (status: ReviewStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-success" />
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-warning" />
      case 'OVERDUE':
        return <AlertTriangle className="w-4 h-4 text-error" />
      default:
        return <Clock className="w-4 h-4 text-sunset" />
    }
  }

  const getStatusColor = (status: ReviewStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success/10 text-success'
      case 'IN_PROGRESS':
        return 'bg-warning/10 text-warning'
      case 'OVERDUE':
        return 'bg-error/10 text-error'
      default:
        return 'bg-sunset/10 text-sunset'
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      `${review.employee?.first_name} ${review.employee?.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      review.employee?.position?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || review.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: reviews.length,
    completed: reviews.filter(r => r.status === 'COMPLETED').length,
    inProgress: reviews.filter(r => r.status === 'IN_PROGRESS').length,
    overdue: reviews.filter(r => r.status === 'OVERDUE').length,
    avgRating: reviews.filter(r => r.overall_rating).length > 0 
      ? reviews.filter(r => r.overall_rating).reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.filter(r => r.overall_rating).length
      : 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-platinum">{t('title')}</h1>
        <Button onClick={handleCreateReview} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          {t('createReview')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sunset">{t('totalReviews')}</p>
                <p className="text-2xl font-bold text-platinum">{stats.total}</p>
              </div>
              <Star className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sunset">{t('completed')}</p>
                <p className="text-2xl font-bold text-success">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sunset">{t('inProgress')}</p>
                <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sunset">{t('overdue')}</p>
                <p className="text-2xl font-bold text-error">{stats.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sunset">{t('avgRating')}</p>
                <p className="text-2xl font-bold text-platinum">{stats.avgRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-vanilla fill-vanilla" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sunset w-4 h-4" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-base pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | 'ALL')}
              className="input-base"
            >
              <option value="ALL">{t('allStatuses')}</option>
              <option value="DRAFT">{t('status.draft')}</option>
              <option value="IN_PROGRESS">{t('status.inProgress')}</option>
              <option value="COMPLETED">{t('status.completed')}</option>
              <option value="OVERDUE">{t('status.overdue')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-card-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('employee')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('position')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('reviewer')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('type')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('period')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('status')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('rating')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-sunset">
                      {t('loading')}
                    </td>
                  </tr>
                ) : filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-sunset">
                      {t('noReviews')}
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => (
                    <tr key={review.id} className="hover:bg-background/50">
                      <td className="p-4">
                        <div className="font-medium text-platinum">
                          {review.employee?.first_name} {review.employee?.last_name}
                        </div>
                        <div className="text-sm text-sunset">
                          {review.employee?.department?.name}
                        </div>
                      </td>
                      <td className="p-4 text-sunset">{review.employee?.position}</td>
                      <td className="p-4 text-sunset">
                        {review.reviewer?.first_name} {review.reviewer?.last_name}
                      </td>
                      <td className="p-4 text-sunset">{t(`reviewType.${review.review_type.toLowerCase()}`)}</td>
                      <td className="p-4 text-sunset">
                        {new Date(review.review_period_start).toLocaleDateString()} - {' '}
                        {new Date(review.review_period_end).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(review.status)}`}>
                          {getStatusIcon(review.status)}
                          {t(`status.${review.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="p-4">
                        {review.overall_rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-vanilla fill-vanilla" />
                            <span className="text-platinum">{review.overall_rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-sunset">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReview(review)}
                          >
                            {t('view')}
                          </Button>
                          {review.status !== 'COMPLETED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditReview(review)}
                            >
                              {t('edit')}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-error hover:text-error/80"
                          >
                            {t('delete')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ReviewFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        review={selectedReview}
        employees={employees}
        onSuccess={fetchReviews}
      />

      <ReviewDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        review={selectedReview}
      />
    </div>
  )
}
