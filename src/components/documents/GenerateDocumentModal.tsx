'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { FileText, AlertCircle } from 'lucide-react';
import { Employee } from '@/types/employee';
import { Template } from '@/types/template';
import jsPDF from 'jspdf';
import { formatCurrency } from '@/lib/payrollUtils';
import { checkResourceLimits } from '@/lib/subscriptions-limits';
import { useTranslations } from 'next-intl';

interface GenerateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSuccess: () => void;
}

const GenerateDocumentModal = ({ isOpen, onClose, employee, onSuccess }: GenerateDocumentModalProps) => {
  const t = useTranslations('documents.generateDocumentModal');
  const tButtons = useTranslations('documents.buttons');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : t('error.unknownError'));
    }
  };

  const generatePDF = async (content: string) => {
    const pdf = new jsPDF();
    
    pdf.setFontSize(12);
    pdf.text(content, 20, 20, { 
      maxWidth: 170,
      lineHeightFactor: 1.5
    });

    return pdf.output('blob');
  };

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const generateDocument = async () => {
    if (!selectedTemplate) return;

    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(t('error.noAuthenticatedUser'));
      await checkResourceLimits(supabase, { documents: true });

      let processedContent = selectedTemplate.content
        .replace(/{{employee_name}}/g, `${employee.first_name} ${employee.last_name}`)
        .replace(/{{position}}/g, employee.position)
        .replace(/{{department}}/g, employee.department?.name || '')
        .replace(/{{hire_date}}/g, new Date(employee.hire_date).toLocaleDateString())
        .replace(/{{email}}/g, employee.email)
        .replace(/{{company_name}}/g, 'Your Company Name') // Consider making 'Your Company Name' dynamic
        .replace(/{{current_date}}/g, new Date().toLocaleDateString())
        .replace(/{{salary}}/g, formatCurrency(employee.salary || 0))
        .replace(/{{status}}/g, employee.status);

      if (selectedTemplate.requires_signature) {
        processedContent = processedContent
          .replace(/{{employee_signature}}/g, '_________________')
          .replace(/{{manager_signature}}/g, '_________________');
      }

      const pdfBlob = await generatePDF(processedContent);

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

      const { data: publicUrlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 31536000); // URL valid for 1 year

      if (urlError || !publicUrlData?.signedUrl) throw new Error(t('error.uploadError'));

      const { data: document, error: documentError } = await supabase
        .from('documents')
        .insert({
          name: `${selectedTemplate.name} - ${employee.first_name} ${employee.last_name}`,
          category_id: selectedTemplate.category_id,
          employee_id: employee.id,
          description: `Generated from template: ${selectedTemplate.name}`,
          company_id: user.id,
          file_url: publicUrlData.signedUrl,
          file_type: 'application/pdf',
          file_size: pdfBlob.size,
          requires_signature: selectedTemplate.requires_signature,
          generated_from_template: selectedTemplate.id,
          status: selectedTemplate.requires_signature ? 'pending_signature' : 'active',
          version: 1,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (documentError) throw new Error(t('error.unknownError'));

      if (selectedTemplate.requires_signature) {
        const signatureRequests = selectedTemplate.required_signatures?.map(role => ({
          document_id: document.id,
          signer_id: user.id,
          signature_status: 'pending'
        }));

        const { error: signatureError } = await supabase
          .from('document_signatures')
          .insert(signatureRequests);

        if (signatureError) throw new Error(t('error.unknownError'));
      }

      onSuccess();
      onClose();

    } catch (err: any) {
      console.error('Error generating document:', err);
      setError(err instanceof Error ? err.message : t('error.unknownError'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl p-8 w-full max-w-2xl border border-card-border shadow-lg">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-platinum">
            {t('title', { firstName: employee.first_name, lastName: employee.last_name })}
          </h2>
          <button 
            onClick={handleClose} 
            className="text-sunset hover:text-flame text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-center gap-2 text-error mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-8">
          <div>
            <label className="block text-base font-medium text-sunset mb-2">
              {t('selectTemplate')}
            </label>
            <div className="grid grid-cols-1 gap-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all
                    ${template.id === selectedTemplate?.id
                      ? 'border-flame bg-flame/5'
                      : 'border-card-border hover:border-flame/50'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className={`w-5 h-5 ${
                      template.id === selectedTemplate?.id ? 'text-flame' : 'text-sunset'
                    }`} />
                    <div>
                      <h3 className="font-medium text-platinum">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-sunset mt-0.5">{template.description}</p>
                      )}
                      {template.requires_signature && (
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-flame/10 text-flame px-2 py-1 rounded-full">
                            {tButtons('requireSignature')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={handleClose}
              className="btn-secondary px-6 py-3 text-base rounded-lg"
            >
              {tButtons('cancel')}
            </button>
            <button
              onClick={generateDocument}
              disabled={!selectedTemplate || loading}
              className="btn-primary px-6 py-3 text-base rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading && (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {tButtons('generateDocument')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateDocumentModal;
