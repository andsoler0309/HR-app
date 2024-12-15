import { PayrollDetail } from '@/types/salary'

export function calculatePayrollMetrics(details: PayrollDetail[]) {
  return {
    totalGrossSalary: details.reduce((sum, detail) => sum + detail.gross_salary, 0),
    totalNetSalary: details.reduce((sum, detail) => sum + detail.net_salary, 0),
    totalDeductions: details.reduce((sum, detail) => sum + detail.total_deductions, 0),
    averageGrossSalary: details.reduce((sum, detail) => sum + detail.gross_salary, 0) / details.length,
    totalEmployees: details.length,
    totalOvertime: details.reduce((sum, detail) => sum + detail.overtime, 0),
    totalBonuses: details.reduce((sum, detail) => sum + detail.bonuses, 0)
  }
}

export function calculateDepartmentCosts(details: PayrollDetail[], employeeDepartments: Record<string, string>) {
  const departmentCosts: Record<string, number> = {}
  
  details.forEach(detail => {
    const department = employeeDepartments[detail.employee_id] || 'Unassigned'
    departmentCosts[department] = (departmentCosts[department] || 0) + detail.gross_salary
  })

  return Object.entries(departmentCosts).map(([department, cost]) => ({
    department,
    cost
  }))
}

export function calculateSalaryRangeDistribution(details: PayrollDetail[], minimumWage: number) {
  const ranges = {
    '1-2 SMLV': 0,
    '2-4 SMLV': 0,
    '4-6 SMLV': 0,
    '6-8 SMLV': 0,
    '8+ SMLV': 0
  }

  details.forEach(detail => {
    const salaryInSMLV = detail.gross_salary / minimumWage
    if (salaryInSMLV <= 2) ranges['1-2 SMLV']++
    else if (salaryInSMLV <= 4) ranges['2-4 SMLV']++
    else if (salaryInSMLV <= 6) ranges['4-6 SMLV']++
    else if (salaryInSMLV <= 8) ranges['6-8 SMLV']++
    else ranges['8+ SMLV']++
  })

  return Object.entries(ranges).map(([range, count]) => ({ range, count }))
}