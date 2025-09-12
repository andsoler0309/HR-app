export type EmploymentStatus = 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY';


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
  department_id: string | null
  position: string
  status: EmploymentStatus
  hire_date: string
  birthday: string
  salary?: number
  // manager_id?: string
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

export interface Deducciones {
  salud: number;
  pension: number;
  fondoSolidaridad: number;
  retencionFuente: number;
  aporteEmpleador: {
    salud: number;
    pension: number;
    parafiscales: {
      sena: number;
      icbf: number;
      cajaCompensacion: number;
    };
  };
  total: number;
}

export interface EmployeeWithPayroll extends Employee {
  deducciones: Deducciones;
  salarioNeto: number;
}