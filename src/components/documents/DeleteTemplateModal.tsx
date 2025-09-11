'use client'
import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Template } from '@/types/template';

interface DeleteTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  template: Template | null;
  loading?: boolean;
}

export default function DeleteTemplateModal({
  isOpen,
  onClose,
  onConfirm,
  template,
  loading = false
}: DeleteTemplateModalProps) {
  const t = useTranslations('documents.deleteTemplateModal');
  const tButtons = useTranslations('documents.buttons');

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg p-6 w-full max-w-md border border-card-border shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-error" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-platinum">
              {t('title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-sunset hover:text-primary transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sunset mb-3">
            {t('message')}
          </p>
          
          <div className="bg-background/50 rounded-lg p-3 border border-card-border">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-error flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-platinum text-sm truncate">
                  {template.name}
                </p>
                <p className="text-xs text-sunset">
                  {template.category?.name || 'Sin categoría'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-sm text-sunset bg-error/5 border border-error/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
              <p>{t('warning')}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary px-4 py-2 rounded-lg w-full sm:w-auto disabled:opacity-50"
          >
            {tButtons('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger px-4 py-2 rounded-lg w-full sm:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('deleting')}
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                {t('confirmDelete')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
