'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PlusCircle, FileText, Trash2, PenLine, Save, X, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Employee } from '@/types/employee';
import { useCompany } from '@/hooks/useCompany';
import { formatCurrency } from '@/lib/payrollUtils';
import { Switch } from '@/components/ui/switch';
import { Template, Category } from '@/types/template';
import { checkResourceLimits } from '@/lib/subscriptions-limits';
import { useTranslations } from 'next-intl';
import { 
  SubscriptionLimitNotification, 
  isSubscriptionLimitError 
} from '@/components/shared/SubscriptionLimitNotification';


interface DocumentTemplateProps {
  content: string;
  employee?: Employee | null;
  showSignature?: boolean;
  signatures?: {
    employee: boolean | string;
    manager: boolean | string;
  };
}


const DocumentTemplate: React.FC<DocumentTemplateProps> = ({ 
  content, 
  employee = null, 
  showSignature = false,
  signatures = {
    employee: false,
    manager: false
  }
}) => {
  interface ProcessTemplateParams {
    template: string;
    employee: Employee | null;
  }

  const processTemplate = ({ template, employee }: ProcessTemplateParams): string => {
    if (!employee) return template;

    const {companyName} = useCompany();

    return template
      .replace(/{{employee_name}}/g, `${employee.first_name} ${employee.last_name}`)
      .replace(/{{position}}/g, employee.position)
      .replace(/{{department}}/g, employee.department?.name || '')
      .replace(/{{hire_date}}/g, new Date(employee.hire_date).toLocaleDateString())
      .replace(/{{email}}/g, employee.email)
      .replace(/{{company_name}}/g, companyName || '')
      .replace(/{{current_date}}/g, new Date().toLocaleDateString())
      .replace(/{{salary}}/g, formatCurrency(employee.salary || 0))
      .replace(/{{status}}/g, employee.status);
  };

  // Escala la página a aproximadamente 2/3 del tamaño original
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative bg-white shadow-lg rounded-lg">
        {/* A4 aspect ratio container */}
        <div className="aspect-[1/1.4142] w-full">
          <div className="absolute inset-0 p-6 flex flex-col">
            {/* Main content area with scrolling if needed */}
            <div className="flex-1 overflow-y-auto prose max-w-none text-black whitespace-pre-wrap">
              {processTemplate({ template: content, employee })}
            </div>
            
            {/* Signature area - always at bottom */}
            {showSignature && (
              <div className="mt-auto pt-8 px-4">
                <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
                  {signatures.employee && (
                    <div className="flex-1 text-center w-full sm:w-auto">
                      <div className="border-b border-black pb-1 mb-2 min-w-[200px]">
                        {signatures.employee === true ? '[Pending Signature]' : signatures.employee}
                      </div>
                      <div className="text-sm">Signature</div>
                    </div>
                  )}
                  
                  {signatures.manager && (
                    <div className="flex-1 text-center w-full sm:w-auto">
                      <div className="border-b border-black pb-1 mb-2 min-w-[200px]">
                        {signatures.manager === true ? '[Pending Signature]' : signatures.manager}
                      </div>
                      <div className="text-sm">Signature</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DocumentTemplates = () => {
  const t = useTranslations('documents.templates');
  const tButtons = useTranslations('documents.buttons');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionLimitError, setSubscriptionLimitError] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewEmployee, setPreviewEmployee] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category_id: '',
    requires_signature: false,
    required_signatures: ['employee'] // default to employee signature only
  });

  const tCategoryModal = useTranslations('documents.category');

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchEmployees();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error(t('error.noAuthenticatedUser'));

      const { data, error } = await supabase
        .from('document_templates')
        .select(`
          *,
          category:category_id(id, name)
        `)
        .eq('company_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(t('error.unknownError'));
      setTemplates(data || []);
    } catch (err: any) {
      setError(err.message || t('error.unknownError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error(t('error.noAuthenticatedUser'));

      const { data: employeesData, error } = await supabase
        .from('employees')
        .select(`
          *,
          department:department_id(id, name)
        `)
        .match({ 
          company_id: user.id,
          is_active: true
        })
        .limit(10);

      if (error) throw new Error(t('error.unknownError'));
      setEmployees(employeesData || []);
    } catch (err: any) {
      setError(err.message || t('error.unknownError'));
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) throw new Error(t('error.unknownError'));
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message || t('error.unknownError'));
    }
  };


  const handleSignatureToggle = (value: boolean) => {
    setFormData(prev => ({
      ...prev,
      requires_signature: value,
      required_signatures: value ? ['employee'] : []
    }));
  };

  const handleRequiredSignaturesChange = (signature: string) => {
    setFormData(prev => ({
      ...prev,
      required_signatures: prev.required_signatures.includes(signature)
        ? prev.required_signatures.filter(s => s !== signature)
        : [...prev.required_signatures, signature]
    }));
  };

  const handleSave = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(t('error.noAuthenticatedUser'));
      await checkResourceLimits(supabase, { templates: true }, isEditing);

      const templateData = {
        name: formData.name,
        description: formData.description,
        content: formData.content,
        category_id: formData.category_id || null,
        requires_signature: formData.requires_signature,
        required_signatures: formData.required_signatures,
        updated_at: new Date(),
        company_id: user.id
      };

      if (currentTemplate) {
        const { error } = await supabase
          .from('document_templates')
          .update(templateData)
          .eq('id', currentTemplate.id);

        if (error) throw new Error(t('error.unknownError'));
      } else {
        const { error } = await supabase
          .from('document_templates')
          .insert(templateData);

        if (error) throw new Error(t('error.unknownError'));
      }

      setIsEditing(false);
      fetchTemplates();
    } catch (err: any) {
      // Handle subscription limit errors specially
      if (isSubscriptionLimitError(err)) {
        setSubscriptionLimitError(err);
        setError(null);
        return;
      }
      
      setError(err.message || t('error.unknownError'));
      setSubscriptionLimitError(null);
    }
  };

  const handleCreateNew = () => {
    setCurrentTemplate(null);
    setFormData({
      name: '',
      description: '',
      content: '',
      category_id: '',
      requires_signature: false,
      required_signatures: ['employee']
    });
    setIsEditing(true);
  };

  const handleEdit = (template: Template) => {
    setCurrentTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      content: template.content,
      category_id: template.category_id || '',
      requires_signature: template.requires_signature || false,
      required_signatures: template.required_signatures || ['employee']
    });
    setIsEditing(true);
  };

  const handleDelete = async (templateId: number) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw new Error(t('error.unknownError'));
      fetchTemplates();
    } catch (err: any) {
      setError(err.message || t('error.unknownError'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-platinum">{t('header')}</h2>
        <button
          onClick={handleCreateNew}
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <PlusCircle className="w-4 h-4" />
          {tButtons('newTemplate')}
        </button>
      </div>

      {/* Error Messages */}
      {subscriptionLimitError && (
        <SubscriptionLimitNotification 
          error={subscriptionLimitError} 
          onClose={() => setSubscriptionLimitError(null)}
        />
      )}

      {error && (
        <div className="bg-error/10 border border-error/20 text-error rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Template Editor */}
      {isEditing && (
        <Card className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-platinum">
              {currentTemplate ? t('editTemplate') : t('newTemplate')}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-sunset hover:text-vanilla"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-sunset hover:text-vanilla"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sunset mb-1">
                  {t('templateName')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-base w-full"
                  placeholder={t('enterTemplateName')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sunset mb-1">
                  {t('category')}
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="select-custom w-full"
                >
                  <option value="">{t('selectCategory')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sunset mb-1">
                  {t('description')}
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-base w-full"
                  placeholder={t('enterDescription')}
                />
              </div>

              {/* Signature Requirements */}
              <div className="space-y-4 border-t border-card-border pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-sunset">
                      {t('requireSignature')}
                    </label>
                    <p className="text-xs text-sunset/80 mt-0.5">
                      {t('enableSignature')}
                    </p>
                  </div>
                  <Switch
                    checked={formData.requires_signature}
                    onCheckedChange={handleSignatureToggle}
                  />
                </div>

                {formData.requires_signature && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-sunset">
                      {t('requiredSignatures')}
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.required_signatures.includes('employee')}
                          onChange={() => handleRequiredSignaturesChange('employee')}
                          className="rounded border-card-border text-primary focus:ring-flame"
                        />
                        <span className="text-sm text-sunset">{t('employeeSignature')}</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.required_signatures.includes('manager')}
                          onChange={() => handleRequiredSignaturesChange('manager')}
                          className="rounded border-card-border text-primary focus:ring-flame"
                        />
                        <span className="text-sm text-sunset">{t('managerSignature')}</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-sunset mb-1">
                  {t('templateContent')}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="input-base w-full h-96 font-mono"
                  placeholder={t('enterTemplateContent')}
                />
                <div className="text-sm text-sunset mt-1 space-y-1">
                  <p>{t('availableVariables')}</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>
                      {t('employeeInfo')}: "{'{{employee_name}}'}", "{'{{position}}'}", "{'{{department}}'}", "{'{{hire_date}}'}", "{'{{email}}'}", "{'{{status}}'}", "{'{{salary}}'}"
                    </li>
                    <li>
                      {t('documentInfo')}: "{'{{company_name}}'}", "{'{{current_date}}'}"
                    </li>
                    {formData.requires_signature && (
                      <li>
                        {t('signatures')}: "{'{{signature}}'}"
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sunset mb-1">
                    {t('previewWithEmployee')}
                  </label>
                  <select
                    value={previewEmployee?.id || ''}
                    onChange={(e) => setPreviewEmployee(employees.find(emp => emp.id === e.target.value) || null)}
                    className="select-custom w-full mb-4"
                  >
                    <option value="">{t('previewWithoutEmployee')}</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border rounded-lg p-4 bg-background">
                  <h4 className="text-sm font-medium text-sunset mb-2">{t('previewSection')}</h4>
                  <DocumentTemplate 
                    content={formData.content} 
                    employee={previewEmployee}
                    showSignature={formData.requires_signature}
                    signatures={{
                      employee: formData.required_signatures.includes('employee'),
                      manager: formData.required_signatures.includes('manager')
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg"
            >
              <Save className="w-4 h-4" />
              {tButtons('saveTemplate')}
            </button>
          </div>
        </Card>
      )}

      {/* Templates List */}
      {!isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-12 text-sunset">
              {t('loadingTemplates')}
            </div>
          ) : templates.length === 0 ? (
            <div className="col-span-full text-center py-12 text-sunset">
              {t('noTemplates')}
            </div>
          ) : (
            templates.map((template) => (
              <Card
                key={template.id}
                className="p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-platinum">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-sunset mt-1">
                          {template.description}
                        </p>
                      )}
                      {template.category && (
                        <span className="inline-block mt-2 text-xs bg-background px-2 py-1 rounded-full text-sunset">
                          {template.category.name}
                        </span>
                      )}
                      {template.requires_signature && (
                        <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {tButtons('requireSignature')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="text-sunset hover:text-vanilla"
                    >
                      <PenLine className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-error hover:text-error/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentTemplates;
