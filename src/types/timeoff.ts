export type TimeOffStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type TimeOffType = 'VACATION' | 'SICK_LEAVE' | 'PERSONAL' | 'BEREAVEMENT' | 'OTHER'

export interface TimeOffPolicy {
  id: string
  company_id: string
  name: string
  type: TimeOffType
  days_per_year: number
  carries_forward: boolean
  max_carry_forward: number
  description?: string
}

export interface TimeOffBalance {
  id: string
  employee_id: string
  policy_id: string
  year: number
  total_days: number
  used_days: number
  carried_over: number
  policy?: TimeOffPolicy
  employee?: {
    first_name: string
    last_name: string
  }
}

export interface TimeOffRequest {
  id: string
  employee_id: string
  company_id: string
  policy_id?: string
  start_date: string
  end_date: string
  days: number
  type: TimeOffType
  status: TimeOffStatus
  reason?: string
  approved_by?: string
  approved_at?: string
  employee?: {
    first_name: string
    last_name: string
    department: {
      name: string
    }
  }
  source: 'PORTAL' | 'TIME_OFF_REQUESTS'
}