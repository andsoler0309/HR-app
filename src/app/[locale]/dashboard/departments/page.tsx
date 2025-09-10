'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Department } from '@/types/employee';
import DepartmentFormModal from '@/components/departments/DepartmentFormModal';
import { useCompany } from '@/hooks/useCompany';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import DepartmentDistribution from '@/components/dashboard/DepartmentDistribution';
import { useTranslations } from 'next-intl';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { companyId } = useCompany();
  const t = useTranslations('departments');

  useEffect(() => {
    if (companyId) {
      fetchDepartments();
    }
  }, [companyId]);

  async function fetchDepartments() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('departments')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (supabaseError) throw supabaseError;
      setDepartments(data || []);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(t('errorFetchingDepartments'));
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchDepartments();
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(t('deleteDepartment'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-sunset">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-flame rounded-full animate-spin" />
          <span className="text-sm">{t('loadingDepartments')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-platinum">{t('title')}</h1>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-platinum">{t('title')}</h1>
          <p className="text-sm text-sunset mt-1 sm:hidden">Organiza tu estructura empresarial</p>
        </div>
        <button
          onClick={() => {
            setSelectedDepartment(undefined);
            setIsModalOpen(true);
          }}
          className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          {t('addDepartment')}
        </button>
      </div>

      {departments.length === 0 ? (
        <div className="bg-card rounded-xl shadow-sm border border-card-border p-8 sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-platinum mb-2">{t('noDepartments')}</h3>
            <p className="text-sunset mb-6 text-sm sm:text-base">{t('getStarted')}</p>
            <button
              onClick={() => {
                setSelectedDepartment(undefined);
                setIsModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              {t('addDepartment')}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Departments Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {departments.map((department) => (
              <div
                key={department.id}
                className="bg-card rounded-xl shadow-sm border border-card-border p-4 sm:p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-platinum mb-2 truncate">
                      {department.name}
                    </h3>
                    <p className="text-sm text-sunset line-clamp-2">
                      {department.description || t('noDescription')}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-3 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedDepartment(department);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-sunset hover:text-primary rounded-lg hover:bg-background transition-colors"
                      aria-label="Editar departamento"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(department.id)}
                      className="p-2 text-sunset hover:text-error rounded-lg hover:bg-background transition-colors"
                      aria-label="Eliminar departamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Department Distribution Chart */}
            <DepartmentDistribution />
        </>
      )}

      <DepartmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        department={selectedDepartment}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchDepartments();
        }}
      />
    </div>
  );
}
