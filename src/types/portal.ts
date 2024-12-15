export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type RequestType = 'TIME_OFF' | 'EXPENSE' | 'DOCUMENT' | 'OTHER'

export interface PortalUser {
    id: string
    employee_id: string
    company_id: string // Add this if not already present
    email: string
    first_name: string
    last_name: string
    position: string
    department?: {
      id: string
      name: string
    }
  }

export interface PortalRequest {
  id: string
  type: RequestType
  status: RequestStatus
  data: any
  created_at: string
  updated_at?: string
}

export interface TimeOffRequest {
  start_date: string
  end_date: string
  reason: string
  type: 'VACATION' | 'SICK' | 'PERSONAL'
}

export interface TimeEntry {
  id: string;
  employee_id: string;
  type: 'clock_in' | 'clock_out';
  timestamp: string;
  created_at: string;
}