export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOGIN' 
  | 'LOGOUT' 
  | 'EXPORT' 
  | 'APPROVE' 
  | 'REJECT'

export type AuditResource = 
  | 'EMPLOYEE' 
  | 'DEPARTMENT' 
  | 'TIME_OFF' 
  | 'PAYROLL' 
  | 'DOCUMENT' 
  | 'PERFORMANCE_REVIEW'
  | 'USER_SESSION'

export interface AuditLog {
  id: string
  company_id: string
  user_id: string
  action: AuditAction
  resource: AuditResource
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  timestamp: string
  user?: {
    id: string
    email: string
    first_name?: string
    last_name?: string
  }
}

export interface AuditLogFilters {
  action?: AuditAction
  resource?: AuditResource
  user_id?: string
  date_from?: string
  date_to?: string
  search?: string
}
