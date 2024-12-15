'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { calcularDeducciones, formatCurrency } from '@/lib/payrollUtils';
import type { Employee } from '@/types/employee';
import { useTranslations } from 'next-intl';

export default function EmployeePayrollTable() {
  const t = useTranslations('EmployeePayrollTable');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          departments (
            name
          )
        `)
        .eq('is_active', true)
        .eq('company_id', user.id);

      if (error) throw error;

      const employeesWithDeductions = data.map((emp) => {
        const deducciones = calcularDeducciones(emp.salary, emp.status);
        return {
          ...emp,
          deducciones,
          salarioNeto: emp.salary - deducciones.total,
        };
      });

      setEmployees(employeesWithDeductions);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  }

  const exportToExcel = () => {
    const csvContent = [
      // Headers
      [
        t('employee'),
        'Documento',
        t('position'),
        'Departamento',
        t('baseSalary'),
        t('health'),
        t('pension'),
        t('solidarityFund'),
        t('withholding'),
        t('totalDeductions'),
        t('netSalary'),
      ],
      // Data rows
      ...employees.map((emp) => [
        `${emp.first_name} ${emp.last_name}`,
        emp.document_id,
        emp.position,
        emp.department?.name,
        emp.salary,
        emp.deducciones.salud,
        emp.deducciones.pension,
        emp.deducciones.fondoSolidaridad,
        emp.deducciones.retencionFuente,
        emp.deducciones.total,
        emp.salarioNeto,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'nomina_empleados.csv';
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-sunset">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-flame/20 border-t-flame rounded-full animate-spin" />
          <span>{t('loadingEmployees')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-platinum">{t('title')}</h2>
        <Button 
          onClick={exportToExcel}
          className="inline-flex items-center gap-2 bg-flame hover:bg-flame/90"
        >
          <Download className="w-4 h-4" />
          {t('export')}
        </Button>
      </div>

      <div className="rounded-lg border border-card-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sunset">{t('employee')}</TableHead>
              <TableHead className="text-sunset">{t('position')}</TableHead>
              <TableHead className="text-sunset text-right">{t('baseSalary')}</TableHead>
              <TableHead className="text-sunset text-right">{t('health')}</TableHead>
              <TableHead className="text-sunset text-right">{t('pension')}</TableHead>
              <TableHead className="text-sunset text-right">{t('solidarityFund')}</TableHead>
              <TableHead className="text-sunset text-right">{t('withholding')}</TableHead>
              <TableHead className="text-sunset text-right">{t('totalDeductions')}</TableHead>
              <TableHead className="text-sunset text-right">{t('netSalary')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee: Employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium text-platinum">
                  {employee.first_name} {employee.last_name}
                </TableCell>
                <TableCell className="text-sunset">{employee.position}</TableCell>
                <TableCell className="text-right text-platinum">
                  {formatCurrency(employee.salary ?? 0)}
                </TableCell>
                <TableCell className="text-right text-sunset">
                  {formatCurrency(employee.deducciones.salud)}
                </TableCell>
                <TableCell className="text-right text-sunset">
                  {formatCurrency(employee.deducciones.pension)}
                </TableCell>
                <TableCell className="text-right text-sunset">
                  {formatCurrency(employee.deducciones.fondoSolidaridad)}
                </TableCell>
                <TableCell className="text-right text-sunset">
                  {formatCurrency(employee.deducciones.retencionFuente)}
                </TableCell>
                <TableCell className="text-right text-sunset">
                  {formatCurrency(employee.deducciones.total)}
                </TableCell>
                <TableCell className="text-right text-platinum font-medium">
                  {formatCurrency(employee.salarioNeto)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
