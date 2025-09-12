'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Department } from '@/types/employee';
import { supabase } from '@/lib/supabase';
import { useCompany } from '@/hooks/useCompany';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { checkResourceLimits } from '@/lib/subscriptions-limits';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { 
  SubscriptionLimitNotification, 
  isSubscriptionLimitError 
} from '@/components/shared/SubscriptionLimitNotification';

const departmentSchema = z.object({
  name: z.string().min(2, 'nameRequired'),
  description: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  department?: Department;
  onSuccess: () => void;
}

export default function DepartmentFormModal({ isOpen, onClose, department, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionLimitError, setSubscriptionLimitError] = useState<any>(null);
  const { companyId, isLoading: isCompanyLoading, error: companyError } = useCompany();
  const isEditing = !!department;
  const t = useTranslations('departments.form');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: department || {
      name: '',
      description: '',
    }
  });

  useEffect(() => {
    if (department) {
      setValue('name', department.name);
      setValue('description', department.description || '');
    } else {
      reset({
        name: '',
        description: '',
      });
    }
  }, [department, setValue, reset]);

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check for company loading state first
      if (isCompanyLoading) {
        throw new Error(t('loading'));
      }
      
      // Check for company error
      if (companyError) {
        console.error('Company error:', companyError);
        throw new Error(companyError.message);
      }
      
      if (!companyId) {
        console.error('No company ID available. Auth state:', {
          isCompanyLoading,
          companyError,
          companyId
        });
        throw new Error(t('error.noAuthenticatedUser'));
      }

      console.log('Creating department with company_id:', companyId);

      await checkResourceLimits(supabase, { departments: true }, isEditing);

      if (isEditing && department?.id) {
        const { error: updateError } = await supabase
          .from('departments')
          .update(data)
          .eq('id', department.id);
          
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('departments')
          .insert([{ ...data, company_id: companyId }]);
          
        if (insertError) throw insertError;
      }

      reset();
      onSuccess();
      handleClose();
    } catch (err) {
      // Handle subscription limit errors specially
      if (isSubscriptionLimitError(err)) {
        setSubscriptionLimitError(err);
        setError(null);
        setIsLoading(false);
        return;
      }
      
      console.error('Error saving department:', err);
      setError(t('error.saveDepartment'));
      setSubscriptionLimitError(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSubscriptionLimitError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-4 sm:p-6 lg:p-8 w-full max-w-lg shadow-lg border border-card-border animate-in fade-in">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-platinum">
          {isEditing ? t('editDepartment') : t('addDepartment')}
        </h2>

        {subscriptionLimitError && (
          <SubscriptionLimitNotification 
            error={subscriptionLimitError} 
            onClose={() => setSubscriptionLimitError(null)}
          />
        )}

        {companyError && <ErrorMessage message={companyError.message} className="mb-4 sm:mb-6" />}
        {error && <ErrorMessage message={error} className="mb-4 sm:mb-6" />}
        {isCompanyLoading && (
          <div className="mb-4 sm:mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm flex items-center gap-2">
              <LoadingSpinner className="w-4 h-4" />
              Loading company information...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-sunset">
              {t('name')}
            </label>
            <input
              type="text"
              {...register('name')}
              className="input-base w-full"
              placeholder={t('name')}
              disabled={isLoading || isCompanyLoading}
            />
            {errors.name && (
              <p className="text-sm text-error flex items-center gap-2">
                <span className="inline-block w-1 h-1 bg-error rounded-full" />
                {t(`validation.${errors.name.message}`)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-sunset">
              {t('description')}
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="input-base w-full resize-none"
              placeholder={t('description')}
              disabled={isLoading || isCompanyLoading}
            />
            {errors.description && (
              <p className="text-sm text-error flex items-center gap-2">
                <span className="inline-block w-1 h-1 bg-error rounded-full" />
                {t(`validation.${errors.description.message}`)}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="secondary"
              className="px-4 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto"
              disabled={isLoading || isCompanyLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="default"
              className="px-6 py-2.5 rounded-lg text-sm font-medium min-w-[100px] flex items-center justify-center w-full sm:w-auto"
              disabled={isLoading || isCompanyLoading}
            >
              {isLoading || isCompanyLoading ? (
                <LoadingSpinner className="w-4 sm:w-5 h-4 sm:h-5" />
              ) : isEditing ? (
                t('update')
              ) : (
                t('create')
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
