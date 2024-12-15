import { Document } from '@/types/document'
import { FileText, DownloadCloud, Share2, Trash2, File, PenLine } from 'lucide-react'
import { useTranslations } from 'next-intl';

interface DocumentGridProps {
    documents: Document[];
    onDocumentClick: (document: Document) => void;
    onDownload: (document: Document) => void;
    onShare: (document: Document) => void;
    onDelete: (document: Document) => void;
    onSignRequest: (document: Document) => void;
}

export default function DocumentGrid({ 
  documents, 
  onDocumentClick,
  onDownload,
  onShare,
  onDelete,
  onSignRequest
}: DocumentGridProps) {
  const t = useTranslations('documents.buttons');

  const getFileIcon = (fileType: string) => {
    // Add more file type icons as needed
    return <File className="w-8 h-8" />
  }

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
  }



  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {documents.map((document) => (
        <div 
          key={document.id} 
          className="group bg-card rounded-lg border border-card-border hover:shadow-lg transition-all duration-200"
        >
          <div 
            className="p-6 cursor-pointer"
            onClick={() => onDocumentClick(document)}
          >
            <div className="flex flex-col items-center">
              {/* File Type Icon */}
              <div className="w-16 h-16 bg-flame/10 rounded-xl flex items-center justify-center text-flame mb-4">
                {getFileIcon(document.file_type)}
              </div>
  
              {/* Document Info */}
              <div className="w-full text-center space-y-1">
                <h3 className="font-medium text-platinum text-sm truncate px-2" title={document.name}>
                  {document.name}
                </h3>
                {document.category?.name && (
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-flame/10 text-flame">
                    {document.category.name}
                  </span>
                )}
                <div className="text-sm text-sunset">
                  {document.employee ? `${document.employee.first_name} ${document.employee.last_name}` : 'No Employee'}
                </div>
                <div className="text-xs text-sunset">
                  {formatFileSize(document.file_size)}
                </div>
                <div className="text-xs text-sunset/70">
                  {new Date(document.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
  
          {/* Actions */}
          <div className="flex justify-center gap-1 p-3 border-t border-card-border">
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