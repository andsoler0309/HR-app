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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground">{card.value}</p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-full`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
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
