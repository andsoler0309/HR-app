'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Employee } from '@/types/employee';

interface BirthdayCardProps {
  employees: Array<{
    id: string;
    first_name: string;
    last_name: string;
    birthday: string;
  }>;
}

const UpcomingBirthdays = ({ employees }: BirthdayCardProps) => {
  const t = useTranslations('employees.upcomingBirthdays');

  const today = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Bogota" }));
  today.setHours(0, 0, 0, 0);
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const getUpcomingBirthdays = () => {
    return employees
      .filter(employee => employee.birthday)
      .map(employee => {
        const birthday = new Date(employee.birthday);
        const thisYearBirthday = new Date(
          today.getFullYear(),
          birthday.getMonth(),
          birthday.getDate()
        );

        // If birthday has passed this year, look at next year's birthday
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(today.getFullYear() + 1);
        }

        const daysUntilBirthday = Math.ceil(
          (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          ...employee,
          daysUntil: daysUntilBirthday,
          nextBirthday: thisYearBirthday,
        };
      })
      .filter(employee => employee.daysUntil <= 30)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const upcomingBirthdays = getUpcomingBirthdays();

  return (
    <Card className="w-full mb-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold text-platinum">
          {t('title')}
        </CardTitle>
        <Gift className="w-5 h-5 text-primary" />
      </CardHeader>
      <CardContent>
        {upcomingBirthdays.length === 0 ? (
          <p className="text-center text-sunset py-4">{t('noUpcoming')}</p>
        ) : (
          <div className="space-y-4">
            {upcomingBirthdays.map(employee => {
              const birthday = new Date(employee.birthday);
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
                      <p className="text-sm text-sunset">
                        {birthday.toLocaleDateString('default', { month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                    {employee.daysUntil === 0 
                      ? t('today') 
                      : employee.daysUntil === 1 
                        ? t('tomorrow') 
                        : t('inDays', { days: employee.daysUntil })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBirthdays;
