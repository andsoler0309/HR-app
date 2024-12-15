'use client';
import { useState, useEffect } from 'react';
import { useForm, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Employee, Department } from '@/types/employee'; // Ensure Document type is defined
import { supabase } from '@/lib/supabase';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { checkResourceLimits } from '@/lib/subscriptions-limits';
import { useTranslations } from 'next-intl';
import { Document } from '@/types/document';

const employeeSchema = z.object({
    first_name: z.string().min(2, 'validation.firstNameRequired'),
    last_name: z.string().min(2, 'validation.lastNameRequired'),
    email: z.string().email('validation.invalidEmail'),
    phone: z.string().optional(),
    department_id: z.string().uuid('validation.departmentRequired'),
    position: z.string().min(2, 'validation.positionRequired'),
    status: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY'], {
        errorMap: () => ({ message: 'validation.invalidStatus' }),
    }),
    hire_date: z.string().nonempty('validation.hireDateRequired'),
    birthday: z.string().nonempty('validation.birthdayRequired'),
    salary: z.number().positive().optional(),
    manager_id: z.string().uuid('validation.invalidManagerId').nullable().optional(),
    is_active: z.boolean().default(true),
    document_id: z.string().nonempty('validation.documentIdRequired')
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    employee?: Employee;
    onSuccess: () => void;
    departments: Department[];
}

