import { Document } from '@/types/document'
import { DownloadCloud, Share2, Trash2, FileText, PenLine } from 'lucide-react'
import { useTranslations } from 'next-intl';

interface DocumentListProps {
    documents: Document[];
    onDocumentClick: (document: Document) => void;
    onDownload: (document: Document) => void;
    onShare: (document: Document) => void;
    onDelete: (document: Document) => void;
    onSignRequest: (document: Document) => void;
}

export default function DocumentList({ 
  documents, 
  onDocumentClick,
  onDownload,
  onShare,
  onDelete,
  onSignRequest
}: DocumentListProps) {
  const t = useTranslations('documents.buttons');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }


  const renderActions = (document: Document) => {
    if (document.status === 'pending_signature') {
      return (
        <button
          onClick={() => onSignRequest(document)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-flame text-white rounded-lg"
        >
          <PenLine className="w-4 h-4" />
          {t('signDocument')}
        </button>
      );
    }

    return null;
  };





  return (
    <div className="bg-card rounded-lg border border-card-border shadow-md divide-y divide-card-border">
      {documents.map((document) => (
        <div
          key={document.id}
          className="flex items-center gap-4 p-4 hover:bg-background/50 transition-colors group"
        >
          <div className="shrink-0 w-10 h-10 bg-flame/10 rounded-lg flex items-center justify-center text-flame">
            <FileText className="w-5 h-5" />
          </div>
  
          <div 
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => onDocumentClick(document)}
          >
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-medium text-platinum truncate">
                {document.name}
              </h3>
              {document.category?.name && (
                <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-flame/10 text-flame">
                  {document.category.name}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-sunset">
                {formatFileSize(document.file_size)}
              </span>
              {document.employee && (
                <>
                  <span className="text-sunset/30">•</span>
                  <span className="text-sm text-sunset">
                    {document.employee.first_name} {document.employee.last_name}
                  </span>
                </>
              )}
              <span className="text-sunset/30">•</span>
              <span className="text-sm text-sunset">
                {new Date(document.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
  
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {renderActions(document)}
            <button
              onClick={() => onDownload(document)}
              className="p-2 text-sunset hover:text-flame hover:bg-background rounded-lg transition-colors"
              title="Download"
            >
              <DownloadCloud className="w-4 h-4" />
            </button>
            <button
              onClick={() => onShare(document)}
              className="p-2 text-sunset hover:text-flame hover:bg-background rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(document)}
              className="p-2 text-sunset hover:text-error hover:bg-error/10 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}