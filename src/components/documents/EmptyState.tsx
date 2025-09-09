'use client'
import { FileText, FolderPlus, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface EmptyStateProps {
  type: 'noDocuments' | 'noCategories';
  onAction: () => void;
}

export default function EmptyState({ type, onAction }: EmptyStateProps) {
  const t = useTranslations('documents.emptyState');

  const config = {
    noDocuments: {
      icon: FileText,
      title: t('noDocuments.title'),
      subtitle: t('noDocuments.subtitle'),
      action: t('noDocuments.action'),
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    noCategories: {
      icon: FolderPlus,
      title: t('noCategories.title'),
      subtitle: t('noCategories.subtitle'),
      action: t('noCategories.action'),
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  };

  const { icon: Icon, title, subtitle, action, iconColor, bgColor } = config[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className={`${bgColor} rounded-full p-6 mb-6`}>
        <Icon className={`w-12 h-12 ${iconColor}`} />
      </div>
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-text-secondary text-center max-w-md mb-8">
        {subtitle}
      </p>
      
      <button
        onClick={onAction}
        className="btn-primary flex items-center gap-2 px-6 py-3 rounded-lg"
      >
        {type === 'noDocuments' ? (
          <Upload className="w-5 h-5" />
        ) : (
          <FolderPlus className="w-5 h-5" />
        )}
        {action}
      </button>
    </div>
  );
}
