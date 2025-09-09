'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Employee } from '@/types/employee';

interface AnniversaryCardProps {
  employees: Array<{
    id: string;
    first_name: string;
    last_name: string;
    hire_date: string;
  }>;
}

const UpcomingAnniversaries = ({ employees }: AnniversaryCardProps) => {
  const t = useTranslations('employees.upcomingAnniversaries');

  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const getUpcomingAnniversaries = () => {
    return employees
      .filter(employee => employee.hire_date)
      .map(employee => {
        const hireDate = new Date(employee.hire_date);
        const thisYearAnniversary = new Date(
          today.getFullYear(),
          hireDate.getMonth(),
          hireDate.getDate()
        );

        // If anniversary has passed this year, look at next year's anniversary
        if (thisYearAnniversary < today) {
          thisYearAnniversary.setFullYear(today.getFullYear() + 1);
        }

        const daysUntilAnniversary = Math.ceil(
          (thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Calculate years of service
        const yearsOfService = today.getFullYear() - hireDate.getFullYear();
        const upcomingYearsOfService = thisYearAnniversary.getFullYear() - hireDate.getFullYear();

        return {
          ...employee,
          daysUntil: daysUntilAnniversary,
          nextAnniversary: thisYearAnniversary,
          yearsOfService,
          upcomingYearsOfService
        };
      })
      .filter(employee => employee.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const upcomingAnniversaries = getUpcomingAnniversaries();

  return (
    <Card className="w-full mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold text-platinum">
          {t('title')}
        </CardTitle>
        <Calendar className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent>
        {upcomingAnniversaries.length === 0 ? (
          <p className="text-center text-sunset py-4">{t('noUpcoming')}</p>
        ) : (
          <div className="space-y-4">
            {upcomingAnniversaries.map(employee => {
              const hireDate = new Date(employee.hire_date);
              return (
                <div 
                  key={employee.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-card-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-base text-primary">
                      {employee.first_name[0]?.toLowerCase()}{employee.last_name[0]?.toLowerCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-platinum">
                        {employee.first_name} {employee.last_name}
                      </h3>
                      <div className="text-sm text-sunset">
                        <span>{t('joined')} {hireDate.toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        <span className="mx-1">•</span>
                        <span>{t('yearsOfServiceAnniversary', { yearsOfService: employee.upcomingYearsOfService })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                      {employee.daysUntil === 0 
                        ? t('today') 
                        : employee.daysUntil === 1 
                          ? t('tomorrow') 
                          : t('inDays', { days: employee.daysUntil })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingAnniversaries;
