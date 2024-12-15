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
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4 text-sunset">
              <div className="w-8 h-8 border-2 border-flame/20 border-t-flame rounded-full animate-spin" />
              <span>{t('loadingDepartments')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <ErrorMessage message={error} className="mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-platinum">{t('title')}</h1>
          <button
            onClick={() => {
              setSelectedDepartment(undefined);
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            {t('addDepartment')}
          </button>
        </div>

        {departments.length === 0 ? (
          <div className="bg-card rounded-xl shadow-md border border-card-border p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-flame/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-flame" />
              </div>
              <h3 className="text-lg font-medium text-platinum mb-2">{t('noDepartments')}</h3>
              <p className="text-sunset mb-6">{t('getStarted')}</p>
              <button
                onClick={() => {
                  setSelectedDepartment(undefined);
                  setIsModalOpen(true);
                }}
                className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
              >
                <Plus className="w-4 h-4" />
                {t('addDepartment')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <div
                key={department.id}
                className="bg-card rounded-xl shadow-md border border-card-border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-platinum mb-2 truncate">
                      {department.name}
                    </h3>
                    <p className="text-sm text-sunset line-clamp-2">
                      {department.description || t('noDescription')}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => {
                        setSelectedDepartment(department);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-sunset hover:text-flame rounded-lg hover:bg-background transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(department.id)}
                      className="p-2 text-sunset hover:text-error rounded-lg hover:bg-background transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Add the DepartmentDistribution component here */}
        <div className="mt-8">
          <DepartmentDistribution />
        </div>
      </div>

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
