'use client'
import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DocumentCategory } from '@/types/document';
import { Employee } from '@/types/employee';
import { checkResourceLimits } from '@/lib/subscriptions-limits';
import { useTranslations } from 'next-intl';
import { 
  SubscriptionLimitNotification, 
  isSubscriptionLimitError 
} from '@/components/shared/SubscriptionLimitNotification';

interface FormValues {
  name: string;
  category_id: string;
  employee_id: string;
  description?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: DocumentCategory[];
  employees: Employee[];
  onSuccess: () => void;
}

export default function DocumentUploadModal({ isOpen, onClose, categories, employees, onSuccess }: Props) {
  const t = useTranslations('documents.uploadModal');
  const tButtons = useTranslations('documents.buttons');

  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormValues>({
    name: '',
    category_id: '',
    employee_id: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionLimitError, setSubscriptionLimitError] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      if (!formData.name) {
        setFormData(prev => ({
          ...prev,
          name: droppedFile.name.split('.')[0]
        }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!formData.name) {
        setFormData(prev => ({
          ...prev,
          name: selectedFile.name.split('.')[0]
        }));
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.name || !formData.category_id) return;

    try {
      setUploading(true);
      setError(null);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(t('error.noAuthenticatedUser'));
      await checkResourceLimits(supabase, { documents: true });

      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; // Add user ID to path for better organization

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw new Error(t('error.uploadError'));

      // Get the URL for the uploaded file
      const { data: publicUrlData, error: urlError } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 31536000); // URL valid for 1 year

      if (urlError || !publicUrlData?.signedUrl) throw new Error(t('error.uploadError'));

      // Create document record in database
      const { error: dbError } = await supabase
        .from('documents')
        .insert([{
          name: formData.name,
          category_id: formData.category_id,
          employee_id: formData.employee_id,
          description: formData.description,
          company_id: user.id,
          file_url: publicUrlData.signedUrl,
          file_type: file.type,
          file_size: file.size,
          status: 'active',
          version: 1
        }]);

      if (dbError) throw new Error(t('error.uploadError'));

      // Reset form
      setFile(null);
      setFormData({
        name: '',
        category_id: '',
        description: '',
        employee_id: '',
      });
      onSuccess();
      handleClose();
    } catch (err: any) {
      // Handle subscription limit errors specially
      if (isSubscriptionLimitError(err)) {
        setSubscriptionLimitError(err);
        setError(null);
        setUploading(false);
        return;
      }
      
      console.error('Error uploading document:', err);
      setError(err.message || t('error.uploadError'));
      setSubscriptionLimitError(null);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSubscriptionLimitError(null);
    setFile(null);
    setFormData({
      name: '',
      category_id: '',
      employee_id: '',
      description: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md border border-card-border shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-platinum">{t('title')}</h2>
          <button onClick={handleClose} className="text-sunset hover:text-primary">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {subscriptionLimitError && (
            <SubscriptionLimitNotification 
              error={subscriptionLimitError} 
              onClose={() => setSubscriptionLimitError(null)}
            />
          )}

          {error && (
            <div className="p-3 text-sm text-error bg-error/10 rounded-md">
              {error}
            </div>
          )}

          <div
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
              dragActive ? 'border-primary bg-primary/10' : 'border-card-border'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-sunset" />
              <div className="flex text-sm text-sunset">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-vanilla">
                  <span>{t('uploadAFile')}</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">{t('orDragAndDrop')}</p>
              </div>
              <p className="text-xs text-sunset/70">
                {t('fileTypes')}
              </p>
              {file && (
                <p className="text-sm text-sunset">
                  {t('selected', { fileName: file.name })}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-sunset">
              {t('documentName')}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-base mt-1"
              placeholder={t('enterDocumentName')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sunset">
              {t('category')}
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="input-base mt-1"
              required
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
            <label className="block text-sm font-medium text-sunset">
              {t('employee')}
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              className="input-base mt-1"
              required
            >
              <option value="">{t('selectEmployee')}</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-sunset">
              {t('description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="input-base mt-1"
              placeholder={t('enterDescription')}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary px-4 py-2 rounded-md"
            >
              {tButtons('cancel')}
            </button>
            <button
              type="submit"
              disabled={uploading || !file || !formData.name || !formData.category_id}
              className="btn-primary px-4 py-2 rounded-md disabled:opacity-50"
            >
              {uploading ? tButtons('uploading') : tButtons('upload')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
