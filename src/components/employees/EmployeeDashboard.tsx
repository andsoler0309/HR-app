'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserRound, Users, UserMinus } from 'lucide-react';
import { Employee } from '@/types/employee';
import { useTranslations } from 'next-intl';

interface EmployeeDashboardProps {
  employees: Employee[];
}

const EmployeeDashboard = ({ employees }: EmployeeDashboardProps) => {
  const t = useTranslations('employees.dashboard');

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.is_active).length;
  const inactiveEmployees = employees.filter(emp => !emp.is_active).length;

  const cards = [
    {
      title: t('totalEmployees'),
      value: totalEmployees,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: t('activeEmployees'),
      value: activeEmployees,
      icon: UserRound,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: t('inactiveEmployees'),
      value: inactiveEmployees,
      icon: UserMinus,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-text-secondary mb-1 truncate">{card.title}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{card.value}</p>
                </div>
                <div className={`${card.bgColor} p-2.5 rounded-full flex-shrink-0 ml-3`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default EmployeeDashboard;
