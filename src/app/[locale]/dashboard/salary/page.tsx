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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-platinum mb-8">
          {t('salaryManagement')}
        </h1>
   
        <div className="bg-card rounded-lg border border-card-border shadow-md">
          <Tabs defaultValue="summary" className="w-full">
            <div className="border-b border-card-border px-6">
              <TabsList className="flex h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="summary"
                  className="inline-flex items-center gap-2 px-4 py-3 text-md font-medium
                  data-[state=active]:text-platinum data-[state=active]:border-b-2 data-[state=active]:border-primary 
                  text-sunset hover:text-vanilla rounded-none bg-transparent"
                >
                  <LineChart className="w-4 h-4" />
                  {t('summary')}
                </TabsTrigger>
                <TabsTrigger 
                  value="employees"
                  className="inline-flex items-center gap-2 px-4 py-3 text-md font-medium
                  data-[state=active]:text-platinum data-[state=active]:border-b-2 data-[state=active]:border-primary 
                  text-sunset hover:text-vanilla rounded-none bg-transparent"
                >
                  <Users className="w-4 h-4" />
                  {t('employeesPayroll')}
                </TabsTrigger>
                {/* Uncomment and translate if needed
                <TabsTrigger 
                  value="periods"
                  className="inline-flex items-center gap-2 px-4 py-3 text-md font-medium
                  data-[state=active]:text-platinum data-[state=active]:border-b-2 data-[state=active]:border-primary 
                  text-sunset hover:text-vanilla rounded-none bg-transparent"
                >
                  <Wallet className="w-4 h-4" />
                  {t('payrollPeriods')}
                </TabsTrigger>
                <TabsTrigger 
                  value="config"
                  className="inline-flex items-center gap-2 px-4 py-3 text-md font-medium
                  data-[state=active]:text-platinum data-[state=active]:border-b-2 data-[state=active]:border-primary 
                  text-sunset hover:text-vanilla rounded-none bg-transparent"
                >
                  <Settings className="w-4 h-4" />
                  {t('configuration')}
                </TabsTrigger>
                */}
              </TabsList>
            </div>
   
            <div className="p-6">
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
    </div>
  )
}
