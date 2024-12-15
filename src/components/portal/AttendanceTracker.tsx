'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import type { TimeOffRequest } from '@/types/timeoff';
import type { Employee, EmployeeAttendance } from '@/types/employee'; // Assuming the types are in this file

interface AttendanceTrackerProps {
  user: {
    employee_id: string;
    company_id: string;
  };
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ user }) => {
  const t = useTranslations('AttendanceTracker');
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [lastAttendance, setLastAttendance] = useState<EmployeeAttendance | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<EmployeeAttendance[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCurrentStatus();
    fetchTimeOffRequests();
  }, [user]);

  const fetchCurrentStatus = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('employee_attendance')
        .select('*')
        .eq('employee_id', user.employee_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .returns<EmployeeAttendance[]>();

      if (error) throw error;

      if (data && data[0]) {
        setLastAttendance(data[0]);
        setIsCheckedIn(data[0].clock_out === null);
      }
    } catch (error) {
      console.error('Error fetching attendance status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeOffRequests = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('time_off_requests')
        .select(`
          *,
          employee:employee_id(*)
        `)
        .eq('employee_id', user.employee_id)
        .returns<TimeOffRequest[]>();

      if (error) throw error;
      setTimeOffRequests(data || []);
    } catch (error) {
      console.error('Error fetching time off requests:', error);
    }
  };

  const handleClockInOut = async (): Promise<void> => {
    try {
      if (!isCheckedIn) {
        // Clock In
        const { error } = await supabase
          .from('employee_attendance')
          .insert({
            employee_id: user.employee_id,
            company_id: user.company_id,
            clock_in: new Date().toISOString(),
          });

        if (error) throw error;
      } else if (lastAttendance) {
        // Clock Out
        const { error } = await supabase
          .from('employee_attendance')
          .update({
            clock_out: new Date().toISOString(),
          })
          .eq('id', lastAttendance.id);

        if (error) throw error;
      }

      await fetchCurrentStatus();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const formatTime = (date: string): string => {
    return new Date(date).toLocaleTimeString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center">
              <Button
                onClick={handleClockInOut}
                className={`w-48 h-48 rounded-full text-xl font-bold ${
                  isCheckedIn ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
                disabled={loading}
              >
                {loading ? t('loading') : isCheckedIn ? t('clockOut') : t('clockIn')}
              </Button>
            </div>

            {lastAttendance && (
              <div className="mt-6 text-center">
                <p className="text-lg text-sunset">
                  {isCheckedIn ? t('lastClockIn') : t('lastClockOut')}:{' '}
                  <span className="font-bold text-platinum">
                    {formatTime(isCheckedIn ? lastAttendance.clock_in : lastAttendance.clock_out || '')}
                  </span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTracker;