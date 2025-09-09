export type ReviewStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'
export type ReviewType = 'ANNUAL' | 'QUARTERLY' | 'PROBATIONARY' | 'MID_YEAR'
export type PerformanceRating = 1 | 2 | 3 | 4 | 5

export interface PerformanceReview {
  id: string
  company_id: string
  employee_id: string
  reviewer_id: string
  review_period_start: string
  review_period_end: string
  review_type: ReviewType
  status: ReviewStatus
  overall_rating?: PerformanceRating
  goals_achievement?: PerformanceRating
  job_knowledge?: PerformanceRating
  communication?: PerformanceRating
  teamwork?: PerformanceRating
  initiative?: PerformanceRating
  employee_comments?: string
  manager_comments?: string
  goals_for_next_period?: string
  development_areas?: string
  submitted_at?: string
  completed_at?: string
  created_at: string
  updated_at?: string
  employee?: {
    id: string
    first_name: string
    last_name: string
    position: string
    department?: {
      name: string
    }
  }
  reviewer?: {
    id: string
    first_name: string
    last_name: string
  }
}

export interface ReviewTemplate {
  id: string
  company_id: string
  name: string
  description?: string
  review_type: ReviewType
  questions: ReviewQuestion[]
  is_default: boolean
  created_at: string
  updated_at?: string
}

export interface ReviewQuestion {
  id: string
  question: string
  type: 'rating' | 'text' | 'goals'
  required: boolean
  order: number
}

export interface PerformanceMetrics {
  totalReviews: number
  completedReviews: number
  overdueReviews: number
  averageRating: number
  departmentAverages: { department: string; average: number }[]
}
