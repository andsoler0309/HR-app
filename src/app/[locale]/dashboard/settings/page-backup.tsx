

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { createPayUCheckout } from '@/lib/payu';
import CancelSubscriptionModal from '@/components/settings/CancelSubscriptionModal';
import PayUSubscriptionForm from '@/components/settings/PayUCheckoutForm';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  company_name: z.string().min(2, 'Company name is required'), // CORRECTED: Using company_name
  email: z.string().email('Invalid email address')
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const t = useTranslations('SettingsPage');
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'premium'>('free');
  const [employeeCount, setEmployeeCount] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema)
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      fetchProfile();
      fetchEmployeeCount();
    }
  }, [isHydrated]);

  async function fetchProfile() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser || !authUser.email) {
        return;
      }

      setUser({
        id: authUser.id,
        email: authUser.email
      });

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      if (data) {
        reset({
          full_name: data.full_name,
          company_name: data.company_name,
          email: data.email
        });

        setProfileUrl(data.profile_picture);
        setSubscriptionStatus(data.subscription_status || 'free');
      }

      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (!subscriptionError) {
        setSubscription(subscriptionData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  async function fetchEmployeeCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .eq('company_id', user.id);

      if (error) throw error;

      setEmployeeCount(count || 0);
    } catch (error) {
      console.error('Error fetching employee count:', error);
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      let profilePictureUrl = profileUrl;
      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop();
        const filePath = `${user.id}/profile.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, profilePicture, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        profilePictureUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          company_name: data.company_name,
          email: data.email,
          profile_picture: profilePictureUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: false,
          cancelled_at: null,
          cancellation_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('status', 'active')

      if (error) throw error

      fetchProfile()
    } catch (err) {
      console.error('Error reactivating subscription:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isHydrated) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-platinum mb-8">{t('title')}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('profileSettings')}</h2>
            {error && <ErrorMessage message={error} className="mb-4" />}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-base font-medium text-sunset mb-2">
                  {t('profilePicture')}
                </label>
                <div className="flex items-center space-x-4">
                  <img
                    src={profileUrl || '/avatar.jpg'}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium text-sunset mb-1">
                  {t('fullName')}
                </label>
                <input
                  {...register('full_name')}
                  className="input-base w-full"
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-error">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-sunset mb-2">
                  {t('companyName')}
                </label>
                <input
                  {...register('company_name')} // CORRECTED: Using company_name
                  className="input-base w-full"
                />
                {errors.company_name && ( // CORRECTED: Using company_name
                  <p className="mt-1 text-sm text-error">{errors.company_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-sunset mb-2">
                  {t('email')}
                </label>
                <input
                  {...register('email')}
                  className="input-base w-full bg-gray-700"
                  disabled
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary px-6 py-3 text-base disabled:opacity-50 rounded-lg w-full "
              >
                {isLoading ? <LoadingSpinner /> : t('saveChanges')}
              </button>
            </form>
          </div>
        </Card>

        {/* Subscription Settings */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t('subscription')}</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-sunset">{t('currentPlan')}</h3>
                  <p className="text-sm text-primary">
                    {subscriptionStatus === 'premium' ? t('premium') : t('free')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscriptionStatus === 'premium'
                    ? 'bg-success text-platinum'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {subscriptionStatus === 'premium' ? t('active') : t('limited')}
                </span>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">{t('planFeatures')}</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className={subscriptionStatus === 'premium' ? 'text-green-500' : 'text-gray-500'}>✓</span>
                    <span className="ml-2">
                      {subscriptionStatus === 'premium'
                        ? t('unlimitedEmployees')
                        : t('freeLimitEmployees', { count: 1 })}
                    </span>
                  </li>
                  <li className="flex items-center">
                    <span className={subscriptionStatus === 'premium' ? 'text-green-500' : 'text-gray-400'}>
                      {subscriptionStatus === 'premium' ? '✓' : '×'}
                    </span>
                    <span className="ml-2">{t('documentManagement')}</span>
                  </li>
                  <li className="flex items-center">
                    <span className={subscriptionStatus === 'premium' ? 'text-green-500' : 'text-gray-400'}>
                      {subscriptionStatus === 'premium' ? '✓' : '×'}
                    </span>
                    <span className="ml-2">{t('advancedReports')}</span>
                  </li>
                </ul>
              </div>

              {subscriptionStatus === 'free' && user && (
                <div className="mt-4 pt-4 border-t">
                  <PayUSubscriptionForm
                    isLoading={isLoading}
                    user={user}
                    fullName={watch('full_name') || ''}
                    amount="20000"
                    currency="COP"
                    description={t('premium')}
                    handleBeforeSubmit={async () => {
                      if (!user) throw new Error('No authenticated user');

                      // Usar upsert para evitar duplicados
                      const { data: subscription, error: subscriptionError } = await supabase
                        .from('subscriptions')
                        .upsert({
                          user_id: user.id,
                          status: 'trialing',
                          plan_type: 'premium',
                          current_period_start: new Date().toISOString(),
                          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString()
                        }, {
                          onConflict: 'user_id'
                        })
                        .select()
                        .single();

                      if (subscriptionError) throw subscriptionError;
                    }}
                  />
                </div>
              )}

              {subscriptionStatus === 'premium' && !subscription?.cancel_at_period_end && (
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="bg-red-700 px-6 py-3 text-base disabled:opacity-50 rounded-lg w-full"
                  >
                    {t('cancelSubscription')}
                  </button>
                </div>
              )}

              {subscription?.cancel_at_period_end && (
                <div className="mt-4 pt-4 border-t">
                  <div className="bg-warning/10 p-4 rounded-lg">
                    <p className="text-sm font-medium text-warning">
                      {t('subscriptionWillEnd', {
                        date: new Date(subscription.current_period_end).toLocaleDateString()
                      })}
                    </p>
                    <button
                      onClick={handleReactivateSubscription}
                      className="btn-primary mt-2 w-full"
                    >
                      {t('reactivateSubscription')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onCancelled={() => {
          fetchProfile();
          setShowCancelModal(false);
        }}
      />
    </div>
  );
}
