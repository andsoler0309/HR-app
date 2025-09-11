'use client'
import React, { useState, useEffect } from 'react';
import { PenLine, Download, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Document } from '@/types/document';
import { supabase } from '@/lib/supabase';

interface Props {
  document: Document;
  onClose: () => void;
  signatureMode?: boolean; // Nueva prop para abrir en modo de firma
}

export default function DocumentViewer({ document, onClose, signatureMode = false }: Props) {
  const t = useTranslations('documents.viewer');
  
  const [needsSignature, setNeedsSignature] = useState(false);
  const [isSignatureMode, setIsSignatureMode] = useState(signatureMode); // Inicializar con la prop
  const [mounted, setMounted] = useState(false);
  const [PDFSignatureViewer, setPDFSignatureViewer] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    setMounted(true);
    checkSignatureStatus();
    
    // Si se pasa signatureMode como true, forzar el modo de firma
    if (signatureMode) {
      setIsSignatureMode(true);
    }
    
    // Load the PDF signature viewer dynamically only on client side
    if (typeof window !== 'undefined') {
      import('./PDFSignatureViewer').then((mod) => {
        setPDFSignatureViewer(() => mod.default);
      }).catch((error) => {
        console.error('Error loading PDFSignatureViewer:', error);
      });
    }
  }, [document, signatureMode]);

  const checkSignatureStatus = async () => {
    if (!document.requires_signature) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user has already signed using the signed_by array
    const signedBy = document.signed_by || [];
    const hasUserSigned = signedBy.includes(user.id);
    
    setNeedsSignature(document.requires_signature && !hasUserSigned);
  };

  const getFileType = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word')) return 'Word';
    if (fileType.includes('sheet')) return 'Excel';
    return 'Document';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return null;
  }

  // Show signature viewer if in signature mode
  if (isSignatureMode) {
    if (!PDFSignatureViewer) {
      return (
        <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
          <div className="text-sunset">Loading signature viewer...</div>
        </div>
      );
    }
    
    return (
      <PDFSignatureViewer 
        document={document} 
        onClose={() => setIsSignatureMode(false)} 
      />
    );
  }

  // Regular document viewer
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-card-border bg-card p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-background rounded-full text-sunset hover:text-primary"
              aria-label={t('back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-platinum">{document.name}</h1>
              <p className="text-sm text-sunset">
                {getFileType(document.file_type)} &bull; {t('lastModified', { date: formatDate(document.updated_at || document.created_at) })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {needsSignature && (
              <button
                onClick={() => setIsSignatureMode(true)}
                className="btn-primary flex items-center px-4 py-2 rounded-md"
              >
                <PenLine className="w-4 h-4 mr-2" />
                {t('signDocument')}
              </button>
            )}
            <button
              onClick={() => window.open(document.file_url, '_blank')}
              className="btn-secondary flex items-center px-4 py-2 rounded-md"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('download')}
            </button>
          </div>
        </div>
      </div>
   
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {isSignatureMode && PDFSignatureViewer ? (
          <PDFSignatureViewer 
            document={document} 
            onClose={() => setIsSignatureMode(false)} 
          />
        ) : (
          <div className="h-full flex">
            {/* Document preview */}
            <div className="flex-1 bg-background">
              <iframe
                src={document.file_url}
                className="w-full h-full"
                title={document.name}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
