// src/types/salary.ts

export type SalaryType = 'BASE' | 'BONUS' | 'COMMISSION' | 'ADJUSTMENT'

export interface SalaryHistory {
  id: string
  company_id: string
  employee_id: string
  amount: number
  type: SalaryType
  effective_date: string
  end_date?: string
  notes?: string
  created_at: string
  created_by: string
}

export interface PayrollPeriod {
  id: string
  company_id: string
  start_date: string
  end_date: string
  status: 'DRAFT' | 'PROCESSED' | 'PAID'
  period_days: number
  processed_at?: string
  processed_by?: string
  total_gross?: number
  total_deductions?: number
  total_net?: number
  created_at: string
}

export interface PayrollDetail {
  id: string
  company_id: string
  period_id: string
  employee_id: string
  base_salary: number
  transportation_allowance: number
  health_contribution: number
  pension_contribution: number
  solidarity_fund: number
  overtime: number
  bonuses: number
  commissions: number
  other_earnings: number
  gross_salary: number
  total_deductions: number
  net_salary: number
  created_at: string
}

export interface PayrollConfig {
  id: string
  company_id: string
  year: number
  minimum_wage: number
  transportation_allowance: number
  health_contribution_percentage: number
  pension_contribution_percentage: number
  solidarity_fund_threshold: number
  created_at: string
  updated_at?: string
}

export interface SalaryCalculation {
  grossSalary: number;
  netSalary: number;
  transportationAllowance: number;
  deductions: {
    health: number;
    pension: number;
    solidarityFund: number;
    total: number;
  };
}