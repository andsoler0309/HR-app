'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Plus, Eye, Download, X, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { PayrollPeriod } from '@/types/salary'
import PayrollPeriodDetail from './PayrollPeriodDetail'

export default function PayrollPeriodList() {
  const [periods, setPeriods] = useState<PayrollPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showNewPeriodModal, setShowNewPeriodModal] = useState(false)
  const [periodDays, setPeriodDays] = useState(30)

  useEffect(() => {
    fetchPayrollPeriods()
  }, [])

  async function fetchPayrollPeriods() {
    try {
      setLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('payroll_periods')
        .select('*')
        .eq('company_id', userData.user?.id)
        .order('end_date', { ascending: false })

      if (error) throw error
      setPeriods(data || [])
    } catch (error) {
      console.error('Error fetching payroll periods:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createPayrollPeriod() {
    try {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      let lastDayOfPeriod = new Date(firstDayOfMonth);
      lastDayOfPeriod.setDate(firstDayOfMonth.getDate() + periodDays - 1);
  
      const { data: userData } = await supabase.auth.getUser();
  
      // Check if period exists
      const { data: existingPeriod } = await supabase
        .from('payroll_periods')
        .select('*')
        .eq('company_id', userData.user?.id)
        .eq('start_date', firstDayOfMonth.toISOString().split('T')[0])
        .single();

      if (existingPeriod) {
        alert('A payroll period already exists for this timeframe');
        return;
      }
  
      // Get payroll config
      const { data: config, error: configError } = await supabase
        .from('payroll_config')
        .select('*')
        .eq('year', new Date().getFullYear())
        .single();
    
      if (configError) throw configError;

      // Fetch employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, salary')
        .eq('company_id', userData.user?.id)
        .eq('status', 'FULL_TIME');
  
      console.log('employees', employees)
      if (employeesError) throw employeesError;
  
      let totalGross = 0;
      let totalDeductions = 0;
      let totalNet = 0;
      let totalTransportation = 0;
  
      employees?.forEach(employee => {
        const salary = employee.salary || 0;
        
        // Calculate proportional amounts based on period days
        const periodSalary = (salary * periodDays) / 30;
        
        // Transportation allowance for those earning less than 2x minimum wage
        let transportationAllowance = 0;
        if (salary <= (config.minimum_wage * 2)) {
          transportationAllowance = (config.transportation_allowance * periodDays) / 30;
          totalTransportation += transportationAllowance;
        }
  
        // Add to gross
        const grossSalary = periodSalary + transportationAllowance;
        totalGross += grossSalary;
        
        // Calculate deductions (8% of base salary - transport not included)
        const deductions = periodSalary * 0.08;
        totalDeductions += deductions;
        
        // Net is gross minus deductions
        totalNet += (grossSalary - deductions);
      });
  
      // Insert new period
      const { data: newPeriod, error } = await supabase
        .from('payroll_periods')
        .insert([
          {
            start_date: firstDayOfMonth.toISOString().split('T')[0],
            end_date: lastDayOfPeriod.toISOString().split('T')[0],
            status: 'DRAFT',
            company_id: userData.user?.id,
            period_days: periodDays,
            total_gross: totalGross,
            total_deductions: totalDeductions,
            total_net: totalNet,
            total_transportation: totalTransportation
          }
        ])
        .select()
        .single();
  
      if (error) throw error;
  
      setShowNewPeriodModal(false);
      fetchPayrollPeriods();
    } catch (error) {
      console.error('Error creating payroll period:', error);
    }
  }

  async function exportPeriod(period: PayrollPeriod) {
    try {
      const { data: details } = await supabase
        .from('payroll_details')
        .select(`
          *,
          employee:employee_id(first_name, last_name)
        `)
        .eq('period_id', period.id)

      if (!details || details.length === 0) {
        alert('No payroll details found for this period')
        return
      }

      // Format data for CSV
      const csvData = details.map(detail => ({
        'Employee Name': `${detail.employee.first_name} ${detail.employee.last_name}`,
        'Gross Salary': detail.gross_salary,
        'Deductions': detail.total_deductions,
        'Net Salary': detail.net_salary
      } as Record<string, string | number>))

      const headers = ['Employee Name', 'Gross Salary', 'Deductions', 'Net Salary']
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(h => row[h]).join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payroll-${period.start_date}-${period.end_date}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting period:', error)
    }
  }

  function NewPeriodModal() {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-card rounded-xl shadow-lg w-full max-w-md mx-4 border border-card-border">
          <div className="flex justify-between items-center p-6 border-b border-card-border">
            <h3 className="text-lg font-semibold text-platinum">Create New Payroll Period</h3>
            <button
              onClick={() => setShowNewPeriodModal(false)}
              className="text-sunset hover:text-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-sunset">
                Period Length (Days)
              </label>
              <select
                value={periodDays}
                onChange={(e) => setPeriodDays(Number(e.target.value))}
                className="input-base w-full"
              >
                <option value={15}>15 days</option>
                <option value={30}>30 days</option>
                <option value={45}>45 days</option>
              </select>
            </div>
   
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewPeriodModal(false)}
                className="btn-secondary px-4 py-2.5 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createPayrollPeriod}
                className="btn-primary px-4 py-2.5 rounded-lg font-medium"
              >
                Create Period
              </button>
            </div>
          </div>
        </div>
      </div>
    )
   }

  function handleViewPeriod(periodId: string) {
    setSelectedPeriod(periodId)
    setShowDetailModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-platinum">Payroll Periods</h2>
        </div>
        <button
          onClick={() => setShowNewPeriodModal(true)}
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          New Period
        </button>
      </div>
   
      <div className="bg-card rounded-lg border border-card-border shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border">
                <th className="px-6 py-4 text-left text-sm font-medium text-sunset uppercase tracking-wider">Period</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-sunset uppercase tracking-wider">Days</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-sunset uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-sunset uppercase tracking-wider">Total Gross</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-sunset uppercase tracking-wider">Total Net</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-sunset uppercase tracking-wider">Processed At</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-sunset uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-3 text-sunset">
                      <div className="w-5 h-5 border-2 border-primary/20 border-t-flame rounded-full animate-spin" />
                      <span>Loading periods...</span>
                    </div>
                  </td>
                </tr>
              ) : periods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sunset">
                    No payroll periods found
                  </td>
                </tr>
              ) : (
                periods.map((period) => (
                  <tr key={period.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 text-md text-platinum">
                      {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-md text-sunset">{period.period_days}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full
                        ${period.status === 'PAID' ? 'bg-success/10 text-success' : 
                          period.status === 'PROCESSED' ? 'bg-primary/10 text-primary' :
                          'bg-warning/10 text-warning'}`}>
                        {period.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-md text-sunset">{formatCurrency(period.total_gross || 0)}</td>
                    <td className="px-6 py-4 text-md text-sunset">{formatCurrency(period.total_net || 0)}</td>
                    <td className="px-6 py-4 text-md text-sunset">
                      {period.processed_at ? new Date(period.processed_at).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {period.status === 'DRAFT' ? (
                          <button
                            onClick={() => handleViewPeriod(period.id)}
                            className="p-2 text-sunset hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="View/Edit Period"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => exportPeriod(period)}
                            className="p-2 text-sunset hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                            title="Export Period"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
   
      {/* Modals */}
      {showNewPeriodModal && <NewPeriodModal />}
      {showDetailModal && selectedPeriod && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto border border-card-border">
            <PayrollPeriodDetail
              periodId={selectedPeriod}
              onClose={() => setShowDetailModal(false)}
              onUpdate={fetchPayrollPeriods}
            />
          </div>
        </div>
      )}
    </div>
   )
}