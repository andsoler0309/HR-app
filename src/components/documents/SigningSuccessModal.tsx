'use client'
import React from 'react';
import { CheckCircle, FileText, ArrowRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface SigningSuccessModalProps {
  isOpen: boolean;
  documentName: string;
  onClose: () => void;
  onRedirectToDocuments: () => void;
}

export default function SigningSuccessModal({ 
  isOpen, 
  documentName, 
  onClose, 
  onRedirectToDocuments 
}: SigningSuccessModalProps) {
  const t = useTranslations('documents.signing');
  const router = useRouter();

  if (!isOpen) return null;

  const handleRedirect = () => {
    onRedirectToDocuments();
    onClose();
    // Reload the page to show the updated document
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-card rounded-xl shadow-2xl max-w-md w-full mx-4 border border-card-border">
        {/* Header */}
        <div className="p-6 text-center border-b border-card-border">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-platinum mb-2">
            🎉 {t('success')}
          </h2>
          <p className="text-sunset text-sm">
            {t('successSubtitle')}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-green-800 mb-1">
                  {t('documentProcessed')}
                </h3>
                <p className="text-green-700 text-sm break-words">
                  {documentName}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-sunset">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t('signaturesApplied')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t('pdfUpdated')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{t('statusUpdated')}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-card-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sunset hover:text-platinum border border-card-border rounded-lg hover:bg-background transition-colors"
          >
            {t('close')}
          </button>
          <button
            onClick={handleRedirect}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <span>{t('viewDocuments')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
