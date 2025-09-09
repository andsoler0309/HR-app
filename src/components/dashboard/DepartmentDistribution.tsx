'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useCompany } from '@/hooks/useCompany'
import { useTranslations } from 'next-intl'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']


interface DepartmentCount {
  departments: {
    id: string;
    name: string;
  };
}

interface ChartData {
  name: string;
  value: number;
}

export default function DepartmentDistribution() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { companyId } = useCompany()
  const t = useTranslations('departments.form');

  useEffect(() => {
    if (companyId) {
      fetchDepartmentDistribution()
    }
  }, [companyId])

  async function fetchDepartmentDistribution() {
    try {
      setLoading(true)
      setError(null)

      // First, get all departments with their counts
      const { data: departmentCounts, error: countError } = await supabase
        .from('employees')
        .select(`
          departments!inner (
            id,
            name
          )
        `)
        .eq('company_id', companyId)
        .not('department_id', 'is', null)
        .returns<DepartmentCount[]>();

      if (countError) throw countError

      const counts = departmentCounts.reduce((acc: Record<string, number>, current) => {
        // Get department name directly from the departments object
        const deptName = current.departments?.name;

        if (!deptName) return acc;
        acc[deptName] = (acc[deptName] || 0) + 1;
        return acc;
      }, {});

      // Format data for the pie chart 
      const chartData = Object.entries(counts).map(([name, value]) => ({
        name,
        value
      }))

      setData(chartData)
    } catch (err) {
      console.error('Error fetching department distribution:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch department distribution')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>{t('departmentDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-flame rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>{t('departmentDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-error">
            {t('error')}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle>{t('departmentDistribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-sunset">
            {t('noData')}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>{t('departmentDistribution')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}