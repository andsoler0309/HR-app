'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, TrendingUp } from 'lucide-react';
import { calcularDeducciones, formatCurrency } from '@/lib/payrollUtils';
import { useTranslations } from 'next-intl';

interface SalaryRange {
  range: string;
  count: number;
}

export default function PayrollSummary() {
  const t = useTranslations('PayrollSummary');
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    totalSalaries: 0,
    averageSalary: 0,
    totalDeductions: 0,
    netPayroll: 0,
  });
  const [loading, setLoading] = useState(true);
  const [salaryRanges, setSalaryRanges] = useState<SalaryRange[]>([]);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  async function fetchSummaryData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('salary, status')
        .eq('company_id', user.id);

      if (employeesError) throw employeesError;

      const employees = employeesData || [];
      const totalEmployees = employees.length;
      const totalSalaries = employees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
      const averageSalary = totalEmployees > 0 ? totalSalaries / totalEmployees : 0;

      const employeesWithDeductions = employees.map((emp) => {
        const deducciones = calcularDeducciones(emp.salary, emp.status);
        return {
          ...emp,
          deducciones,
          salarioNeto: emp.salary - deducciones.total,
        };
      });
      const totalDeductions = employeesWithDeductions.reduce((sum, emp) => sum + (emp.deducciones.total || 0), 0);
      const netPayroll = totalSalaries - totalDeductions;

      const ranges = {
        '0-2M': 0,
        '2M-4M': 0,
        '4M-6M': 0,
        '6M+': 0,
      };

      employees.forEach((emp) => {
        const salary = emp.salary || 0;
        if (salary <= 2000000) ranges['0-2M']++;
        else if (salary <= 4000000) ranges['2M-4M']++;
        else if (salary <= 6000000) ranges['4M-6M']++;
        else ranges['6M+']++;
      });

      setSalaryRanges(
        Object.entries(ranges).map(([range, count]) => ({
          range,
          count,
        }))
      );

      setSummary({
        totalEmployees,
        totalSalaries,
        averageSalary,
        totalDeductions,
        netPayroll,
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <span>{t('loadingSummary')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-card-border p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-flame/10 rounded-lg">
              <Users className="w-6 h-6 text-flame" />
            </div>
            <div>
              <p className="text-sm font-medium text-sunset">{t('totalEmployees')}</p>
              <h3 className="text-2xl font-bold text-platinum mt-1">
                {summary.totalEmployees.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-card-border p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-sunset">{t('totalGrossSalaries')}</p>
              <h3 className="text-2xl font-bold text-platinum mt-1">
                {formatCurrency(summary.totalSalaries)}
              </h3>
              <p className="text-sm text-sunset mt-1">
                {t('averageSalary')}: {formatCurrency(summary.averageSalary)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-card-border p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-vanilla/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-vanilla" />
            </div>
            <div>
              <p className="text-sm font-medium text-sunset">{t('netPayroll')}</p>
              <h3 className="text-2xl font-bold text-platinum mt-1">
                {formatCurrency(summary.netPayroll)}
              </h3>
              <p className="text-sm text-sunset mt-1">
                {t('deductions')}: {formatCurrency(summary.totalDeductions)}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-xl border border-card-border p-6">
        <h3 className="text-lg font-semibold text-platinum mb-6">{t('salaryDistribution')}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salaryRanges} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(211, 213, 215, 0.1)" />
              <XAxis dataKey="range" tick={{ fill: '#EFC88B' }} axisLine={{ stroke: 'rgba(211, 213, 215, 0.1)' }} />
              <YAxis tick={{ fill: '#EFC88B' }} axisLine={{ stroke: 'rgba(211, 213, 215, 0.1)' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#050517',
                  border: '1px solid rgba(207, 92, 54, 0.2)',
                  borderRadius: '8px',
                  color: '#D3D5D7',
                  boxShadow: '0 4px 6px rgba(5, 5, 23, 0.4)',
                }}
              />
              <Bar dataKey="count" name="Employees" fill="#CF5C36" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
