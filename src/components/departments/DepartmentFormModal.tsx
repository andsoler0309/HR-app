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
  const { companyId } = useCompany();
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
      
      if (!companyId) throw new Error(t('error.noAuthenticatedUser'));

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
      onClose();
    } catch (err) {
      console.error('Error saving department:', err);
      setError(t('error.saveDepartment'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-8 w-full max-w-md shadow-lg border border-card-border animate-in fade-in">
        <h2 className="text-2xl font-semibold mb-6 text-platinum">
          {isEditing ? t('editDepartment') : t('addDepartment')}
        </h2>

        {error && <ErrorMessage message={error} className="mb-6" />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-sunset">
              {t('name')}
            </label>
            <input
              type="text"
              {...register('name')}
              className="input-base w-full"
              placeholder={t('name')}
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
            />
            {errors.description && (
              <p className="text-sm text-error flex items-center gap-2">
                <span className="inline-block w-1 h-1 bg-error rounded-full" />
                {t(`validation.${errors.description.message}`)}
              </p>
            )}
          </div>

          <div className="flex justify-end items-center gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="px-4 py-2.5 rounded-lg text-sm font-medium"
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              variant="default"
              className="px-6 py-2.5 rounded-lg text-sm font-medium min-w-[100px] flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner className="w-5 h-5" />
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
