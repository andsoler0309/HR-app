'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';

export default function SubscriptionSuccessPage() {
  const t = useTranslations('SubscriptionSuccess');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleSubscriptionSuccess = async () => {
      let currentUser = null;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        currentUser = user;
        
        if (!user) {
          router.push('/auth/login');
          return;
        }

        // Since MercadoPago doesn't allow custom parameters, we'll check for recent pending subscriptions
        // Only allow activation of pending subscriptions created within the last 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        
        // Check if user has a recent pending subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .gte('created_at', tenMinutesAgo)
          .single();

        if (subscription) {
          // User has a recent pending subscription, activate it
          const { error: subscriptionError } = await supabase
            .from('subscriptions')
            .update({
              status: 'active',
              plan_type: 'premium',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .eq('status', 'pending')
            .gte('created_at', tenMinutesAgo); // Extra security

          if (!subscriptionError) {
            // Update profile subscription status
            await supabase
              .from('profiles')
              .update({
                subscription_status: 'premium',
                updated_at: new Date().toISOString()
              })
              .eq('id', user.id);
            
            setSuccess(true);
            console.log(`Subscription activated for user: ${user.id}`);
          } else {
            console.error('Error activating subscription:', subscriptionError);
            await handleFailedActivation(user.id, 'Database error during activation');
          }
        } else {
          // Check if user already has an active subscription
          const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();

          if (existingSubscription) {
            // User already has active subscription
            setSuccess(true);
          } else {
            // No recent pending subscription found
            console.log('No recent pending subscription found for activation');
            await handleFailedActivation(user.id, 'No recent pending subscription found');
            setTimeout(() => {
              router.push('/dashboard/settings?error=no_pending_subscription');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error handling subscription success:', error);
        
        // Only try to handle failed activation if we have a user
        if (currentUser) {
          await handleFailedActivation(currentUser.id, `Activation error: ${error}`);
        }
        
        setTimeout(() => {
          router.push('/dashboard/settings?error=activation_failed');
        }, 3000);
      } finally {
        setIsLoading(false);
      }
    };

    handleSubscriptionSuccess();
  }, [router]);

  // Helper function to handle failed activation attempts
  async function handleFailedActivation(userId: string, reason: string) {
    try {
      // Update any pending subscription to cancelled status
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: `Activation failed: ${reason}`,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'pending');

      // Ensure user profile is set to free
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (subscriptionError) {
        console.error('Error updating failed subscription:', subscriptionError);
      }
      if (profileError) {
        console.error('Error updating profile after failed activation:', profileError);
      }

      console.log(`Failed activation handled for user: ${userId}, reason: ${reason}`);
    } catch (error) {
      console.error('Error handling failed activation:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <div className="p-8 text-center">
          {success ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-4">
                {t('subscriptionActivated')}
              </h1>
              <p className="text-gray-600 mb-6">
                {t('subscriptionActivatedMessage')}
              </p>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="btn-primary px-6 py-3 rounded-lg"
              >
                {t('backToSettings')}
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                {t('subscriptionError')}
              </h1>
              <p className="text-gray-600 mb-6">
                {t('subscriptionErrorMessage')}
              </p>
              <button
                onClick={() => router.push('/dashboard/settings')}
                className="btn-primary px-6 py-3 rounded-lg"
              >
                {t('backToSettings')}
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
