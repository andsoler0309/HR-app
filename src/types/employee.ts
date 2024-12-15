export type EmploymentStatus = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'

export interface EmployeeAttendance {
  id: string;
  employee_id: string;
  company_id: string;
  clock_in: string;
  clock_out: string | null;
  created_at: string;
}

export interface Employee {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  department_id: string
  position: string
  status: EmploymentStatus
  hire_date: string
  birthday: string
  salary?: number
  manager_id?: string
  profile_image?: string
  created_at: string
  updated_at?: string
  is_active: boolean
  document_id: string
  department?: {
    id: string
    name: string
  }
  current_attendance?: EmployeeAttendance | null;
}

export interface Department {
  id: string
  name: string
  description?: string
}