'use client'
import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { DocumentCategory } from '@/types/document';
import { useTranslations } from 'next-intl';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DocumentCategoryModal({ isOpen, onClose, onSuccess }: Props) {
  const t = useTranslations('documents.category');
  const tButtons = useTranslations('documents.buttons');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      setLoading(true);
      
      // First, get the current user's profile
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(t('error.noAuthenticatedUser'));

      // Get the user's profile to get their company information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError) throw new Error(t('error.noProfileFound'));
      if (!profile) throw new Error(t('error.noProfileFound'));

      // Create the category with the company_id
      const { error: insertError } = await supabase
        .from('document_categories')
        .insert([
          {
            name,
            description: description || null,
            company_id: profile.id // This is crucial for RLS
          }
        ]);

      if (insertError) throw new Error(t('error.createError'));

      setName('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err.message || t('error.createError'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-4 sm:p-6 w-full max-w-md border border-card-border shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-platinum">{t('createTitle')}</h2>
          <button onClick={onClose} className="text-sunset hover:text-primary">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-error bg-error/10 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-sunset">
              {t('categoryName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-base mt-1"
              placeholder={t('enterCategoryName')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sunset">
              {t('description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-base mt-1"
              placeholder={t('enterCategoryDescription')}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 rounded-md w-full sm:w-auto"
            >
              {tButtons('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="btn-primary px-4 py-2 rounded-md disabled:opacity-50 w-full sm:w-auto"
            >
              {loading ? tButtons('creating') : tButtons('createCategory')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
