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
import { 
  SubscriptionLimitNotification, 
  isSubscriptionLimitError 
} from '@/components/shared/SubscriptionLimitNotification';
import FormField, { FormSection } from '@/components/shared/FormField';

const employeeSchema = z.object({
    first_name: z.string().min(2, 'validation.firstNameRequired'),
    last_name: z.string().min(2, 'validation.lastNameRequired'),
    email: z.string().email('validation.invalidEmail'),
    phone: z.string().optional(),
    department_id: z.string().optional().or(z.literal('')),
    position: z.string().min(2, 'validation.positionRequired'),
    status: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY'], {
        errorMap: () => ({ message: 'validation.invalidStatus' }),
    }),
    hire_date: z.string().nonempty('validation.hireDateRequired'),
    birthday: z.string().nonempty('validation.birthdayRequired'),
    salary: z.number().positive().optional().or(z.nan().transform(() => undefined)),
    // manager_id: z.string().uuid('validation.invalidManagerId').nullable().optional(),
    is_active: z.union([z.boolean(), z.string()]).transform((val) => {
        if (typeof val === 'boolean') return val;
        return val === 'true';
    }),
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
    const tDept = useTranslations('departments.form');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [subscriptionLimitError, setSubscriptionLimitError] = useState<any>(null);
    const [showNewDepartmentField, setShowNewDepartmentField] = useState(false);
    const [newDepartmentName, setNewDepartmentName] = useState('');
    const [isCreatingDepartment, setIsCreatingDepartment] = useState(false);
    const [localDepartments, setLocalDepartments] = useState<Department[]>(departments);
    const isEditing = !!employee;

    useEffect(() => {
        setLocalDepartments(departments);
    }, [departments]);

    const createNewDepartment = async () => {
        if (!newDepartmentName.trim()) return;
        
        try {
            setIsCreatingDepartment(true);
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No authenticated user');

            const { data, error } = await supabase
                .from('departments')
                .insert([{ 
                    name: newDepartmentName.trim(), 
                    company_id: user.id 
                }])
                .select()
                .single();

            if (error) throw error;

            // Add to local departments list
            setLocalDepartments(prev => [...prev, data]);
            
            // Select the new department
            setValue('department_id', data.id);
            
            // Reset the form
            setNewDepartmentName('');
            setShowNewDepartmentField(false);
            
        } catch (err) {
            console.error('Error creating department:', err);
            setError(err instanceof Error ? err.message : 'Error creating department');
        } finally {
            setIsCreatingDepartment(false);
        }
    };

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
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
            // manager_id: employee.manager_id,
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
                // manager_id: employee.manager_id,
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
                    // manager_id: undefined,
                    is_active: true,
                    document_id: '',
                    birthday: ''
                });
            }
            setError(null);
            setShowNewDepartmentField(false);
            setNewDepartmentName('');
        }
    }, [isOpen, reset, isEditing]);

    const onSubmit = async (data: EmployeeFormValues) => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (!user) throw new Error(t('employees.error.noAuthenticatedUser'));

            await checkResourceLimits(supabase, { employees: true }, isEditing);

            if (isEditing && employee?.id) {
                const { error } = await supabase
                    .from('employees')
                    .update({
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        phone: data.phone,
                        department_id: data.department_id || null,
                        position: data.position,
                        status: data.status,
                        hire_date: data.hire_date,
                        birthday: data.birthday,
                        salary: data.salary || null,
                        // manager_id: data.manager_id || null,
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
                        department_id: data.department_id || null,
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
            // Handle subscription limit errors specially
            if (isSubscriptionLimitError(err)) {
                setSubscriptionLimitError(err);
                setError(null);
                setIsLoading(false);
                return;
            }
            
            // check if the error is duplicate document id
            if (err instanceof Error && err.message.includes('duplicate key value') && err.message.includes('employees_document_id_key')) {
                setError(t('error.duplicateDocumentId'));
                setSubscriptionLimitError(null);
                setIsLoading(false);
                return;
            }

            console.error('Error saving employee:', err);
            setError(err instanceof Error ? err.message : t('error.saveError'));
            setSubscriptionLimitError(null);
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
                // manager_id: undefined,
                is_active: true,
                document_id: '',
                birthday: ''
            });
        }
        setError(null);
        setSubscriptionLimitError(null);
        setShowNewDepartmentField(false);
        setNewDepartmentName('');
        onClose();
    };

    const onError = (errors: FieldErrors<EmployeeFormValues>) => {
        console.error("Form Errors:", errors);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-4 sm:p-6 lg:p-8 w-full max-w-4xl border border-card-border shadow-lg max-h-[90vh] overflow-y-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-2 sm:space-y-0">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-platinum">
                        {isEditing ? t('editEmployee') : t('addNewEmployee')}
                    </h2>
                    <button onClick={handleClose} className="text-sunset hover:text-primary text-xl sm:text-2xl self-end sm:self-auto">
                        ×
                    </button>
                </div>

                {subscriptionLimitError && (
                    <SubscriptionLimitNotification 
                        error={subscriptionLimitError} 
                        onClose={() => setSubscriptionLimitError(null)}
                    />
                )}

                {error && <ErrorMessage message={error} className="mb-4 sm:mb-6" />}

                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6 sm:space-y-8">
                    <FormSection 
                        title={t('personalInfo')}
                        description={t('personalInfoDesc')}
                        helpText={t('helpText.personalInfoSection')}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <FormField
                                label={t('firstName')}
                                helpText={t('helpText.firstName') || 'Ingresa el nombre legal del empleado tal como aparece en documentos oficiales.'}
                                required
                                error={errors.first_name ? t(`validation.${errors.first_name.message}`) : undefined}
                            >
                                <input
                                    {...register('first_name')}
                                    className="input-base w-full"
                                    placeholder={t('firstName')}
                                />
                            </FormField>

                            <FormField
                                label={t('lastName')}
                                helpText={t('helpText.lastName')}
                                required
                                error={errors.last_name ? t(`validation.${errors.last_name.message}`) : undefined}
                            >
                                <input
                                    {...register('last_name')}
                                    className="input-base w-full"
                                    placeholder={t('lastName')}
                                />
                            </FormField>

                            <FormField
                                label={t('email')}
                                helpText={t('helpText.email')}
                                required
                                error={errors.email ? t(`validation.${errors.email.message}`) : undefined}
                            >
                                <input
                                    {...register('email')}
                                    type="email"
                                    className="input-base w-full"
                                    placeholder={t('email')}
                                />
                            </FormField>

                            <FormField
                                label={t('documentId')}
                                helpText={t('helpText.documentId')}
                                required
                                error={errors.document_id ? t(`validation.${errors.document_id.message}`) : undefined}
                            >
                                <input
                                    {...register('document_id')}
                                    className="input-base w-full"
                                    placeholder={t('documentId')}
                                />
                            </FormField>

                            <FormField
                                label={t('phone')}
                                helpText={t('helpText.phone')}
                                error={errors.phone ? t(`validation.${errors.phone.message}`) : undefined}
                            >
                                <input
                                    {...register('phone')}
                                    className="input-base w-full"
                                    placeholder={t('phone')}
                                />
                            </FormField>

                            <FormField
                                label={t('birthday')}
                                helpText={t('helpText.birthday')}
                                required
                                error={errors.birthday ? t(`validation.${errors.birthday.message}`) : undefined}
                            >
                                <input
                                    {...register('birthday')}
                                    type="date"
                                    className="input-base w-full"
                                    placeholder={t('birthday')}
                                />
                            </FormField>
                        </div>
                    </FormSection>

                    <FormSection 
                        title={t('jobInfo')}
                        description={t('jobInfoDesc')}
                        helpText={t('helpText.jobInfoSection')}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <FormField
                                label={t('department')}
                                helpText={t('helpText.department')}
                                error={errors.department_id ? t(`validation.${errors.department_id.message}`) : undefined}
                            >
                                <div className="space-y-3">
                                    <select
                                        {...register('department_id')}
                                        className="select-custom w-full"
                                    >
                                        <option value="">{t('selectDepartment')} (opcional)</option>
                                        {localDepartments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    {!showNewDepartmentField ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowNewDepartmentField(true)}
                                            className="text-sm text-primary hover:text-vanilla underline font-medium"
                                        >
                                            + Crear nuevo departamento/área
                                        </button>
                                    ) : (
                                        <div className="space-y-2 p-3 bg-background/50 rounded-lg border border-card-border">
                                            <label className="block text-sm font-medium text-sunset">
                                                Nombre del nuevo departamento/área
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={newDepartmentName}
                                                    onChange={(e) => setNewDepartmentName(e.target.value)}
                                                    className="input-base flex-1"
                                                    placeholder="Ej: Marketing, Ventas, IT..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            createNewDepartment();
                                                        }
                                                        if (e.key === 'Escape') {
                                                            setShowNewDepartmentField(false);
                                                            setNewDepartmentName('');
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={createNewDepartment}
                                                    disabled={!newDepartmentName.trim() || isCreatingDepartment}
                                                    className="btn-primary px-3 py-2 text-sm disabled:opacity-50"
                                                >
                                                    {isCreatingDepartment ? (
                                                        <LoadingSpinner className="w-4 h-4" />
                                                    ) : (
                                                        'Crear'
                                                    )}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowNewDepartmentField(false);
                                                        setNewDepartmentName('');
                                                    }}
                                                    className="btn-secondary px-3 py-2 text-sm"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </FormField>

                            <FormField
                                label={t('position')}
                                helpText={t('helpText.position')}
                                required
                                error={errors.position ? t(`validation.${errors.position.message}`) : undefined}
                            >
                                <input
                                    {...register('position')}
                                    className="input-base w-full"
                                    placeholder={t('position')}
                                />
                            </FormField>

                            <FormField
                                label={t('employeeType')}
                                helpText={t('helpText.employeeType')}
                                required
                                error={errors.status ? t(`validation.${errors.status.message}`) : undefined}
                            >
                                <select
                                    {...register('status')}
                                    className="select-custom w-full"
                                >
                                    <option value="">{t('selectEmployeeType')}</option>
                                    <option value="FULL_TIME">{t('employeeTypeOptions.fullTime')}</option>
                                    <option value="PART_TIME">{t('employeeTypeOptions.partTime')}</option>
                                    <option value="CONTRACTOR">{t('employeeTypeOptions.contract')}</option>
                                    <option value="TEMPORARY">{t('employeeTypeOptions.intern')}</option>
                                </select>
                            </FormField>

                            <FormField
                                label={t('hireDate')}
                                helpText={t('helpText.hireDate')}
                                required
                                error={errors.hire_date ? t(`validation.${errors.hire_date.message}`) : undefined}
                            >
                                <input
                                    {...register('hire_date')}
                                    type="date"
                                    className="input-base w-full"
                                    placeholder={t('hireDate')}
                                />
                            </FormField>

                            <FormField
                                label={t('salary')}
                                helpText={t('helpText.salary')}
                                error={errors.salary ? t(`validation.${errors.salary.message}`) : undefined}
                            >
                                <input
                                    {...register('salary', { valueAsNumber: true })}
                                    type="number"
                                    className="input-base w-full"
                                    placeholder={t('salary')}
                                />
                            </FormField>

                            <FormField
                                label={t('isActive')}
                                helpText={t('helpText.isActive')}
                                error={errors.is_active ? t(`validation.${errors.is_active.message}`) : undefined}
                            >
                                <select
                                    {...register('is_active', {
                                        setValueAs: (value) => value === 'true'
                                    })}
                                    className="select-custom w-full"
                                >
                                    <option value="true">{t('isActiveOptions.true')}</option>
                                    <option value="false">{t('isActiveOptions.false')}</option>
                                </select>
                            </FormField>
                        </div>
                    </FormSection>

                    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn-secondary px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg order-2 sm:order-1"
                        >
                            {t('cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn-primary px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg disabled:opacity-50 order-1 sm:order-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <LoadingSpinner className="w-4 sm:w-5 h-4 sm:h-5" />
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