export default function EmployeeFormModal({ isOpen, onClose, employee, onSuccess, departments }: Props) {
    const t = useTranslations('employees.form');
    const tAlerts = useTranslations('employees.alerts');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isEditing = !!employee;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues: employee ? {
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            phone: employee.phone || '',
            department_id: employee.department_id,
            position: employee.position,
            status: employee.status,
            hire_date: employee.hire_date,
            salary: employee.salary,
            manager_id: employee.manager_id,
            is_active: employee.is_active,
            document_id: employee.document_id,
            birthday: employee.birthday
        } : {
            status: 'FULL_TIME',
            is_active: true
        }
    });

    useEffect(() => {
        if (employee) {
            reset({
                first_name: employee.first_name,
                last_name: employee.last_name,
                email: employee.email,
                phone: employee.phone || '',
                department_id: employee.department_id,
                position: employee.position,
                status: employee.status,
                hire_date: employee.hire_date,
                birthday: employee.birthday,
                salary: employee.salary,
                manager_id: employee.manager_id,
                is_active: employee.is_active,
                document_id: employee.document_id
            });
        } else {
            reset({
                status: 'FULL_TIME',
                is_active: true
            });
        }
    }, [employee, reset]);

    useEffect(() => {
        if (!isOpen) {
            if (!isEditing) {
                reset({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    department_id: '',
                    position: '',
                    status: 'FULL_TIME',
                    hire_date: '',
                    salary: undefined,
                    manager_id: undefined,
                    is_active: true,
                    document_id: '',
                    birthday: ''
                });
            }
            setError(null);
        }
    }, [isOpen, reset, isEditing]);

    const onSubmit = async (data: EmployeeFormValues) => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error(t('error.noAuthenticatedUser'));

            await checkResourceLimits(supabase, { employees: true }, isEditing);

            if (isEditing && employee?.id) {
                const { error } = await supabase
                    .from('employees')
                    .update({
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        phone: data.phone,
                        department_id: data.department_id,
                        position: data.position,
                        status: data.status,
                        hire_date: data.hire_date,
                        birthday: data.birthday,
                        salary: data.salary || null,
                        manager_id: data.manager_id || null,
                        updated_at: new Date().toISOString(),
                        is_active: data.is_active,
                        document_id: data.document_id
                    })
                    .eq('id', employee.id)
                    .select();

                if (error) {
                    console.error('Update error:', error);
                    throw error;
                }
            } else {
                const { error } = await supabase
                    .from('employees')
                    .insert([{
                        ...data,
                        company_id: user.id,
                        birthday: data.birthday,
                        is_active: data.is_active,
                        document_id: data.document_id
                    }]);

                if (error) throw error;
            }

            onSuccess();
            handleClose();
        } catch (err) {
            console.error('Error saving employee:', err);
            setError(err instanceof Error ? err.message : t('error.saveError'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isEditing) {
            reset({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                department_id: '',
                position: '',
                status: 'FULL_TIME',
                hire_date: '',
                salary: undefined,
                manager_id: undefined,
                is_active: true,
                document_id: '',
                birthday: ''
            });
        }
        setError(null);
        onClose();
    };

    const onError = (errors: FieldErrors<EmployeeFormValues>) => {
        console.log("Form Errors:", errors);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
            <div className="bg-card rounded-xl p-8 w-full max-w-2xl border border-card-border shadow-lg">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-semibold text-platinum">
                        {isEditing ? t('editEmployee') : t('addNewEmployee')}
                    </h2>
                    <button onClick={handleClose} className="text-sunset hover:text-flame text-2xl">
                        ×
                    </button>
                </div>

                {error && <ErrorMessage message={error} className="mb-6" />}

                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-base font-medium text-sunset mb-2">
                                {t('firstName')}
                            </label>
                            <input
                                {...register('first_name')}
                                className="input-base w-full"
                                placeholder={t('firstName')}
                            />
                            {errors.first_name && (
                                <p className="mt-2 text-base text-error">
                                    {t(`validation.${errors.first_name.message}`)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium text-sunset mb-2">
                                {t('lastName')}
                            </label>
                            <input
                                {...register('last_name')}
                                className="input-base w-full"
                                placeholder={t('lastName')}
                            />
                            {errors.last_name && (
                                <p className="mt-2 text-base text-error">
                                    {t(`validation.${errors.last_name.message}`)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium text-sunset mb-2">
                                {t('email')}
                            </label>
                            <input
                                {...register('email')}
                                type="email"
                                className="input-base w-full"
                                placeholder={t('email')}
                            />
                            {errors.email && (
                                <p className="mt-2 text-base text-error">
                                    {t(`validation.${errors.email.message}`)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium text-sunset mb-2">
                                {t('documentId')}
                            </label>
                            <input
                                {...register('document_id')}
                                className="input-base w-full"
                                placeholder={t('documentId')}
                            />
                            {errors.document_id && (
                                <p className="mt-2 text-base text-error">
                                    {t(`validation.${errors.document_id.message}`)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium text-sunset mb-2">
                                {t('phone')}
                            </label>
                            <input
                                {...register('phone')}
                                className="input-base w-full"
                                placeholder={t('phone')}
                            />
                            {errors.phone && (
                                <p className="mt-2 text-base text-error">
                                    {t(`validation.${errors.phone.message}`)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium text-sunset mb-2">
                                {t('department')}
                            </label>
                            <select
                                {...register('department_id')}
                                className="input-base w-full"
                            >
                                <option value="">{t('selectDepartment')}</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            {errors.department_id && (
                                <p className="mt-2 text-base text-error">
                                    {t(`validation.${errors.department_id.message}`)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium text-sunset mb-2">
                                {t('position')}
                            </label>
                            <input
                                {...register('position')}
                                className="input-base w-full"
                                placeholder={t('position')}
                            />
                            {errors.position && (
                                <p className="mt-2 text-base text-error">
                                    {t(`validation.${errors.position.message}`)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium text-sunset mb-2">
                                {t('employeeType')}
                            </label>
                            <select
                                {...register('status')}
                                className="input-base w-full"
                            >
                                <option value="">{t('selectEmployeeType')}</option>
                                <option value="FULL_TIME">{t('employeeTypeOptions.fullTime')}</option>
                                <option value="PART_TIME">{t('employeeTypeOptions.partTime')}</option>
                                <option value="CONTRACT">{t('employeeTypeOptions.contract')}</option>
                                <option value="INTERN">{t('employeeTypeOptions.intern')}</option>
                            </select>
                            {errors.status && (
                                <p className="mt-2 text-base text-error">
                                    {t(`validation.${errors.status.message}`)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium text-sunset mb-2">
                                {t('hireDate')}
                            </label>
                            <input
                                {...register('hire_date')}
                                type="date"
                                className="input-base w-full"
                                placeholder={t('hireDate')}
                            />
                            {errors.hire_date && (
                                <p className="mt-2 text-base text-error">
                                    {t(`validation.${errors.hire_date.message}`)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium text-sunset mb-2">
                                {t('salary')}
                            </label>
                            <input
                                {...register('salary', { valueAsNumber: true })}
                                type="number"
                                className="input-base w-full"
                                placeholder={t('salary')}
                            />
                            {errors.salary && (
                                <p className="mt-2 text-base text-error">
                                    {t(`validation.${errors.salary.message}`)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium text-sunset mb-2">
                                {t('birthday')}
                            </label>
                            <input
                                {...register('birthday')}
                                type="date"
                                className="input-base w-full"
                                placeholder={t('birthday')}
                            />
                            {errors.birthday && (
                                <p className="mt-2 text-base text-error">
                                    {t(`validation.${errors.birthday.message}`)}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-base font-medium text-sunset mb-2">
                                {t('isActive')}
                            </label>
                            <select
                                {...register('is_active')}
                                className="input-base w-full"
                            >
                                <option value="true">{t('isActiveOptions.true')}</option>
                                <option value="false">{t('isActiveOptions.false')}</option>
                            </select>
                            {errors.is_active && (
                                <p className="mt-2 text-base text-error">
                                    {t(`validation.${errors.is_active.message}`)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn-secondary px-6 py-3 text-base rounded-lg"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn-primary px-6 py-3 text-base rounded-lg disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <LoadingSpinner className="w-5 h-5" />
                            ) : isEditing ? (
                                t('update')
                            ) : (
                                t('create')
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
