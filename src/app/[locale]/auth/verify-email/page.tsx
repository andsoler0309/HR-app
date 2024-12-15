'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Mail, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function VerifyEmailPage() {
  const t = useTranslations('verifyEmail');
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-16 sm:px-8 lg:px-10">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-card flex items-center justify-center">
              <Mail className="h-10 w-10 text-sunset" />
            </div>
          </div>

          <h2 className="mt-6 text-4xl font-bold text-platinum">
            {t('checkEmail')}
          </h2>
          <p className="mt-4 text-base text-sunset">
            {t('sentVerificationLink')}
          </p>
        </div>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-card py-10 px-8 shadow-md sm:rounded-xl border border-card-border">
          <div className="text-center space-y-8">
            {email && (
              <div className="p-4 bg-card rounded-lg border border-card-border">
                <p className="text-base text-sunset">
                  {t('emailSent', { email })}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-base text-sunset bg-background p-4 rounded-lg border border-card-border">
                <CheckCircle2 className="w-6 h-6 text-sunset shrink-0" />
                <p className="text-left">{t('clickLink')}</p>
              </div>

              <div className="flex items-center gap-3 text-base text-sunset bg-background p-4 rounded-lg border border-card-border">
                <CheckCircle2 className="w-6 h-6 text-sunset shrink-0" />
                <p className="text-left">{t('afterVerification')}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.location.href = '/auth/login'}
              className="btn-primary w-full flex justify-center items-center gap-3 py-3 px-4 rounded-lg shadow-sm text-base font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('returnToLogin')}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-card-border" />
              </div>
              <div className="relative flex justify-center text-base">
                <span className="px-4 bg-card text-text-muted">
                  {t('didNotReceiveEmail')}
                </span>
              </div>
            </div>

            {/* <div className="mt-8">
              <Link
                href="/auth/resend-verification"
                className="btn-secondary w-full inline-flex justify-center py-3 px-4 border border-card-border rounded-lg text-base font-medium"
              >
                {t('clickToResend')}
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}