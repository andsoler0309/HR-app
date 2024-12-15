import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  locale: string;
  onSwitchToEnglish: () => void;
  onSwitchToSpanish: () => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  locale,
  onSwitchToEnglish,
  onSwitchToSpanish
}) => {
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <div className="flex rounded-md shadow-sm border border-card-border overflow-hidden">
        <button
          onClick={onSwitchToEnglish}
          type="button"
          aria-pressed={locale === 'en'}
          className={`px-3 py-1.5 text-sm font-medium transition-colors relative
            ${locale === 'en' 
              ? 'bg-primary text-black' 
              : 'hover:bg-muted/50'
            }`}
        >
          EN
          {locale === 'en' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/80" />
          )}
        </button>
        <div className="w-px bg-card-border" />
        <button
          onClick={onSwitchToSpanish}
          type="button"
          aria-pressed={locale === 'es'}
          className={`px-3 py-1.5 text-sm font-medium transition-colors relative
            ${locale === 'es'
              ? 'bg-primary text-black'
              : 'hover:bg-muted/50'
            }`}
        >
          ES
          {locale === 'es' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/80" />
          )}
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;