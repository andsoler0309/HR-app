'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import GenerateDocumentModal from '@/components/documents/GenerateDocumentModal';
import DeleteTemplateModal from '@/components/documents/DeleteTemplateModal';


interface DocumentTemplateProps {
  content: string;
  employee?: Employee | null;
  showSignature?: boolean;
  companyName?: string;
  signatures?: {
    employee: boolean | string;
    manager: boolean | string;
  };
}


const DocumentTemplate: React.FC<DocumentTemplateProps> = ({ 
  content, 
  employee = null, 
  showSignature = false,
  companyName = '',
  signatures = {
    employee: false,
    manager: false
  }
}) => {
  interface ProcessTemplateParams {
    template: string;
    employee: Employee | null;
    companyName: string;
  }

  const processTemplate = ({ template, employee, companyName }: ProcessTemplateParams): string => {
    if (!employee) return template;

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

  // Preview en tamaño carta real con mejor diseño
  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-100 p-4 rounded-lg shadow-inner">
      {/* Hoja tamaño carta (8.5" x 11" = ratio 1:1.294) */}
      <div className="bg-white shadow-2xl mx-auto document-preview" style={{ 
        width: '100%', 
        maxWidth: '650px',
        aspectRatio: '8.5 / 11',
        minHeight: '842px' // A4 height approximation
      }}>
        <div className="h-full p-12 flex flex-col text-gray-900 text-sm leading-relaxed">
          {/* Header area */}
          <div className="flex-1 space-y-4">
            <div 
              className="whitespace-pre-wrap font-serif"
              style={{ 
                lineHeight: '1.6',
                fontSize: '14px'
              }}
            >
              {processTemplate({ template: content, employee, companyName })}
            </div>
          </div>
          
          {/* Signature area - siempre al final de la página */}
          {showSignature && (
            <div className="mt-auto pt-16">
              <div className="flex justify-between items-end">
                {signatures.employee && (
                  <div className="flex-1 text-center mx-4">
                    <div className="border-b-2 border-gray-800 pb-2 mb-3 min-w-[180px] h-12 flex items-end justify-center">
                      {signatures.employee === true ? (
                        <span className="text-gray-400 text-xs italic">Firma pendiente</span>
                      ) : (
                        <span className="font-cursive text-lg">{signatures.employee}</span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Firma del Empleado
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Fecha: _________________
                    </div>
                  </div>
                )}
                
                {signatures.manager && (
                  <div className="flex-1 text-center mx-4">
                    <div className="border-b-2 border-gray-800 pb-2 mb-3 min-w-[180px] h-12 flex items-end justify-center">
                      {signatures.manager === true ? (
                        <span className="text-gray-400 text-xs italic">Firma pendiente</span>
                      ) : (
                        <span className="font-cursive text-lg">{signatures.manager}</span>
                      )}
                    </div>
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Firma del Supervisor
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Fecha: _________________
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DocumentTemplates = () => {
  const router = useRouter();
  const t = useTranslations('documents.templates');
  const tButtons = useTranslations('documents.buttons');
  const tCategoryModal = useTranslations('documents.category');
  const { companyName } = useCompany();

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
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedTemplateForGenerate, setSelectedTemplateForGenerate] = useState<Template | null>(null);
  const [selectedEmployeeForGenerate, setSelectedEmployeeForGenerate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category_id: '',
    requires_signature: false,
    required_signatures: ['employee'] // default to employee signature only
  });

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

  const handleGenerateDocument = (template: Template) => {
    setSelectedTemplateForGenerate(template);
    setIsGenerateModalOpen(true);
  };

  const handleGenerateFromModal = async () => {
    if (!selectedTemplateForGenerate) return;

    try {
      setIsGenerating(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(t('error.noAuthenticatedUser'));

      const selectedEmployee = selectedEmployeeForGenerate ? employees.find(emp => emp.id === selectedEmployeeForGenerate) || null : null;

      // Procesar contenido de la plantilla
      const processedContent = processTemplate({ 
        template: selectedTemplateForGenerate.content, 
        employee: selectedEmployee,
        companyName: companyName || ''
      });

      // Generar PDF del contenido procesado
      const generatePDF = async (content: string) => {
        const jsPDF = (await import('jspdf')).default;
        const pdf = new jsPDF();
        
        pdf.setFontSize(12);
        pdf.text(content, 20, 20, { 
          maxWidth: 170,
          lineHeightFactor: 1.5
        });

        return pdf.output('blob');
      };

      const pdfBlob = await generatePDF(processedContent);

      // Subir PDF al storage
      const fileName = `${crypto.randomUUID()}.pdf`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error(t('error.uploadError'));

      // Crear URL firmada para el archivo
      const { data: publicUrlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 31536000); // URL válida por 1 año

      if (urlError || !publicUrlData?.signedUrl) throw new Error(t('error.uploadError'));

      // Crear documento en la base de datos
      const documentData = {
        name: `${selectedTemplateForGenerate.name}${selectedEmployee ? ` - ${selectedEmployee.first_name} ${selectedEmployee.last_name}` : ' - General'}`,
        category_id: selectedTemplateForGenerate.category_id,
        employee_id: selectedEmployee?.id || null,
        description: `Generated from template: ${selectedTemplateForGenerate.name}`,
        company_id: user.id,
        file_url: publicUrlData.signedUrl,
        file_type: 'application/pdf',
        file_size: pdfBlob.size,
        requires_signature: selectedTemplateForGenerate.requires_signature,
        generated_from_template: selectedTemplateForGenerate.id,
        status: selectedTemplateForGenerate.requires_signature ? 'pending_signature' : 'active',
        signature_status: selectedTemplateForGenerate.requires_signature ? 'pending' : null,
        signed_by: [],
        version: 1
      };

      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();

      if (docError) throw docError;

      console.log('Document created successfully:', document);

      // Cerrar modal de generación y mostrar modal de éxito
      setIsGenerateModalOpen(false);
      setSelectedTemplateForGenerate(null);
      setSelectedEmployeeForGenerate('');
      setShowSuccessModal(true);
      
    } catch (err: any) {
      console.error('Error generating document:', err);
      setError(err.message || t('error.unknownError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const processTemplate = ({ template, employee, companyName }: { template: string; employee: Employee | null; companyName: string }): string => {
    if (!employee) return template;

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

  const handleDelete = (template: Template) => {
    setTemplateToDelete(template);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', templateToDelete.id);

      if (error) throw new Error(t('error.unknownError'));
      
      fetchTemplates();
      setIsDeleteModalOpen(false);
      setTemplateToDelete(null);
    } catch (err: any) {
      setError(err.message || t('error.unknownError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setTemplateToDelete(null);
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
              <div>
                <label className="block text-sm font-medium text-sunset mb-1">
                  📝 {t('requireSignature')}
                </label>
                <div className="flex items-center justify-between p-3 border border-card-border rounded-lg bg-card/30">
                  <div>
                    <p className="text-sm text-sunset">
                      {t('enableSignature')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium ${
                      formData.requires_signature ? 'text-primary' : 'text-sunset/60'
                    }`}>
                      {formData.requires_signature ? t('enabled') || 'Habilitado' : t('disabled') || 'Deshabilitado'}
                    </span>
                    <Switch
                      checked={formData.requires_signature}
                      onCheckedChange={handleSignatureToggle}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300"
                    />
                  </div>
                </div>

                {formData.requires_signature && (
                  <div className="space-y-2 mt-4">
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
                    {/* {formData.requires_signature && (
                      <li>
                        {t('signatures')}: "{'{{signature}}'}"
                      </li>
                    )} */}
                  </ul>
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-sunset">
                    {t('previewWithEmployee')}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-sunset hover:text-vanilla text-sm"
                    >
                      Ocultar Preview
                    </button>
                  </div>
                </div>
                
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

                <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Vista Previa del Documento
                    </h4>
                    <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      Tamaño Carta (8.5" x 11")
                    </div>
                  </div>
                  
                  <div className="max-h-[600px] overflow-y-auto">
                    <div style={{ transform: `scale(${previewZoom})`, transformOrigin: 'top center', transition: 'transform 0.3s ease' }}>
                      <DocumentTemplate 
                        content={formData.content} 
                        employee={previewEmployee}
                        companyName={companyName || ''}
                        showSignature={formData.requires_signature}
                        signatures={{
                          employee: formData.required_signatures.includes('employee'),
                          manager: formData.required_signatures.includes('manager')
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Preview controls */}
                  <div className="mt-4 flex justify-center gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setPreviewZoom(Math.min(previewZoom + 0.1, 1.5))}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      disabled={previewZoom >= 1.5}
                    >
                      🔍+ Acercar
                    </button>
                    <button
                      onClick={() => setPreviewZoom(Math.max(previewZoom - 0.1, 0.5))}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                      disabled={previewZoom <= 0.5}
                    >
                      🔍- Alejar
                    </button>
                    <button
                      onClick={() => setPreviewZoom(1)}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      � Tamaño Real
                    </button>
                    <button
                      onClick={() => {
                        // Abrir preview en nueva ventana para imprimir
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html>
                              <head>
                                <title>Vista Previa - ${formData.name}</title>
                                <style>
                                  @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&display=swap');
                                  body { margin: 0; padding: 20px; font-family: 'Playfair Display', serif; }
                                  .document { width: 8.5in; min-height: 11in; margin: 0 auto; padding: 1in; background: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                                  .signature-area { margin-top: 2in; display: flex; justify-content: space-between; }
                                  .signature { text-align: center; min-width: 2.5in; }
                                  .signature-line { border-bottom: 2px solid black; height: 50px; margin-bottom: 10px; }
                                  .font-cursive { font-family: 'Dancing Script', cursive; }
                                </style>
                              </head>
                              <body>
                                <div class="document">
                                  <div style="white-space: pre-wrap; line-height: 1.6;">${processTemplate({ template: formData.content, employee: previewEmployee, companyName: companyName || '' })}</div>
                                  ${formData.requires_signature ? `
                                    <div class="signature-area">
                                      ${formData.required_signatures.includes('employee') ? `
                                        <div class="signature">
                                          <div class="signature-line"></div>
                                          <div>Firma del Empleado</div>
                                          <div>Fecha: _______________</div>
                                        </div>
                                      ` : ''}
                                      ${formData.required_signatures.includes('manager') ? `
                                        <div class="signature">
                                          <div class="signature-line"></div>
                                          <div>Firma del Supervisor</div>
                                          <div>Fecha: _______________</div>
                                        </div>
                                      ` : ''}
                                    </div>
                                  ` : ''}
                                </div>
                              </body>
                            </html>
                          `);
                          printWindow.document.close();
                        }
                      }}
                      className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      🖨️ Vista Previa de Impresión
                    </button>
                  </div>
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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-platinum truncate">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-sunset mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {template.category && (
                          <span className="inline-block text-xs bg-background px-2 py-1 rounded-full text-sunset">
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
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <button
                      onClick={() => handleGenerateDocument(template)}
                      className="p-1.5 sm:p-2 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition-colors"
                      title="Generar Documento"
                    >
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-1.5 sm:p-2 text-sunset hover:text-vanilla hover:bg-background rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template)}
                      className="p-1.5 sm:p-2 text-error hover:text-error/80 hover:bg-error/10 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Employee Selection and Confirmation Modal */}
      {isGenerateModalOpen && selectedTemplateForGenerate && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md border border-card-border shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-platinum">
                {t('generateDocument')}
              </h3>
              <button
                onClick={() => {
                  setIsGenerateModalOpen(false);
                  setSelectedTemplateForGenerate(null);
                  setSelectedEmployeeForGenerate('');
                  setError(null);
                }}
                className="text-sunset hover:text-primary"
                disabled={isGenerating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-center gap-2 text-error mb-4">
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <p className="text-sm text-sunset">
                {t('template')}: <strong>{selectedTemplateForGenerate.name}</strong>
              </p>
              
              <div>
                <label className="block text-sm font-medium text-sunset mb-2">
                  {t('selectEmployee')} ({t('optional')})
                </label>
                <select
                  value={selectedEmployeeForGenerate}
                  onChange={(e) => setSelectedEmployeeForGenerate(e.target.value)}
                  className="select-custom w-full"
                  disabled={isGenerating}
                >
                  <option value="">{t('generalDocument')}</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name} - {employee.position}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setIsGenerateModalOpen(false);
                    setSelectedTemplateForGenerate(null);
                    setSelectedEmployeeForGenerate('');
                    setError(null);
                  }}
                  className="btn-secondary px-4 py-2 rounded-lg"
                  disabled={isGenerating}
                >
                  {tButtons('cancel')}
                </button>
                <button
                  onClick={handleGenerateFromModal}
                  className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                  disabled={isGenerating}
                >
                  {isGenerating && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  {isGenerating ? t('generating') || 'Generando...' : tButtons('generateDocument')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl p-6 w-full max-w-md border border-card-border shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-platinum mb-2">
                {t('documentGenerated') || '¡Documento Generado!'}
              </h3>
              <p className="text-sm text-sunset mb-6">
                {t('documentGeneratedDescription') || 'El documento se ha generado exitosamente. Puedes encontrarlo en la sección de documentos.'}
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="btn-secondary px-4 py-2 rounded-lg"
                >
                  {tButtons('close') || 'Cerrar'}
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    router.push('/dashboard/documents');
                    // Hacer reload después de un pequeño delay para asegurar la navegación
                    setTimeout(() => {
                      window.location.reload();
                    }, 100);
                  }}
                  className="btn-primary px-4 py-2 rounded-lg"
                >
                  {t('viewDocuments') || 'Ver Documentos'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Template Modal */}
      <DeleteTemplateModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        template={templateToDelete}
        loading={isDeleting}
      />
    </div>
  );
};

export default DocumentTemplates;
