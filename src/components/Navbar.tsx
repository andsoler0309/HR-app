'use client';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Dropdown } from './Dropdown';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import { Menu, HelpCircle, GraduationCap, RefreshCw } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useHelp } from '@/context/HelpContext';
import NotificationModal from './shared/NotificationModal';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const params = useParams() as { locale: string };
  const pathname = usePathname();
  const { locale } = params;

  const { profile, fetchProfile, signOut } = useAuthStore();
  const { resetOnboarding } = useOnboarding();
  const { showTour, showHelp } = useHelp();
  const t = useTranslations('navbar');
  const tCommon = useTranslations('common');

  // Modal states
  const [showTourModal, setShowTourModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push(`/${locale}/auth/login`);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleShowTour = () => {
    // Check if current page has tour available
    const currentPath = pathname.split('/').pop();
    const pagesWithTours = ['employees', 'time-off', 'documents'];
    
    if (pagesWithTours.includes(currentPath || '')) {
      showTour();
    } else {
      // Show modal for pages without tour
      setShowTourModal(true);
    }
  };

  const handleShowHelp = () => {
    // Check if current page has help content available
    const currentPath = pathname.split('/').pop();
    const pagesWithHelp = ['employees', 'time-off', 'documents'];
    
    if (pagesWithHelp.includes(currentPath || '')) {
      showHelp();
    } else {
      // Show modal for pages without help
      setShowHelpModal(true);
    }
  };

  const handleGoToEmployees = () => {
    setShowTourModal(false);
    router.push(`/${locale}/dashboard/employees`);
  };

  const handleGoToEmployeesFromHelp = () => {
    setShowHelpModal(false);
    router.push(`/${locale}/dashboard/employees`);
  };

  const handleRestartOnboarding = () => {
    resetOnboarding();
    // Refresh the page to show onboarding progress
    window.location.reload();
  };

  const switchToEnglish = () => {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    pathSegments[0] = 'en';
    router.push('/' + pathSegments.join('/'));
  };

  const switchToSpanish = () => {
    const currentPath = window.location.pathname;
    const pathSegments = currentPath.split('/').filter(Boolean);
    pathSegments[0] = 'es';
    router.push('/' + pathSegments.join('/'));
  };

  return (
    <nav className="bg-card border-b border-navbar-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-md text-sunset hover:text-platinum hover:bg-background transition-colors"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            {/* Mobile logo - only show on mobile when sidebar is closed */}
            <div className="lg:hidden">
              <h1 className="text-lg font-bold text-primary">NodoHR</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <LanguageSwitcher
              locale={locale}
              onSwitchToEnglish={switchToEnglish}
              onSwitchToSpanish={switchToSpanish}
            />
            <Dropdown
              trigger={
                <button className="flex items-center space-x-3 sm:space-x-4 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <div className="relative">
                    <img 
                      className="h-8 w-8 sm:h-11 sm:w-11 rounded-full object-cover border-2 border-card-border"
                      src={profile?.profile_picture || '/avatar.jpg'}
                      alt="" 
                    />
                    <span className="absolute bottom-0 right-0 block h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-success ring-1 sm:ring-2 ring-card" />
                  </div>
                  <div className="hidden md:block text-left min-w-0 flex-1">
                    <p className="text-sm sm:text-md font-medium text-foreground truncate">{profile?.full_name || tCommon('loading')}</p>
                    <p className="text-xs sm:text-sm text-text-secondary truncate">{profile?.company || tCommon('company')}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              }
              items={[
                { 
                  label: t('help.takeTour'), 
                  onClick: handleShowTour,
                  icon: <GraduationCap className="h-4 w-4" />
                },
                { 
                  label: t('help.showHelp'), 
                  onClick: handleShowHelp,
                  icon: <HelpCircle className="h-4 w-4" />
                },
                { 
                  label: t('help.restartOnboarding'), 
                  onClick: handleRestartOnboarding,
                  icon: <RefreshCw className="h-4 w-4" />
                },
                { 
                  label: '---', 
                  onClick: () => {},
                  disabled: true 
                },
                { 
                  label: t('signOut'), 
                  onClick: handleSignOut 
                }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Tour Modal */}
      <NotificationModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        title={t('help.takeTour')}
        message={t('help.noTourAvailable')}
        type="tour"
        actionButton={{
          label: t('help.goToEmployees'),
          onClick: handleGoToEmployees
        }}
        cancelButton={{
          label: t('help.cancel'),
          onClick: () => setShowTourModal(false)
        }}
      />

      {/* Help Modal */}
      <NotificationModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title={t('help.showHelp')}
        message={t('help.noHelpAvailable')}
        type="help"
        actionButton={{
          label: t('help.goToEmployees'),
          onClick: handleGoToEmployeesFromHelp
        }}
        cancelButton={{
          label: t('help.cancel'),
          onClick: () => setShowHelpModal(false)
        }}
      />
    </nav>
  );
}
