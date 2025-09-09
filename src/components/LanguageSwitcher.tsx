import React from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { Dropdown } from './Dropdown';

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
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === locale);

  const dropdownItems = languages.map(lang => ({
    label: (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{lang.flag}</span>
          <span className="text-sm font-medium">{lang.name}</span>
        </div>
        {locale === lang.code && (
          <Check className="h-4 w-4 text-primary" />
        )}
      </div>
    ),
    onClick: lang.code === 'en' ? onSwitchToEnglish : onSwitchToSpanish
  }));

  return (
    <Dropdown
      trigger={
        <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/50 rounded-md transition-colors border border-card-border">
          {/* <Globe className="h-4 w-4 text-muted-foreground" /> */}
          <span className="text-lg">{currentLanguage?.flag}</span>
          {/* <span className="hidden sm:block">{currentLanguage?.name}</span> */}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      }
      items={dropdownItems}
    />
  );
};

export default LanguageSwitcher;