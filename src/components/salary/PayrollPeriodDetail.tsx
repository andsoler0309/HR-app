import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { calculateSalary } from '@/lib/salary-calculations'
import { PayrollPeriod, PayrollConfig, PayrollDetail } from '@/types/salary'
import { Employee } from '@/types/employee'
import { X } from 'lucide-react'

interface Props {
  periodId: string
  onClose: () => void
  onUpdate: () => void
}

export default function PayrollPeriodDetail({ periodId, onClose, onUpdate }: Props) {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [period, setPeriod] = useState<PayrollPeriod | null>(null)
  const [config, setConfig] = useState<PayrollConfig | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [details, setDetails] = useState<PayrollDetail[]>([])

  useEffect(() => {
    fetchPeriodData()
  }, [periodId])

  async function fetchPeriodData() {
    try {
      setLoading(true)
      const [periodData, configData, employeesData] = await Promise.all([
        supabase
          .from('payroll_periods')
          .select('*')
          .eq('id', periodId)
          .single(),
        supabase
          .from('payroll_config')
          .select('*')
          .eq('year', new Date().getFullYear())
          .single(),
        supabase
          .from('employees')
          .select(`
            *,
            department:department_id (
              id,
              name
            )
          `)
      ])

      if (periodData.error) throw periodData.error
      if (configData.error) throw configData.error
      if (employeesData.error) throw employeesData.error

      setPeriod(periodData.data)
      setConfig(configData.data)
      setEmployees(employeesData.data || [])

      if (periodData.data?.status !== 'DRAFT') {
        const { data: detailsData, error: detailsError } = await supabase
          .from('payroll_details')
          .select('*')
          .eq('period_id', periodId)

        if (detailsError) throw detailsError
        setDetails(detailsData || [])
      }
    } catch (error) {
      console.error('Error fetching period data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function processPeriod() {
    if (!config || !period) return

    try {
      setProcessing(true)
      const newDetails: PayrollDetail[] = []
      let totalGross = 0
      let totalDeductions = 0
      let totalNet = 0
      let totalTransportation = 0

      const fullTimeEmployees = employees.filter(emp => emp.status === 'FULL_TIME')

      for (const employee of fullTimeEmployees) {
        // Calculate proportional amounts based on period days
        const periodSalary = ((employee.salary || 0) * period.period_days) / 30

        // Transportation allowance for those earning less than 2x minimum wage
        let transportationAllowance = 0
        if ((employee.salary || 0) <= (config.minimum_wage * 2)) {
          transportationAllowance = (config.transportation_allowance * period.period_days) / 30
        }

        // Calculate deductions (health and pension are 8% of base salary - transport not included)
        const healthContribution = periodSalary * (config.health_contribution_percentage / 100)
        const pensionContribution = periodSalary * (config.pension_contribution_percentage / 100)
        
        // Solidarity fund for high earners (if applicable)
        let solidarityFund = 0
        if ((employee.salary || 0) > config.solidarity_fund_threshold) {
          solidarityFund = periodSalary * 0.01 // 1% for salaries above threshold
        }

        const totalDeductionsForEmployee = healthContribution + pensionContribution + solidarityFund
        const grossSalary = periodSalary + transportationAllowance
        const netSalary = grossSalary - totalDeductionsForEmployee

        const detail: PayrollDetail = {
          id: crypto.randomUUID(),
          company_id: period.company_id,
          period_id: period.id,
          employee_id: employee.id,
          base_salary: periodSalary,
          transportation_allowance: transportationAllowance,
          health_contribution: healthContribution,
          pension_contribution: pensionContribution,
          solidarity_fund: solidarityFund,
          overtime: 0,
          bonuses: 0,
          commissions: 0,
          other_earnings: 0,
          gross_salary: grossSalary,
          total_deductions: totalDeductionsForEmployee,
          net_salary: netSalary,
          created_at: new Date().toISOString()
        }

        newDetails.push(detail)
        totalGross += grossSalary
        totalDeductions += totalDeductionsForEmployee
        totalNet += netSalary
        totalTransportation += transportationAllowance
      }

      const { error: detailsError } = await supabase
        .from('payroll_details')
        .insert(newDetails)

      if (detailsError) throw detailsError

      const { error: periodError } = await supabase
        .from('payroll_periods')
        .update({
          status: 'PROCESSED',
          total_gross: totalGross,
          total_deductions: totalDeductions,
          total_net: totalNet,
          total_transportation: totalTransportation,
          processed_at: new Date().toISOString()
        })
        .eq('id', period.id)

      if (periodError) throw periodError

      onUpdate()
      setDetails(newDetails)
    } catch (error) {
      console.error('Error processing payroll:', error)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div>Loading...</div>

  const displayEmployees = employees.filter(emp => emp.status === 'FULL_TIME')
  const itemsToDisplay = period?.status === 'DRAFT' ? displayEmployees : details

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-platinum">
            Payroll Period: {period?.start_date} - {period?.end_date}
          </h2>
          <p className="text-sm text-sunset">Status: {period?.status}</p>
        </div>
        <div className="flex items-center gap-4">
          {period?.status === 'DRAFT' && (
            <button
              onClick={processPeriod}
              disabled={processing}
              className="btn-primary px-4 py-2 rounded-md disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Process Payroll'}
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 text-sunset hover:text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
   
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card p-6 border border-card-border rounded-xl">
          <h3 className="text-sm font-medium text-sunset">Total Gross</h3>
          <p className="text-2xl font-bold mt-2 text-platinum">
            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(period?.total_gross || 0)}
          </p>
        </Card>
        <Card className="bg-card p-6 border border-card-border rounded-xl">
          <h3 className="text-sm font-medium text-sunset">Total Deductions</h3>
          <p className="text-2xl font-bold mt-2 text-platinum">
            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(period?.total_deductions || 0)}
          </p>
        </Card>
        <Card className="bg-card p-6 border border-card-border rounded-xl">
          <h3 className="text-sm font-medium text-sunset">Total Net</h3>
          <p className="text-2xl font-bold mt-2 text-platinum">
            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(period?.total_net || 0)}
          </p>
        </Card>
      </div>
   
      <Card className="bg-card border border-card-border rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-background">
                <th className="px-4 py-3 text-left text-sm font-medium text-sunset">Employee</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-sunset">Department</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-sunset">Position</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-sunset">Base Salary</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-sunset">Transport</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-sunset">Deductions</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-sunset">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {itemsToDisplay.map((item) => {
                const employee = period?.status === 'DRAFT'
                  ? item as Employee
                  : employees.find(e => e.id === (item as PayrollDetail).employee_id);
                
                if (!employee) return null;
   
                // For draft mode, calculate the values
                let displayValues = {
                  baseSalary: 0,
                  transport: 0,
                  deductions: 0,
                  net: 0
                }
   
                if (period?.status === 'DRAFT' && config) {
                  const periodSalary = ((employee.salary || 0) * period.period_days) / 30
                  const transportAllowance = (employee.salary || 0) <= (config.minimum_wage * 2)
                    ? (config.transportation_allowance * period.period_days) / 30
                    : 0
                  const deductions = periodSalary * ((config.health_contribution_percentage + config.pension_contribution_percentage) / 100)
                  
                  displayValues = {
                    baseSalary: periodSalary,
                    transport: transportAllowance,
                    deductions: deductions,
                    net: periodSalary + transportAllowance - deductions
                  }
                } else {
                  const detail = item as PayrollDetail
                  displayValues = {
                    baseSalary: detail.base_salary,
                    transport: detail.transportation_allowance,
                    deductions: detail.total_deductions,
                    net: detail.net_salary
                  }
                }
   
                return (
                  <tr key={employee.id} className="hover:bg-background/50">
                    <td className="px-4 py-4 text-platinum">{`${employee.first_name} ${employee.last_name}`}</td>
                    <td className="px-4 py-4 text-sunset">{employee.department?.name || '-'}</td>
                    <td className="px-4 py-4 text-sunset">{employee.position}</td>
                    <td className="px-4 py-4 text-sunset">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(displayValues.baseSalary)}
                    </td>
                    <td className="px-4 py-4 text-sunset">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(displayValues.transport)}
                    </td>
                    <td className="px-4 py-4 text-sunset">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(displayValues.deductions)}
                    </td>
                    <td className="px-4 py-4 text-sunset">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(displayValues.net)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
   );
}