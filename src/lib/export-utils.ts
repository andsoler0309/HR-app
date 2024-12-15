import { PayrollDetail } from '@/types/salary'

export function exportToCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function preparePayrollReportData(details: PayrollDetail[]) {
  return details.map(detail => ({
    'Employee ID': detail.employee_id,
    'Base Salary': detail.base_salary,
    'Transportation': detail.transportation_allowance,
    'Overtime': detail.overtime,
    'Bonuses': detail.bonuses,
    'Health Contribution': detail.health_contribution,
    'Pension Contribution': detail.pension_contribution,
    'Solidarity Fund': detail.solidarity_fund,
    'Gross Salary': detail.gross_salary,
    'Total Deductions': detail.total_deductions,
    'Net Salary': detail.net_salary
  }))
}