'use client';
import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Dropdown } from './Dropdown';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const router = useRouter();
  const params = useParams() as { locale: string };
  const { locale } = params;

  const { profile, fetchProfile, signOut } = useAuthStore();
  const t = useTranslations('navbar');
  const tCommon = useTranslations('common');

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
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            {/* Logo or brand space - you can add your logo here */}
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSwitcher
              locale={locale}
              onSwitchToEnglish={switchToEnglish}
              onSwitchToSpanish={switchToSpanish}
            />
            <Dropdown
              trigger={
                <button className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <div className="relative">
                    <img 
                      className="h-11 w-11 rounded-full object-cover border-2 border-card-border"
                      src={profile?.profile_picture || '/avatar.jpg'}
                      alt="" 
                    />
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success ring-2 ring-card" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-md font-medium text-foreground">{profile?.full_name || tCommon('loading')}</p>
                    <p className="text-sm text-text-secondary">{profile?.company || tCommon('company')}</p>
                  </div>
                  <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              }
              items={[
                { label: t('signOut'), onClick: handleSignOut }
              ]}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
