import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { SubscriptionLimitError } from '@/lib/subscriptions-limits';

interface SubscriptionLimitNotificationProps {
  error: SubscriptionLimitError;
  onClose?: () => void;
}

export function SubscriptionLimitNotification({ 
  error, 
  onClose 
}: SubscriptionLimitNotificationProps) {
  const t = useTranslations('SubscriptionLimit');
  const router = useRouter();

  const handleUpgrade = () => {
    router.push('/dashboard/settings?tab=subscription');
    onClose?.();
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-amber-400" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Free Plan Limit Reached
          </h3>
          <div className="mt-2 text-sm text-amber-700">
            <p>{error.message}</p>
            <p className="mt-1">
              You're currently using {error.currentCount} out of {error.limit} {error.resourceType}.
            </p>
          </div>
          {error.canUpgrade && (
            <div className="mt-4">
              <div className="flex space-x-3">
                <button
                  onClick={handleUpgrade}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Upgrade to Premium
                </button>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-amber-800 hover:text-amber-900 text-sm font-medium"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Utility function to check if an error is a subscription limit error
export function isSubscriptionLimitError(error: any): error is SubscriptionLimitError {
  return error instanceof SubscriptionLimitError;
}

// Hook to handle subscription limit errors
export function useSubscriptionLimitHandler() {
  const handleError = (error: unknown): { 
    isLimitError: boolean; 
    component?: React.ReactElement 
  } => {
    if (isSubscriptionLimitError(error)) {
      return {
        isLimitError: true,
        component: <SubscriptionLimitNotification error={error} />
      };
    }
    
    return { isLimitError: false };
  };

  return { handleError };
}
