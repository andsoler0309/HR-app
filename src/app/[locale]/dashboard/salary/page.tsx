'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Wallet, Settings, Users } from 'lucide-react'
import PayrollSummary from '@/components/salary/PayrollSummary'
import PayrollPeriodList from '@/components/salary/PayrollPeriodList'
import SalaryConfiguration from '@/components/salary/SalaryConfiguration'
import { PayrollConfig } from '@/types/salary'
import EmployeePayrollTable from '@/components/salary/EmployeePayrollTable'

export default function SalaryPage() {
  const t = useTranslations('SalaryPage')

  const [loading, setLoading] = useState(true)
  const [payrollConfig, setPayrollConfig] = useState<PayrollConfig | null>(null)

  useEffect(() => {
    fetchPayrollConfig()
  }, [])

  async function fetchPayrollConfig() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true)
      const { data, error } = await supabase
        .from('payroll_config')
        .select('*')
        .eq('year', new Date().getFullYear())
        .eq('company_id', user.id)
        .single()
      
      if (error) throw error
      setPayrollConfig(data)
    } catch (error) {
      console.error(t('errorFetchingPayrollConfig'), error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-platinum">
            {t('salaryManagement')}
          </h1>
          <p className="text-sm text-sunset mt-1 sm:hidden">Gestión de nóminas y salarios</p>
        </div>
      </div>
 
      <div className="bg-card rounded-lg border border-card-border shadow-md">
        <Tabs defaultValue="summary" className="w-full">
          <div className="border-b border-card-border px-4 sm:px-6">
            <TabsList className="flex h-auto p-0 bg-transparent overflow-x-auto">
              <TabsTrigger 
                value="summary"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-3 text-sm sm:text-base font-medium whitespace-nowrap
                data-[state=active]:text-platinum data-[state=active]:border-b-2 data-[state=active]:border-primary 
                text-sunset hover:text-vanilla rounded-none bg-transparent"
              >
                <LineChart className="w-4 h-4" />
                {t('summary')}
              </TabsTrigger>
              <TabsTrigger 
                value="employees"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-3 text-sm sm:text-base font-medium whitespace-nowrap
                data-[state=active]:text-platinum data-[state=active]:border-b-2 data-[state=active]:border-primary 
                text-sunset hover:text-vanilla rounded-none bg-transparent"
              >
                <Users className="w-4 h-4" />
                {t('employeesPayroll')}
              </TabsTrigger>
              {/* Uncomment and translate if needed
              <TabsTrigger 
                value="periods"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-3 text-sm sm:text-base font-medium whitespace-nowrap
                data-[state=active]:text-platinum data-[state=active]:border-b-2 data-[state=active]:border-primary 
                text-sunset hover:text-vanilla rounded-none bg-transparent"
              >
                <Wallet className="w-4 h-4" />
                {t('payrollPeriods')}
              </TabsTrigger>
              <TabsTrigger 
                value="config"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-3 text-sm sm:text-base font-medium whitespace-nowrap
                data-[state=active]:text-platinum data-[state=active]:border-b-2 data-[state=active]:border-primary 
                text-sunset hover:text-vanilla rounded-none bg-transparent"
              >
                <Settings className="w-4 h-4" />
                {t('configuration')}
              </TabsTrigger>
              */}
            </TabsList>
          </div>
 
          <div className="p-4 sm:p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64 text-sunset">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-flame rounded-full animate-spin" />
                    <span>{t('loading')}</span>
                  </div>
                </div>
              ) : (
                <>
                  <TabsContent value="summary" className="mt-0 focus:outline-none">
                    <PayrollSummary />
                  </TabsContent>

                  <TabsContent value="employees" className="mt-0 focus:outline-none">
                    <EmployeePayrollTable />
                  </TabsContent>
   
                  {/* Uncomment and translate if needed
                  <TabsContent value="periods" className="mt-0 focus:outline-none">
                    <PayrollPeriodList />
                  </TabsContent>
   
                  <TabsContent value="config" className="mt-0 focus:outline-none">
                    <SalaryConfiguration 
                      currentConfig={payrollConfig} 
                      onUpdate={fetchPayrollConfig}
                    />
                  </TabsContent>
                  */}
                </>
              )}
            </div>
          </Tabs>
        </div>
    </div>
  )
}
