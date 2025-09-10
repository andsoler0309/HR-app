'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import RequestForm from '@/components/portal/RequestForm';
import RequestList from '@/components/portal/RequestList';
import type { PortalUser, PortalRequest } from '@/types/portal';
import { TimeOffBalance } from '@/types/timeoff';
import TimeOffBalances from '@/components/time-off/Balances';
import AttendanceTracker from '@/components/portal/AttendanceTracker';
import { useTranslations } from 'next-intl';

export default function PortalDashboard() {
  const t = useTranslations('PortalDashboard');
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [requests, setRequests] = useState<PortalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<TimeOffBalance[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('portal_user');
    if (!userData) {
      router.push('/portal');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    fetchRequests();
    if (parsedUser.employee_id && parsedUser.company_id) {
      fetchBalances(parsedUser.employee_id, parsedUser.company_id);
    }
  }, []);

  async function fetchRequests() {
    try {
      const userData = localStorage.getItem('portal_user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const { data, error } = await supabase
        .from('employee_portal_requests')
        .select('*')
        .eq('employee_id', user.employee_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBalances(employeeId: string, companyId: string) {
    try {
      const { data, error } = await supabase
        .from('time_off_balances')
        .select(`
          *,
          policy:policy_id(*),
          employee:employee_id(first_name, last_name)
        `)
        .eq('company_id', companyId)
        .eq('employee_id', employeeId);

      if (error) throw error;
      setBalances(data || []);
    } catch (error) {
      console.error('Error fetching balances:', error);
      setBalances([]);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('portal_user');
    router.push('/portal');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-card-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 sm:h-20">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-platinum">{t('title')}</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-platinum font-medium text-sm">
                    {user.first_name?.[0]}
                    {user.last_name?.[0]}
                  </span>
                </div>
                <span className="text-sunset font-medium text-sm sm:text-base hidden sm:block">
                  {user.first_name} {user.last_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sunset hover:text-platinum hover:bg-background transition-colors duration-200 text-sm sm:text-base"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          <div className="bg-card rounded-xl shadow-md overflow-hidden border border-card-border">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-platinum mb-4 sm:mb-6">
                {t('employeeInformation')}
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <span className="text-sunset font-medium text-base sm:text-lg">{t('department')}:</span>
                  <span className="text-platinum text-base sm:text-lg">{user.department?.name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <span className="text-sunset font-medium text-base sm:text-lg">{t('email')}:</span>
                  <span className="text-platinum text-base sm:text-lg break-all">{user.email}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <span className="text-sunset font-medium text-base sm:text-lg">{t('role')}:</span>
                  <span className="text-platinum text-base sm:text-lg">{user.position}</span>
                </div>
              </div>

              <div className="mt-6 sm:mt-8">
                <TimeOffBalances balances={balances} loading={loading} />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-md overflow-hidden border border-card-border">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-platinum mb-4 sm:mb-6">
                {t('submitRequest')}
              </h2>
              <RequestForm
                user={user}
                onSuccess={() => {
                  fetchRequests();
                  if (user.employee_id && user.company_id) {
                    fetchBalances(user.employee_id, user.company_id);
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <div className="bg-card rounded-xl shadow-md overflow-hidden border border-card-border">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-platinum mb-4 sm:mb-6">{t('myRequests')}</h2>
              <RequestList requests={requests} loading={loading} />
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <AttendanceTracker user={user} />
        </div>
      </main>
    </div>
  );
}
