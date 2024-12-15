'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, FileText, MoreHorizontal, AlertCircle, Clock, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PortalUser } from '@/types/portal';
import { TimeOffPolicy } from '@/types/timeoff';

interface RequestFormProps {
  user: PortalUser;
  onSuccess: () => void;
}

export default function RequestForm({ user, onSuccess }: RequestFormProps) {
  const t = useTranslations('RequestForm');
  const [type, setType] = useState<string>('TIME_OFF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [policies, setPolicies] = useState<TimeOffPolicy[]>([]);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: '',
    leave_type: 'VACATION',
  });

  useEffect(() => {
    async function fetchPolicies() {
      if (!user.company_id) return;

      const { data, error } = await supabase
        .from('time_off_policies')
        .select('*')
        .eq('company_id', user.company_id);

      if (error) {
        console.error('Error fetching policies:', error);
        return;
      }

      setPolicies(data);
      if (data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          leave_type: data[0].type,
        }));
      }
    }

    fetchPolicies();
  }, [user.company_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user.employee_id || !user.company_id) {
        throw new Error(t('invalidSession'));
      }

      if (type === 'TIME_OFF' && (!formData.start_date || !formData.end_date)) {
        throw new Error(t('missingDates'));
      }

      const { error: submitError } = await supabase
        .from('employee_portal_requests')
        .insert({
          employee_id: user.employee_id,
          company_id: user.company_id,
          type,
          status: 'PENDING',
          data: {
            ...formData,
            employee_name: `${user.first_name} ${user.last_name}`,
            department: user.department,
            start_date: type === 'TIME_OFF' ? formData.start_date : null,
            end_date: type === 'TIME_OFF' ? formData.end_date : null,
            leave_type: type === 'TIME_OFF' ? formData.leave_type : null,
          },
        });

      if (submitError) throw submitError;

      setFormData({
        start_date: '',
        end_date: '',
        reason: '',
        leave_type: 'VACATION',
      });

      onSuccess();
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err instanceof Error ? err.message : t('errorMessage'));
    } finally {
      setLoading(false);
    }
  };

  const getRequestTypeIcon = (requestType: string) => {
    switch (requestType) {
      case 'TIME_OFF':
        return <Clock className="w-4 h-4" />;
      case 'DOCUMENT':
        return <FileText className="w-4 h-4" />;
      default:
        return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-error bg-error/10 rounded-lg border border-error/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-md font-semibold text-sunset">
          {t('requestTypeLabel')}
        </label>
        <div className="relative">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input-base w-full pl-10 pr-10"
          >
            <option value="TIME_OFF">{t('timeOffRequest')}</option>
          </select>
          <div className="absolute left-3 top-3 text-sunset">{getRequestTypeIcon(type)}</div>
        </div>
      </div>

      {type === 'TIME_OFF' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-md font-semibold text-sunset">
                {t('startDateLabel')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      start_date: e.target.value,
                    })
                  }
                  className="input-base w-full pl-10 pr-4"
                />
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-sunset" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-md font-semibold text-sunset">
                {t('endDateLabel')}
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      end_date: e.target.value,
                    })
                  }
                  min={formData.start_date}
                  className="input-base w-full pl-10 pr-4"
                />
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-sunset" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-md font-semibold text-sunset">
              {t('leaveTypeLabel')}
            </label>
            <select
              value={formData.leave_type}
              required
              onChange={(e) =>
                setFormData({
                  ...formData,
                  leave_type: e.target.value,
                })
              }
              className="input-base w-full"
            >
              <option value="">{t('selectLeaveType')}</option>
              {policies.map((policy) => (
                <option key={policy.id} value={policy.type}>
                  {policy.type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="space-y-2">
        <label className="block text-md font-semibold text-sunset">
          {t('reasonLabel')}
        </label>
        <textarea
          value={formData.reason}
          required
          onChange={(e) =>
            setFormData({
              ...formData,
              reason: e.target.value,
            })
          }
          rows={3}
          className="input-base w-full resize-none"
          placeholder={t('reasonPlaceholder')}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg disabled:opacity-50 font-medium"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-platinum/20 border-t-platinum rounded-full animate-spin" />
              <span>{t('submitting')}</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>{t('submitButton')}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
