'use client'
import { useEffect, useState } from 'react'
import { Document } from '@/types/document'
import { Download, Share2, Clock, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTranslations } from 'next-intl'

interface Props {
  document: Document
  onClose: () => void
}

export default function DocumentViewer({ document, onClose }: Props) {
  const t = useTranslations('documents.viewer')
  const tButtons = useTranslations('documents.buttons') // Assuming you have a buttons namespace for common button labels

  const [showVersions, setShowVersions] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false)
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [needsSignature, setNeedsSignature] = useState(false);

  useEffect(() => {
    checkSignatureStatus();
  }, [document]);

  const checkSignatureStatus = async () => {
    if (document.status !== 'pending_signature') return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: signature } = await supabase
      .from('document_signatures')
      .select('*')
      .eq('document_id', document.id)
      .eq('signer_id', user.id)
      .eq('signature_status', 'pending')
      .single();

    setNeedsSignature(!!signature);
  };


  const getFileType = (fileType: string) => {
    if (fileType.includes('pdf')) return 'PDF'
    if (fileType.includes('word')) return 'Word'
    if (fileType.includes('sheet')) return 'Excel'
    return 'Document'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-card-border bg-card p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-background rounded-full text-sunset hover:text-flame"
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
            <button
              onClick={() => window.open(document.file_url, '_blank')}
              className="btn-secondary flex items-center px-4 py-2 rounded-md"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('download')}
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="btn-secondary flex items-center px-4 py-2 rounded-md"
            >
              <Share2 className="w-4 h-4 mr-2" />
              {t('share')}
            </button>
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="btn-secondary flex items-center px-4 py-2 rounded-md"
            >
              <Clock className="w-4 h-4 mr-2" />
              {t('versionHistory')}
            </button>
          </div>
        </div>
      </div>
   
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Document preview */}
          <div className={`flex-1 bg-background ${showVersions ? 'mr-64' : ''}`}>
            <iframe
              src={document.file_url}
              className="w-full h-full"
              title={document.name}
            />
          </div>
   
          {/* Version history sidebar */}
          {showVersions && (
            <div className="w-64 border-l border-card-border bg-card overflow-y-auto">
              <div className="p-4">
                <h2 className="font-semibold text-platinum mb-4">{t('versionHistory')}</h2>
                <div className="space-y-4">
                  <div className="border border-card-border rounded-md p-3 bg-background">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-platinum">{t('currentVersion')}</span>
                      <span className="text-xs text-sunset">{t('versionNumber', { version: document.version })}</span>
                    </div>
                    <p className="text-xs text-sunset mt-1">
                      {t('versionDate', { date: formatDate(document.updated_at || document.created_at) })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
   );
}
